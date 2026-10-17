import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseMensFootballFixtures, parseOfficialLeagueFixtures, rankEventCompetition } from "./event-competition.mjs";

const CALENDAR_PATH = new URL("../data/seed/calendar.json", import.meta.url);
const CURRENT_PATH = new URL("../data/live/current.json", import.meta.url);
const EVENT_LANDSCAPE_PATH = new URL("../data/live/event-landscape.json", import.meta.url);
const SOURCE_HEALTH_PATH = new URL("../data/live/source-health.json", import.meta.url);
const TICKETMASTER_API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
const TICKETMASTER_SOURCE_URL = "https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/";
const WSL_FIXTURES_URL = "https://womensleagues.thefa.com/fixtures/";
const MEN_FOOTBALL_FEEDS = [
  { competition: "Premier League", feedUrl: "https://fixturedownload.com/feed/json/epl-2026", sourceUrl: "https://fixturedownload.com/view/json/epl-2026" },
  { competition: "EFL Championship", feedUrl: "https://fixturedownload.com/feed/json/championship-2026", sourceUrl: "https://fixturedownload.com/view/json/championship-2026" },
  { competition: "EFL League One", feedUrl: "https://fixturedownload.com/feed/json/efl-league-one-2026", sourceUrl: "https://fixturedownload.com/view/json/efl-league-one-2026" },
  { competition: "UEFA Nations League", feedUrl: "https://fixturedownload.com/feed/json/nations-league-2026/england", sourceUrl: "https://fixturedownload.com/view/json/nations-league-2026/england" },
  { competition: "UEFA Champions League", feedUrl: "https://fixturedownload.com/feed/json/champions-league-2026", sourceUrl: "https://fixturedownload.com/view/json/champions-league-2026" },
  { competition: "UEFA Europa League", feedUrl: "https://fixturedownload.com/feed/json/europa-league-2026", sourceUrl: "https://fixturedownload.com/view/json/europa-league-2026" },
  { competition: "UEFA Conference League", feedUrl: "https://fixturedownload.com/feed/json/conference-league-2026", sourceUrl: "https://fixturedownload.com/view/json/conference-league-2026" }
];
const DRY_RUN = process.env.REFRESH_DRY_RUN === "1";

function londonIsoDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(value);
}

async function fetchResponse(url, source) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(45_000),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; AVELA/1.0; +https://avela-growth-intelligence.vercel.app)",
      "accept-language": "en-GB,en;q=0.9"
    }
  });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);
  return response;
}

async function fetchText(url, source) {
  return (await fetchResponse(url, source)).text();
}

async function fetchJson(url, source) {
  return (await fetchResponse(url, source)).json();
}


function dateDistance(left, right) {
  return Math.round(Math.abs(new Date(`${left}T12:00:00Z`) - new Date(`${right}T12:00:00Z`)) / 86_400_000);
}

function addDays(value, days) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function ticketmasterWindow(calendar, today) {
  const fixtures = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.status === "scheduled" && fixture.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);
  if (!fixtures.length) return null;
  return {
    fixtures,
    startDate: addDays(fixtures[0].date, -1),
    endDate: addDays(fixtures.at(-1).date, 1)
  };
}

export function parseTicketmasterEvents(payload, fixtures) {
  const events = payload?._embedded?.events ?? [];
  return events.flatMap((event) => {
    const date = event?.dates?.start?.localDate;
    if (!event?.id || !event?.name || !date || !event?.url) return [];
    const fixtureIds = fixtures.filter((fixture) => dateDistance(date, fixture.date) <= 1).map((fixture) => fixture.id);
    if (!fixtureIds.length) return [];
    const venue = event?._embedded?.venues?.[0];
    const classification = event?.classifications?.find((item) => item?.primary) ?? event?.classifications?.[0];
    return [{
      id: event.id,
      name: event.name,
      date,
      time: event?.dates?.start?.localTime ?? null,
      venue: venue?.name ?? "London venue",
      city: venue?.city?.name ?? "London",
      category: classification?.segment?.name ?? "Event",
      genre: classification?.genre?.name ?? null,
      url: event.url,
      fixtureIds,
      kind: "public-event",
      sourceName: "Ticketmaster Discovery API",
      sourceUrl: TICKETMASTER_SOURCE_URL,
      latitude: Number.isFinite(Number(venue?.location?.latitude)) ? Number(venue.location.latitude) : null,
      longitude: Number.isFinite(Number(venue?.location?.longitude)) ? Number(venue.location.longitude) : null,
      slotCount: 1
    }];
  }).sort((a, b) => `${a.date}-${a.time ?? ""}`.localeCompare(`${b.date}-${b.time ?? ""}`));
}

async function fetchTicketmasterEvents(apiKey, window) {
  if (!apiKey) throw new Error("TICKETMASTER_API_KEY is not configured");
  const eventsById = new Map();
  for (const fixture of window.fixtures) {
    const params = new URLSearchParams({
      apikey: apiKey,
      city: "London",
      countryCode: "GB",
      startDateTime: `${addDays(fixture.date, -1)}T00:00:00Z`,
      endDateTime: `${addDays(fixture.date, 1)}T23:59:59Z`,
      includeTBA: "no",
      includeTBD: "no",
      size: "100",
      sort: "date,asc"
    });
    const events = parseTicketmasterEvents(
      await fetchJson(`${TICKETMASTER_API_URL}?${params}`, "Ticketmaster Discovery API"),
      [fixture]
    );
    for (const event of events) {
      const existing = eventsById.get(event.id);
      eventsById.set(event.id, existing
        ? { ...existing, fixtureIds: [...new Set([...existing.fixtureIds, ...event.fixtureIds])] }
        : event);
    }
  }
  return [...eventsById.values()].sort((a, b) => `${a.date}-${a.time ?? ""}`.localeCompare(`${b.date}-${b.time ?? ""}`));
}

async function fetchMensFootballFeedSets() {
  const attempts = await Promise.allSettled(MEN_FOOTBALL_FEEDS.map(async (feed) => ({
    competition: feed.competition,
    sourceUrl: feed.sourceUrl,
    matches: await fetchJson(feed.feedUrl, feed.competition)
  })));
  return {
    feedSets: attempts.flatMap((attempt) => attempt.status === "fulfilled" ? [attempt.value] : []),
    failures: attempts.flatMap((attempt, index) => attempt.status === "rejected" ? [`${MEN_FOOTBALL_FEEDS[index].competition}: ${attempt.reason}`] : [])
  };
}

function updateSourceHealth(sourceHealth, attemptedAt, results) {
  return {
    ...sourceHealth,
    checkedAt: attemptedAt,
    sources: sourceHealth.sources.map((source) => {
      const result = results[source.id];
      if (!result) return source;
      return {
        ...source,
        access: result.secret ? "api-key" : source.access,
        state: result.ok ? "operational" : (result.state ?? "degraded"),
        method: result.secret ? "official-api" : source.method,
        lastAttemptAt: attemptedAt,
        lastSuccessfulAt: result.ok ? attemptedAt : source.lastSuccessfulAt,
        ownerAction: result.ok ? null : (result.ownerAction ?? (result.secret ? {
          en: `Configure ${result.secret} as a GitHub Actions secret.`,
          es: `Configurar ${result.secret} como secreto de GitHub Actions.`
        } : source.ownerAction)),
        note: result.ok ? (result.note ?? source.note) : (result.note ?? {
          en: `The last valid observation is retained. ${result.message}`,
          es: `Se conserva la última observación válida. ${result.message}`
        })
      };
    })
  };
}

export async function refreshPublicSignals(now = new Date()) {
  const [calendar, current, eventLandscape, sourceHealth] = await Promise.all([
    readFile(CALENDAR_PATH, "utf8").then(JSON.parse),
    readFile(CURRENT_PATH, "utf8").then(JSON.parse),
    readFile(EVENT_LANDSCAPE_PATH, "utf8").then(JSON.parse),
    readFile(SOURCE_HEALTH_PATH, "utf8").then(JSON.parse)
  ]);
  const attemptedAt = now.toISOString();
  const today = londonIsoDate(now);
  const sources = [];
  const failures = [];
  let nextEventLandscape = eventLandscape;
  const healthResults = {};

  const window = ticketmasterWindow(calendar, today);
  if (window) {
    try {
      const [ticketmasterEvents, leagueHtml, footballFeeds] = await Promise.all([
        fetchTicketmasterEvents(process.env.TICKETMASTER_API_KEY, window),
        fetchText(WSL_FIXTURES_URL, "Official WSL fixtures"),
        fetchMensFootballFeedSets()
      ]);
      const leagueFixtures = parseOfficialLeagueFixtures(leagueHtml, window.fixtures);
      const mensFootballFixtures = parseMensFootballFixtures(footballFeeds.feedSets, window.fixtures);
      const candidates = [...ticketmasterEvents, ...leagueFixtures, ...mensFootballFixtures];
      const events = rankEventCompetition(candidates, window.fixtures);
      nextEventLandscape = {
        ...eventLandscape,
        checkedAt: attemptedAt,
        state: "operational",
        window: { startDate: window.startDate, endDate: window.endDate, city: "London" },
        sources: [
          { name: "Ticketmaster Discovery API", url: TICKETMASTER_SOURCE_URL },
          { name: "WSL Football fixtures", url: WSL_FIXTURES_URL },
          { name: "Men's football structured feeds", url: "https://fixturedownload.com/" }
        ],
        rawEventCount: candidates.length,
        excludedEventCount: candidates.length - events.length,
        events,
        refresh: {
          lastAttemptAt: attemptedAt,
          lastSuccessfulAt: attemptedAt,
          message: footballFeeds.failures.length ? `Partial men's football feeds: ${footballFeeds.failures.join("; ")}` : null
        }
      };
      sources.push({ id: "ticketmaster-events", label: "London event landscape", state: "measured", confidence: "high", checkedAt: attemptedAt, sourceUrl: TICKETMASTER_SOURCE_URL });
      healthResults["ticketmaster-events"] = {
        ok: true,
        secret: "TICKETMASTER_API_KEY",
        note: {
          en: `${events.length} strategically relevant sports events remain from ${candidates.length} candidates; routine culture and entertainment are excluded.`,
          es: `${events.length} citas deportivas estratégicamente relevantes permanecen de ${candidates.length} candidatas; se excluyen cultura y entretenimiento rutinarios.`
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ticketmaster refresh failed";
      failures.push(`Ticketmaster: ${message}`);
      nextEventLandscape = {
        ...eventLandscape,
        checkedAt: attemptedAt,
        state: "degraded",
        refresh: { ...eventLandscape.refresh, lastAttemptAt: attemptedAt, message }
      };
      sources.push({ id: "ticketmaster-events", label: "London event landscape", state: "waiting", confidence: "unavailable", checkedAt: attemptedAt, sourceUrl: TICKETMASTER_SOURCE_URL, message });
      healthResults["ticketmaster-events"] = { ok: false, secret: "TICKETMASTER_API_KEY", message };
    }
  }


  const successfulSources = sources.filter((source) => source.state === "measured").length;
  const refresh = {
    automated: true,
    cadence: "weekly-and-fixture-windows",
    lastAttemptAt: attemptedAt,
    lastSuccessfulAt: successfulSources ? attemptedAt : current.public_signal_refresh?.lastSuccessfulAt ?? null,
    state: failures.length ? (successfulSources ? "partial" : "waiting") : "fresh",
    sources
  };
  // Event-landscape changes are reported by the landscape itself; no public metric snapshot is kept.
  const materialChanges = 0;
  const nextCurrent = {
    ...current,
    updated_at: attemptedAt,
    public_signal_changes: materialChanges,
    public_signal_refresh: refresh,
    source_failures: [...new Set([...(current.source_failures ?? []).filter((item) => !/^YouTube:|^Ticketmaster:|^WSL attendance:/.test(item)), ...failures])]
  };
  const nextSourceHealth = updateSourceHealth(sourceHealth, attemptedAt, healthResults);

  if (!DRY_RUN) {
    await Promise.all([
      writeFile(CURRENT_PATH, `${JSON.stringify(nextCurrent, null, 2)}\n`),
      writeFile(EVENT_LANDSCAPE_PATH, `${JSON.stringify(nextEventLandscape, null, 2)}\n`),
      writeFile(SOURCE_HEALTH_PATH, `${JSON.stringify(nextSourceHealth, null, 2)}\n`)
    ]);
  }
  return { today, materialChanges, eventCount: nextEventLandscape.events.length, failures, sources };
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  refreshPublicSignals().then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
