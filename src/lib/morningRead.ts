// The Morning Commercial Read: what changed around the next home fixtures, in the order a
// commercial lead would read it. Every line comes from the latest refresh; a signal family
// with no connected source says so instead of reading as "nothing happened".

type Fixture = { id: string; date: string; kickoff?: string; opponent: string; homeAway: string; status?: string };
type FixtureScore = { fixtureId: string; level: string; timeGapMinutes?: number | null; distanceKm?: number | null };
type LandscapeEvent = { name: string; date: string; competition?: string; fixtureScores?: FixtureScore[] };
type Signal = { id: string; fixtureId?: string; state: string; title: { en: string } };
type Weather = { valid_for?: string; temperature_max?: number; precipitation_probability_max?: number } | null | undefined;
type HealthSource = { id: string; state: string };
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
  id: "pressure" | "broadcast" | "weather" | "transport" | "opportunity" | "move";
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
  horizon?: number;
};

function day(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function buildMorningRead({ today, calendar, events, signals, weather, sources, live, horizon = 4 }: MorningReadInput): MorningReadLine[] {
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
        ? weather.precipitation_probability_max! >= 50
          ? `${weather.precipitation_probability_max}% rain risk for ${next.opponent}: prepare the wet-weather message`
          : `${Math.round(weather.temperature_max!)}° and ${weather.precipitation_probability_max}% rain risk for ${next.opponent}: no weather change to the plan`
        : `No forecast yet for ${next.opponent}`,
      detail: forecast ? "Forecast, not an observed matchday outcome." : null,
      state: operational.has("open-meteo") ? "live" : "not-connected"
    });
  }

  const transportLive = operational.has("tfl-road") || operational.has("national-rail-rdm");
  lines.push({
    id: "transport",
    label: "Transport",
    headline: transportLive ? "Road and rail feeds are connected" : "Road and rail disruption is not connected yet",
    detail: transportLive ? null : "TfL and National Rail join in a club pilot. No disruption is inferred without them.",
    state: transportLive ? "live" : "not-connected"
  });

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
