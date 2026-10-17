// Engine drafts: one prepared move for each upcoming home fixture that has no curated campaign
// plan, derived only from signals AVELA already holds. A draft is a starting point for the
// club team — it carries no audience size, budget or forecast, and every gate stays open.
import { weatherLevel } from "@/lib/weatherThresholds";

type Fixture = { id: string; date: string; opponent: string; homeAway: string; status?: string };
type Signal = {
  id: string;
  fixtureId?: string;
  category: string;
  state: string;
  materiality: string;
  title: { en: string };
  marketingAction: { en: string };
  sourceName: string;
  observedAt?: string;
};
type FixtureScore = { fixtureId: string; level: string; timeGapMinutes?: number | null };
type LandscapeEvent = { name: string; fixtureScores?: FixtureScore[] };
type Moment = { fixtureId: string; kind: string; label: string };
type Weather = { valid_for?: string; precipitation_probability_max?: number; wind_speed_max?: number } | null | undefined;

export type PreparedMoveReason = { label: string; source: string };

export type PreparedMove = {
  fixtureId: string;
  opponent: string;
  date: string;
  move: string;
  /** When the move comes from a reviewed signal: the date its action was written, since it may say "today". */
  moveRecordedAt: string | null;
  /** Set when the action's own timing has run out: "today" from an earlier day, or dated steps already passed. */
  timingNote: string | null;
  ownerRole: string;
  prepareBy: string;
  late: boolean;
  because: PreparedMoveReason[];
  gates: string[];
  measurement: string;
};

export type PreparedMoveInput = {
  today: string;
  fixtures: Fixture[];
  signals: Signal[];
  events: LandscapeEvent[];
  moments: Moment[];
  weather: Weather;
  plannedFixtureIds: Set<string>;
  horizon?: number;
};

const OWNER_BY_CATEGORY: Record<string, string> = {
  demand: "Ticketing & CRM",
  access: "Ticketing & CRM",
  attention: "Content",
  consumer: "Marketing",
  sponsorship: "Partnerships",
  weather: "Matchday operations"
};

function firstSentence(text: string) {
  const match = text.match(/^.+?[.;](?=\s|$)/);
  return (match ? match[0] : text).replace(/;$/, ".").trim();
}

function shiftDate(date: string, days: number) {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const RELATIVE = /\b(today|tonight|tomorrow|this (?:morning|afternoon|evening|week|weekend))\b/i;

function shortDay(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * Whether an action written on `recordedAt` still reads correctly on `today`. Relative words
 * ("today", "this week") meant the day it was written; explicit dates ("12 October") are read
 * in the year the action was written, or the next one when they fall well before it.
 */
export function actionTiming(action: string, recordedAt: string | null, today: string): string | null {
  if (!recordedAt || recordedAt >= today) return null;
  const parts: string[] = [];
  const relative = action.match(RELATIVE);
  if (relative) parts.push(`"${relative[1].toLowerCase()}" meant ${shortDay(recordedAt)}`);

  const year = Number(recordedAt.slice(0, 4));
  const passed = [...action.matchAll(/\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December)\b/gi)]
    .map((match) => {
      const month = String(MONTHS.indexOf(match[2].toLowerCase()) + 1).padStart(2, "0");
      const date = `${year}-${month}-${match[1].padStart(2, "0")}`;
      return shiftDate(date, 0) < shiftDate(recordedAt, -180) ? `${year + 1}${date.slice(4)}` : date;
    })
    .filter((date, index, all) => date < today && all.indexOf(date) === index);
  if (passed.length) parts.push(`${passed.map(shortDay).join(" and ")} ${passed.length > 1 ? "have" : "has"} passed`);

  return parts.length ? `Timing out of date: written ${shortDay(recordedAt)}, ${parts.join("; ")}. Re-time the steps before using it.` : null;
}

export const PREPARATION_HORIZON = 6;

/** The next home fixtures inside the preparation window, in date order. */
export function preparationWindow(fixtures: Fixture[], today: string, horizon = PREPARATION_HORIZON) {
  return fixtures
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, horizon);
}

export function buildPreparedMoves({ today, fixtures, signals, events, moments, weather, plannedFixtureIds, horizon = PREPARATION_HORIZON }: PreparedMoveInput): PreparedMove[] {
  const upcoming = preparationWindow(fixtures, today, horizon);

  return upcoming.flatMap((fixture) => {
    if (plannedFixtureIds.has(fixture.id)) return [];

    const curated = signals
      .filter((signal) => signal.fixtureId === fixture.id && signal.state === "confirmed" && signal.materiality === "high")
      .filter((signal) => OWNER_BY_CATEGORY[signal.category]);
    const clash = events
      .flatMap((event) => (event.fixtureScores ?? [])
        .filter((score) => score.fixtureId === fixture.id && score.level === "high")
        .map((score) => ({ event, score })))
      .sort((a, b) => (a.score.timeGapMinutes ?? 999) - (b.score.timeGapMinutes ?? 999))[0];
    const fixtureMoments = moments.filter((moment) => moment.fixtureId === fixture.id);
    const holiday = fixtureMoments.find((moment) => moment.kind === "bank-holiday");
    const afterWindow = fixtureMoments.find((moment) => moment.kind === "after-window");
    const beforeWindow = fixtureMoments.find((moment) => moment.kind === "before-window");
    const wet = weather?.valid_for === fixture.date && weatherLevel(weather.precipitation_probability_max, weather.wind_speed_max) === "high";

    const because: PreparedMoveReason[] = [
      ...curated.map((signal) => ({ label: signal.title.en, source: signal.sourceName })),
      ...(clash ? [{ label: `${clash.event.name}${clash.score.timeGapMinutes === 0 ? " in the same slot" : " in a nearby slot"}`, source: "Event landscape" }] : []),
      ...fixtureMoments.map((moment) => ({ label: moment.label, source: moment.kind === "bank-holiday" ? "GOV.UK bank holidays" : moment.kind === "school-holiday" ? "Council school term dates" : "FIFA international windows" })),
      ...(wet ? [{ label: `${weather?.precipitation_probability_max}% rain risk on matchday`, source: "Open-Meteo forecast" }] : [])
    ];
    if (!because.length) return [];

    // One primary move, in order of how directly the signal names an action.
    const primary =
      curated[0] ? { move: firstSentence(curated[0].marketingAction.en), ownerRole: OWNER_BY_CATEGORY[curated[0].category], recordedAt: curated[0].observedAt?.slice(0, 10) ?? null }
      : clash ? { move: `Re-invite recent and local buyers early, before ${clash.event.name} competes for attention in ${clash.score.timeGapMinutes === 0 ? "the same slot" : "a nearby slot"}.`, ownerRole: "Ticketing & CRM" }
      : holiday ? { move: `Pitch ${fixture.opponent} as the bank holiday family day out.`, ownerRole: "Marketing" }
      : afterWindow ? { move: `Build the "internationals return" story with player-led content in the week before ${fixture.opponent}.`, ownerRole: "Content" }
      : beforeWindow ? { move: `Use ${fixture.opponent}, the last home match before the break, to sell the next home fixture.`, ownerRole: "Ticketing & CRM" }
      : { move: "Send a wet-weather matchday message: what is covered and what to bring.", ownerRole: "Matchday operations" };

    const recordedAt = "recordedAt" in primary ? primary.recordedAt ?? null : null;
    const target = shiftDate(fixture.date, -7);
    const prepareBy = target < today ? today : target;
    return [{
      fixtureId: fixture.id,
      opponent: fixture.opponent,
      date: fixture.date,
      move: primary.move,
      moveRecordedAt: recordedAt,
      timingNote: actionTiming(primary.move, recordedAt, today),
      ownerRole: primary.ownerRole,
      prepareBy,
      late: target < today,
      because,
      gates: [
        "Assign a club owner",
        "Approve the message and the official offer",
        ...(primary.ownerRole === "Ticketing & CRM" ? ["Confirm consented audience access"] : []),
        "Agree how the outcome will be measured"
      ],
      measurement: "Tagged clicks to the official ticket page. Purchases, scans and repeat attendance need authorised club data."
    }];
  });
}
