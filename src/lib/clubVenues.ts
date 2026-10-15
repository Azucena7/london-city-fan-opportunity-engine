// A club's venues and their capacity, entered once in Club setup. This is club-level operating
// context, not supporter data: it gives occupancy and venue scenarios a denominator, and gives
// future ticketing and access sources a venue key to report against.

export type VenueCapacityState = "club-confirmed" | "public-reported" | "missing";

export type ClubVenue = {
  id: string;
  name: string;
  /** Other spellings used by fixture feeds, so "The CopperJax Community Stadium, Bromley" and
   *  "CopperJax Community Stadium" resolve to the same venue. */
  aliases: string[];
  home: boolean;
  /** Safety-certificate or licensed capacity. */
  totalCapacity: number | null;
  /** What can actually be sold for a home fixture, after away, segregation and hospitality holds. */
  sellableCapacity: number | null;
  capacityState: VenueCapacityState;
  /** Where the figure comes from, e.g. "Safety certificate 2026/27" or a public page. */
  source: string;
  asOf: string | null;
};

export const MAX_VENUES = 10;
export const MAX_ALIASES = 10;
const MAX_CAPACITY = 200_000;
const STATES: VenueCapacityState[] = ["club-confirmed", "public-reported", "missing"];

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function capacity(value: unknown) {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof number === "number" && Number.isInteger(number) && number > 0 && number <= MAX_CAPACITY ? number : null;
}

function isoDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z")) ? value : null;
}

/** Normalises a venue name for matching: case, punctuation, a leading "The" and a trailing ", Town". */
export function venueKey(name: string) {
  return name
    .toLowerCase()
    .split(",")[0]
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/^\s*the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keeps only well-formed venues. A capacity that is missing stays missing (never 0); a sellable
 * figure above the total is dropped rather than trusted; without a figure the state is "missing".
 */
export function sanitiseVenues(input: unknown): ClubVenue[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const venues: ClubVenue[] = [];
  for (const raw of input.slice(0, MAX_VENUES)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const name = text(item.name, 120);
    if (!name || seen.has(venueKey(name))) continue;
    seen.add(venueKey(name));
    const totalCapacity = capacity(item.totalCapacity);
    const sellable = capacity(item.sellableCapacity);
    const sellableCapacity = sellable !== null && (totalCapacity === null || sellable <= totalCapacity) ? sellable : null;
    const state = STATES.includes(item.capacityState as VenueCapacityState) ? item.capacityState as VenueCapacityState : "missing";
    const aliases = Array.isArray(item.aliases)
      ? [...new Set(item.aliases.map((alias) => text(alias, 120)).filter((alias) => alias && venueKey(alias) !== venueKey(name)))].slice(0, MAX_ALIASES)
      : [];
    venues.push({
      id: text(item.id, 64) || venueKey(name).replace(/ /g, "-"),
      name,
      aliases,
      home: item.home === true,
      totalCapacity,
      sellableCapacity,
      capacityState: totalCapacity === null && sellableCapacity === null ? "missing" : state === "missing" ? "public-reported" : state,
      source: text(item.source, 200),
      asOf: isoDate(item.asOf)
    });
  }
  return venues;
}

/** The configured venue a fixture's venue name refers to, by name or alias. */
export function matchVenue(name: string | null | undefined, venues: ClubVenue[]): ClubVenue | null {
  if (!name) return null;
  const key = venueKey(name);
  if (!key) return null;
  return venues.find((venue) => [venue.name, ...venue.aliases].some((candidate) => venueKey(candidate) === key)) ?? null;
}

/**
 * Occupancy against the sellable figure (falling back to total). Null when either side is
 * unknown, so a missing capacity never turns into 0% or 100%.
 */
export function occupancy(attendance: number | null | undefined, venue: ClubVenue | null) {
  const denominator = venue?.sellableCapacity ?? venue?.totalCapacity ?? null;
  if (denominator === null || typeof attendance !== "number" || !Number.isFinite(attendance) || attendance < 0) return null;
  return attendance / denominator;
}

/** The occupancy line for a played fixture, saying exactly which piece is missing when it cannot be computed. */
export function occupancySummary(attendance: number | null | undefined, venueName: string | null | undefined, venues: ClubVenue[]) {
  if (!venues.length) return { value: "Capacity not configured", detail: "Add venues in Club setup." };
  const venue = matchVenue(venueName, venues);
  if (!venue) return { value: "Venue not configured", detail: `${venueName || "This venue"} is not in Club setup.` };
  const share = occupancy(attendance, venue);
  if (share === null) {
    return { value: venue.totalCapacity === null && venue.sellableCapacity === null ? "Capacity missing" : "Attendance not recorded", detail: venue.name };
  }
  const basis = venue.sellableCapacity !== null ? "sellable" : "total";
  const state = venue.capacityState === "club-confirmed" ? "club-confirmed capacity" : "public capacity, not verified";
  return { value: `${Math.round(share * 100)}% of ${basis} capacity`, detail: `${venue.name} · ${state}` };
}
