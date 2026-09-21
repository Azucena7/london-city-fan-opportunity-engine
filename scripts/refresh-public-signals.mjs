import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseMensFootballFixtures, parseOfficialLeagueFixtures, rankEventCompetition } from "./event-competition.mjs";

const AUDIENCE_PATH = new URL("../data/live/audience-reach.json", import.meta.url);
const BENCHMARK_PATH = new URL("../data/live/wsl-attendance-benchmark.json", import.meta.url);
const CALENDAR_PATH = new URL("../data/seed/calendar.json", import.meta.url);
const CURRENT_PATH = new URL("../data/live/current.json", import.meta.url);
const EVENT_LANDSCAPE_PATH = new URL("../data/live/event-landscape.json", import.meta.url);
const SOURCE_HEALTH_PATH = new URL("../data/live/source-health.json", import.meta.url);
const YOUTUBE_URL = "https://www.youtube.com/@LondonCityLionesses";
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/channels";
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
const WSL_ATTENDANCE_URL = "https://www.footballwebpages.co.uk/womens-super-league/attendances";
const DRY_RUN = process.env.REFRESH_DRY_RUN === "1";

function londonIsoDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(value);
}

function londonHour(value = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23"
  }).format(value);
}

function compactNumber(value) {
  if (!value) return null;
  const match = String(value).toLowerCase().replaceAll(",", "").match(/([\d.]+)\s*([kmb])?/);
  if (!match) return null;
  const multiplier = { k: 1_000, m: 1_000_000, b: 1_000_000_000 }[match[2]] ?? 1;
  return Math.round(Number(match[1]) * multiplier);
}

function compactDisplay(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value < 10_000_000 ? 1 : 0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value < 100_000 ? 1 : 0)}K`;
  return value.toLocaleString("en-GB");
}

async function fetchResponse(url, source) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(45_000),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; LondonCityFanOpportunityLab/1.0)",
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

function integerOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

export function parseYoutubeChannelResponse(payload) {
  const channel = payload?.items?.[0];
  if (!channel) throw new Error("YouTube channel was not found");
  const subscribers = integerOrNull(channel.statistics?.subscriberCount);
  const videos = integerOrNull(channel.statistics?.videoCount);
  const channelViews = integerOrNull(channel.statistics?.viewCount);
  if (subscribers === null) throw new Error("YouTube subscriber count was not returned");
  return { channelId: channel.id, subscribers, videos, channelViews };
}

async function fetchYoutubeChannel(apiKey) {
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not configured");
  const params = new URLSearchParams({
    part: "statistics",
    forHandle: "LondonCityLionesses",
    key: apiKey
  });
  return parseYoutubeChannelResponse(await fetchJson(`${YOUTUBE_API_URL}?${params}`, "YouTube Data API"));
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
        access: "api-key",
        state: result.ok ? "operational" : "degraded",
        method: "official-api",
        lastSuccessfulAt: result.ok ? attemptedAt : source.lastSuccessfulAt,
        ownerAction: result.ok ? null : {
          en: `Configure ${result.secret} as a GitHub Actions secret.`,
          es: `Configurar ${result.secret} como secreto de GitHub Actions.`
        },
        note: result.ok ? result.note : {
          en: `The last valid observation is retained. ${result.message}`,
          es: `Se conserva la última observación válida. ${result.message}`
        }
      };
    })
  };
}

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseWslAttendanceAverages(html, clubNames) {
  if (/Attention Required!|cf-error-details|captcha/i.test(html)) {
    throw new Error("WSL attendance source blocked the automated request");
  }
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
  const observations = new Map();
  for (const row of rows) {
    const cells = [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) => stripHtml(match[1]));
    const club = clubNames.find((name) => cells.some((cell) => cell === name));
    if (!club) continue;
    const clubIndex = cells.findIndex((cell) => cell === club);
    const attendance = cells.slice(clubIndex + 1).map(compactNumber).find((value) => value !== null && value > 100);
    if (attendance !== undefined) observations.set(club, attendance);
  }
  if (observations.size < 2) throw new Error("WSL attendance table did not contain enough comparable rows");
  return observations;
}

function metric(key, label, value, unit, sourceName, sourceUrl) {
  return {
    key,
    label,
    value,
    displayValue: value === null ? "Pending" : compactDisplay(value),
    unit,
    state: value === null ? "pending" : "measured",
    sourceName,
    sourceUrl
  };
}

function milestoneFixture(calendar, today) {
  const target = new Date(`${today}T12:00:00Z`).getTime();
  return calendar.find((fixture) => {
    if (fixture.homeAway !== "home") return false;
    const days = Math.round((target - new Date(`${fixture.date}T12:00:00Z`).getTime()) / 86_400_000);
    return [-7, 1, 7, 30].includes(days);
  });
}

function shouldAppendSnapshot(latest, metrics, today, fixture) {
  if (!latest) return true;
  const changed = metrics.some((item) => {
    const previous = latest.metrics.find((candidate) => candidate.key === item.key);
    return item.value !== null && previous?.value !== item.value;
  });
  const age = Math.floor((new Date(`${today}T12:00:00Z`) - new Date(latest.observedAt)) / 86_400_000);
  const fixtureWindowMissing = fixture && latest.fixtureId !== fixture.id;
  return changed || age >= 7 || Boolean(fixtureWindowMissing);
}

function updateYoutubeChannel(audience, publicData) {
  return audience.channels.map((channel) => {
    if (channel.id !== "lcl-youtube") return channel;
    return {
      ...channel,
      state: "measured",
      metrics: [
        { label: { en: "Public subscribers", es: "Suscriptores públicos" }, value: compactDisplay(publicData.subscribers), state: "measured" },
        ...(publicData.videos === null ? [] : [{ label: { en: "Published videos", es: "Vídeos publicados" }, value: publicData.videos.toLocaleString("en-GB"), state: "measured" }]),
        ...(publicData.channelViews === null ? [] : [{ label: { en: "Public channel views", es: "Visualizaciones públicas del canal" }, value: publicData.channelViews.toLocaleString("en-GB"), state: "measured" }])
      ]
    };
  });
}

function appendBenchmarkSnapshot(benchmark, observations, today) {
  const latest = benchmark.snapshots.at(-1);
  const changed = latest.clubs.some((club) => observations.has(club.club) && observations.get(club.club) !== club.attendance);
  if (!changed) return benchmark;
  const clubs = latest.clubs.map((club) => {
    const attendance = observations.get(club.club);
    if (attendance === undefined) return club;
    const sampleIncrease = club.attendance !== attendance ? 1 : 0;
    return { ...club, attendance, state: "measured", homeMatchesObserved: Math.max(1, club.homeMatchesObserved + sampleIncrease) };
  });
  const measured = clubs.filter((club) => club.attendance !== null).length;
  return {
    ...benchmark,
    checkedAt: new Date().toISOString(),
    snapshots: [...benchmark.snapshots, {
      id: `auto-${today}`,
      label: { en: `Public refresh · ${today}`, es: `Actualización pública · ${today}` },
      throughDate: today,
      completeness: { en: `${measured} of ${clubs.length} clubs have a published home observation`, es: `${measured} de ${clubs.length} clubes tienen una observación local publicada` },
      clubs
    }]
  };
}

export async function refreshPublicSignals(now = new Date()) {
  const [audience, benchmark, calendar, current, eventLandscape, sourceHealth] = await Promise.all([
    readFile(AUDIENCE_PATH, "utf8").then(JSON.parse),
    readFile(BENCHMARK_PATH, "utf8").then(JSON.parse),
    readFile(CALENDAR_PATH, "utf8").then(JSON.parse),
    readFile(CURRENT_PATH, "utf8").then(JSON.parse),
    readFile(EVENT_LANDSCAPE_PATH, "utf8").then(JSON.parse),
    readFile(SOURCE_HEALTH_PATH, "utf8").then(JSON.parse)
  ]);
  const attemptedAt = now.toISOString();
  const today = londonIsoDate(now);
  const sources = [];
  const failures = [];
  let nextAudience = audience;
  let nextBenchmark = benchmark;
  let nextEventLandscape = eventLandscape;
  let appendedAudienceSnapshot = false;
  let appendedBenchmarkSnapshot = false;
  const healthResults = {};

  try {
    const youtube = await fetchYoutubeChannel(process.env.YOUTUBE_API_KEY);
    const latest = audience.snapshots.at(-1);
    const metrics = [
      metric("lcl-youtube-subscribers", { en: "London City YouTube subscribers", es: "Suscriptores de YouTube de London City" }, youtube.subscribers, "subscribers", "London City Lionesses on YouTube", YOUTUBE_URL),
      metric("lcl-youtube-videos", { en: "London City public videos", es: "Vídeos públicos de London City" }, youtube.videos, "videos", "YouTube Data API", YOUTUBE_URL),
      metric("lcl-youtube-channel-views", { en: "London City public channel views", es: "Visualizaciones públicas del canal de London City" }, youtube.channelViews, "views", "London City Lionesses on YouTube", YOUTUBE_URL),
      ...(latest?.metrics.filter((item) => !item.key.startsWith("lcl-youtube-")) ?? [])
    ];
    const fixture = milestoneFixture(calendar, today);
    appendedAudienceSnapshot = shouldAppendSnapshot(latest, metrics, today, fixture);
    nextAudience = {
      ...audience,
      checkedAt: attemptedAt,
      channels: updateYoutubeChannel(audience, youtube),
      snapshots: appendedAudienceSnapshot ? [...audience.snapshots, {
        id: `audience-auto-${today}`,
        observedAt: attemptedAt,
        label: { en: "Automated public snapshot", es: "Snapshot público automatizado" },
        ...(fixture ? { fixtureId: fixture.id } : {}),
        metrics
      }] : audience.snapshots
    };
    sources.push({ id: "lcl-youtube", label: "London City YouTube", state: "measured", confidence: "high", checkedAt: attemptedAt, sourceUrl: YOUTUBE_URL });
    healthResults["youtube-public"] = {
      ok: true,
      secret: "YOUTUBE_API_KEY",
      note: {
        en: "Channel statistics are refreshed through the official YouTube Data API.",
        es: "Las estadísticas del canal se actualizan mediante la API oficial de YouTube Data."
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "YouTube refresh failed";
    failures.push(`YouTube: ${message}`);
    sources.push({ id: "lcl-youtube", label: "London City YouTube", state: "waiting", confidence: "unavailable", checkedAt: attemptedAt, sourceUrl: YOUTUBE_URL, message });
    healthResults["youtube-public"] = { ok: false, secret: "YOUTUBE_API_KEY", message };
  }

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

  try {
    const latest = benchmark.snapshots.at(-1);
    const clubs = latest.clubs.map((club) => club.club);
    const observations = parseWslAttendanceAverages(await fetchText(WSL_ATTENDANCE_URL, "WSL attendance"), clubs);
    nextBenchmark = appendBenchmarkSnapshot(benchmark, observations, today);
    appendedBenchmarkSnapshot = nextBenchmark.snapshots.length > benchmark.snapshots.length;
    sources.push({ id: "wsl-attendance", label: "WSL attendance benchmark", state: "measured", confidence: "medium", checkedAt: attemptedAt, sourceUrl: WSL_ATTENDANCE_URL });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WSL attendance refresh failed";
    failures.push(`WSL attendance: ${message}`);
    sources.push({ id: "wsl-attendance", label: "WSL attendance benchmark", state: "waiting", confidence: "unavailable", checkedAt: attemptedAt, sourceUrl: WSL_ATTENDANCE_URL, message });
  }

  const successfulSources = sources.filter((source) => source.state === "measured").length;
  nextAudience = {
    ...nextAudience,
    refresh: {
      automated: true,
      cadence: "weekly-and-fixture-windows",
      lastAttemptAt: attemptedAt,
      lastSuccessfulAt: successfulSources ? attemptedAt : audience.refresh?.lastSuccessfulAt ?? null,
      state: failures.length ? (successfulSources ? "partial" : "waiting") : "fresh",
      sources
    }
  };
  const materialChanges = Number(appendedAudienceSnapshot) + Number(appendedBenchmarkSnapshot);
  const nextCurrent = {
    ...current,
    updated_at: attemptedAt,
    public_signal_changes: materialChanges,
    public_signal_refresh: nextAudience.refresh,
    source_failures: [...new Set([...(current.source_failures ?? []).filter((item) => !/^YouTube:|^Ticketmaster:|^WSL attendance:/.test(item)), ...failures])]
  };
  const nextSourceHealth = updateSourceHealth(sourceHealth, attemptedAt, healthResults);

  if (!DRY_RUN) {
    await Promise.all([
      writeFile(AUDIENCE_PATH, `${JSON.stringify(nextAudience, null, 2)}\n`),
      writeFile(BENCHMARK_PATH, `${JSON.stringify(nextBenchmark, null, 2)}\n`),
      writeFile(CURRENT_PATH, `${JSON.stringify(nextCurrent, null, 2)}\n`),
      writeFile(EVENT_LANDSCAPE_PATH, `${JSON.stringify(nextEventLandscape, null, 2)}\n`),
      writeFile(SOURCE_HEALTH_PATH, `${JSON.stringify(nextSourceHealth, null, 2)}\n`)
    ]);
  }
  return { today, materialChanges, appendedAudienceSnapshot, appendedBenchmarkSnapshot, eventCount: nextEventLandscape.events.length, failures, sources };
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const scheduledOutsideLondonWindow = process.env.GITHUB_EVENT_NAME === "schedule" && londonHour() !== "06";
  const run = scheduledOutsideLondonWindow
    ? Promise.resolve({ skipped: true, reason: "Not the 06:30 Europe/London run" })
    : refreshPublicSignals();
  run.then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
