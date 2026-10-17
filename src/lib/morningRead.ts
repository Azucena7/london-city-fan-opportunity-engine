// The Morning Commercial Read: what changed around the next home fixtures, in the order a
// commercial lead would read it. Every line comes from the latest refresh; a signal family
// with no connected source says so instead of reading as "nothing happened".
import { weatherLevel } from "@/lib/weatherThresholds";

type Fixture = { id: string; date: string; kickoff?: string; opponent: string; homeAway: string; status?: string };
type FixtureScore = { fixtureId: string; level: string; timeGapMinutes?: number | null; distanceKm?: number | null };
type LandscapeEvent = { name: string; date: string; competition?: string; fixtureScores?: FixtureScore[] };
type Signal = { id: string; fixtureId?: string; state: string; title: { en: string } };
type Weather = { valid_for?: string; temperature_max?: number; precipitation_probability_max?: number; wind_speed_max?: number } | null | undefined;
type HealthSource = { id: string; state: string };
type RoadIncident = { location: string | null; startDate: string | null; endDate: string | null; distanceKm: number | null; material: boolean };
type RoadSnapshot = { lastSuccessfulAt: string | null; incidents: RoadIncident[] } | null | undefined;
type RailDisruption = { line: string; status: string; reason: string | null };
type RailSnapshot = { lastSuccessfulAt: string | null; days: Array<{ date: string; disruptions: RailDisruption[] }> } | null | undefined;
/** Where a played fixture's buyers came from, by postcode district, from the club's authorised aggregate. */
type SupporterOrigins = {
  fixtureId: string;
  supporters: number | null;
  districts: Array<{ district: string; supporters: number }>;
} | null | undefined;
type Opportunity = {
  fixtureId: string;
  fixture: { opponent: string };
  opportunityLabel: string;
  opportunity: string;
  recommendedAction: string;
  decisionState: string;
  primaryBlocker: string;
};

export type MorningReadLine = {
  id: "pressure" | "broadcast" | "weather" | "calendar" | "transport" | "origins" | "opportunity" | "move";
  label: string;
  headline: string;
  detail: string | null;
  state: "live" | "not-connected";
};

export type MorningReadInput = {
  today: string;
  calendar: Fixture[];
  events: LandscapeEvent[];
  signals: Signal[];
  weather: Weather;
  sources: HealthSource[];
  live: Opportunity | null;
  moments?: Array<{ fixtureId: string; label: string }>;
  road?: RoadSnapshot;
  rail?: RailSnapshot;
  origins?: SupporterOrigins;
  horizon?: number;
};

function day(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** The approach roads: the stored snapshot covers 15 km, the read speaks only for this radius. */
export const ROAD_NEAR_KM = 5;

/** Material road incidents near the venue whose listed dates cover the fixture day. Open-ended ones count. */
export function roadClosuresOn(incidents: RoadIncident[], date: string) {
  return incidents.filter((item) => item.material && item.distanceKm !== null && item.distanceKm <= ROAD_NEAR_KM
    && (!item.startDate || item.startDate <= date) && (!item.endDate || item.endDate >= date));
}

export function buildMorningRead({ today, calendar, events, signals, weather, sources, live, moments = [], road = null, rail = null, origins = null, horizon = 4 }: MorningReadInput): MorningReadLine[] {
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, horizon);
  const next = upcoming[0] ?? null;
  const operational = new Set(sources.filter((source) => source.state === "operational").map((source) => source.id));
  const lines: MorningReadLine[] = [];

  // External attendance pressure: the strongest high-level clash for each upcoming fixture.
  const pressured = upcoming.flatMap((fixture) => {
    const clash = events
      .flatMap((event) => (event.fixtureScores ?? [])
        .filter((score) => score.fixtureId === fixture.id && score.level === "high")
        .map((score) => ({ event, score })))
      .sort((a, b) => (a.score.timeGapMinutes ?? 999) - (b.score.timeGapMinutes ?? 999))[0];
    return clash ? [{ fixture, clash }] : [];
  });
  lines.push({
    id: "pressure",
    label: "Attendance pressure",
    headline: pressured.length
      ? `${pressured.length} of the next ${upcoming.length} home fixtures face external attendance pressure`
      : `No high external pressure on the next ${upcoming.length} home fixtures`,
    detail: pressured.length
      ? pressured
          .slice(0, 2)
          .map(({ fixture, clash }) => `${fixture.opponent} (${day(fixture.date)}): ${clash.event.name}${clash.score.timeGapMinutes === 0 ? " in the same slot" : clash.score.timeGapMinutes != null ? ` ${clash.score.timeGapMinutes} min apart` : ""}`)
          .join("; ")
      : null,
    state: operational.has("ticketmaster-events") ? "live" : "not-connected"
  });

  if (next) {
    const broadcast = signals.find((signal) => signal.fixtureId === next.id && signal.id.startsWith("broadcast") && signal.state === "confirmed");
    lines.push({
      id: "broadcast",
      label: "Broadcast window",
      headline: broadcast ? broadcast.title.en : `No broadcast pick confirmed for ${next.opponent}`,
      detail: broadcast ? "Sell what the stadium adds that the broadcast cannot." : null,
      state: operational.has("club-public-web") ? "live" : "not-connected"
    });

    const forecast = weather && weather.valid_for === next.date && weather.temperature_max != null && weather.precipitation_probability_max != null;
    lines.push({
      id: "weather",
      label: "Weather",
      headline: forecast
        ? weatherLevel(weather.precipitation_probability_max, weather.wind_speed_max) === "high"
          ? `${weather.precipitation_probability_max}% rain risk for ${next.opponent}: prepare the wet-weather message`
          : `${Math.round(weather.temperature_max!)}° and ${weather.precipitation_probability_max}% rain risk for ${next.opponent}: no weather change to the plan`
        : `No forecast yet for ${next.opponent}`,
      detail: forecast ? "Forecast, not an observed matchday outcome." : null,
      state: operational.has("open-meteo") ? "live" : "not-connected"
    });
  }

  // Calendar moments: bank holidays and international windows around the next home fixtures.
  const upcomingIds = new Set(upcoming.map((fixture) => fixture.id));
  const nearMoments = moments.filter((moment) => upcomingIds.has(moment.fixtureId));
  const holidaysLive = operational.has("uk-bank-holidays");
  const windowsLive = operational.has("fifa-international-windows");
  lines.push({
    id: "calendar",
    label: "Calendar moments",
    headline: nearMoments[0]?.label ?? `No bank holiday or international window around the next ${upcoming.length} home fixtures`,
    detail: [
      ...nearMoments.slice(1, 3).map((moment) => moment.label),
      ...(holidaysLive ? [] : ["Bank holidays join after the first GOV.UK refresh."])
    ].join(" ") || null,
    state: holidaysLive || windowsLive ? "live" : "not-connected"
  });

  // Transport: road closures and rail status on the next home fixture days, each from its own
  // TfL snapshot. A mode with no stored snapshot says so instead of reading as clear.
  const roadLive = operational.has("tfl-road") && Boolean(road?.lastSuccessfulAt);
  const railLive = operational.has("tfl-national-rail") && Boolean(rail?.lastSuccessfulAt);
  const roadHits = roadLive
    ? upcoming.flatMap((fixture) => {
        const closures = roadClosuresOn(road!.incidents, fixture.date);
        return closures.length ? [{ fixture, closures }] : [];
      })
    : [];
  const railHits = railLive
    ? upcoming.flatMap((fixture) => {
        const disruptions = rail!.days.find((entry) => entry.date === fixture.date)?.disruptions ?? [];
        return disruptions.length ? [{ fixture, disruptions }] : [];
      })
    : [];
  const railRead = railLive ? new Set(rail!.days.map((entry) => entry.date)) : new Set<string>();
  const railCovers = upcoming.filter((fixture) => railRead.has(fixture.date)).length;

  if (roadLive || railLive) {
    const firstRail = railHits[0];
    const firstRoad = roadHits[0];
    const clearModes = [roadLive && !firstRoad ? "road closure" : null, railLive && !firstRail ? "rail disruption" : null].filter(Boolean);
    const headline = firstRail
      ? `${firstRail.disruptions[0].line}: ${firstRail.disruptions[0].status.toLowerCase()} on ${firstRail.fixture.opponent} day (${day(firstRail.fixture.date)})`
      : firstRoad
        ? `${firstRoad.closures.length} listed road ${firstRoad.closures.length === 1 ? "closure" : "closures"} within ${ROAD_NEAR_KM} km of Hayes Lane on ${firstRoad.fixture.opponent} day (${day(firstRoad.fixture.date)})`
        // Never claim clear days that were not read: rail may cover fewer days than the window.
        : `No listed ${clearModes.join(" or ")} ${roadLive && !firstRoad ? `within ${ROAD_NEAR_KM} km of` : "near"} Hayes Lane on ${(railLive ? railCovers : upcoming.length) === 1 ? "the next home fixture day" : `the next ${railLive ? railCovers : upcoming.length} home fixture days`}`;
    const detail = [
      ...(firstRail?.disruptions[0].reason ? [firstRail.disruptions[0].reason] : []),
      ...(firstRail && firstRoad ? [`Road: ${firstRoad.closures.length} listed ${firstRoad.closures.length === 1 ? "closure" : "closures"} on ${firstRoad.fixture.opponent} day.`] : []),
      ...(!firstRail && firstRoad ? firstRoad.closures.slice(0, 2).map((item) => `${(item.location ?? "Unnamed location").replace(/\s+([,)])/g, "$1")} · ${item.distanceKm} km`) : []),
      ...(railLive && railCovers < upcoming.length ? [`Rail status read for ${railCovers} of ${upcoming.length} fixture days.`] : []),
      `TfL snapshot of ${day((railLive ? rail!.lastSuccessfulAt! : road!.lastSuccessfulAt!).slice(0, 10))}: works not yet published cannot appear.`,
      ...(roadLive ? [] : ["Road disruption is not connected yet."]),
      ...(railLive ? [] : ["Rail disruption is not connected yet."])
    ].join(" ");
    lines.push({ id: "transport", label: "Transport", headline, detail, state: "live" });
  } else {
    lines.push({
      id: "transport",
      label: "Transport",
      headline: "Road and rail disruption is not connected yet",
      detail: "TfL road and rail status join after the first daily refresh. No disruption is inferred without them.",
      state: "not-connected"
    });
  }

  lines.push(originsLine(origins, calendar));

  if (live) {
    lines.push({
      id: "opportunity",
      label: live.opportunityLabel,
      headline: live.opportunity,
      detail: null,
      state: "live"
    });
    lines.push({
      id: "move",
      label: "Recommended next move",
      headline: live.recommendedAction,
      detail: live.decisionState === "HOLD" ? `On hold until: ${live.primaryBlocker}.` : null,
      state: "live"
    });
  }

  return lines;
}

/**
 * Where the last observed crowd travelled from, so travel messages and activations can follow the
 * real corridors. Postcode districts only, from the club's authorised aggregate; without it the
 * line says so and nothing is inferred from public data.
 */
export function originsLine(origins: SupporterOrigins, calendar: Fixture[]): MorningReadLine {
  const fixture = origins ? calendar.find((item) => item.id === origins.fixtureId) : undefined;
  if (!origins || !origins.supporters || !origins.districts.length) {
    return {
      id: "origins",
      label: "Supporter origins",
      headline: "Where supporters travel from needs the club's ticketing aggregate",
      detail: "Postcode districts come only from the authorised export, counted once per supporter. Nothing is inferred from public data.",
      state: "not-connected"
    };
  }
  const top = origins.districts.slice(0, 3);
  const share = Math.round((top.reduce((sum, item) => sum + item.supporters, 0) / origins.supporters) * 100);
  const where = top.map((item) => item.district).join(", ").replace(/, ([^,]*)$/, " and $1");
  const label = fixture ? `${fixture.opponent} (${day(fixture.date)})` : origins.fixtureId;
  return {
    id: "origins",
    label: "Supporter origins",
    headline: `${share}% of ${label} buyers came from ${where}`,
    detail: "Postcode districts from the club's authorised ticketing aggregate; districts under 10 supporters are withheld. Read it with the transport line before choosing travel messages or route activations.",
    state: "live"
  };
}
