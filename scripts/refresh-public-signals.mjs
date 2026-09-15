import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const AUDIENCE_PATH = new URL("../data/live/audience-reach.json", import.meta.url);
const BENCHMARK_PATH = new URL("../data/live/wsl-attendance-benchmark.json", import.meta.url);
const CALENDAR_PATH = new URL("../data/seed/calendar.json", import.meta.url);
const CURRENT_PATH = new URL("../data/live/current.json", import.meta.url);
const YOUTUBE_URL = "https://www.youtube.com/@LondonCityLionesses/about?hl=en";
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

async function fetchText(url, source) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(45_000),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; LondonCityFanOpportunityLab/1.0)",
      "accept-language": "en-GB,en;q=0.9"
    }
  });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);
  return response.text();
}

export function parseYoutubePublicAbout(html) {
  const subscribersText = html.match(/subscriberCountText\\?"\s*:\s*\\?"([^"\\]+)["\\]/)?.[1] ?? null;
  const viewsText = html.match(/viewCountText\\?"\s*:\s*\\?"([^"\\]+)["\\]/)?.[1] ?? null;
  const subscribers = compactNumber(subscribersText);
  const channelViews = compactNumber(viewsText);
  if (subscribers === null) throw new Error("YouTube public subscriber count was not found");
  return { subscribers, channelViews };
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
    const catalogue = channel.metrics.find((item) => item.label.en === "Published videos");
    return {
      ...channel,
      state: "measured",
      metrics: [
        { label: { en: "Public subscribers", es: "Suscriptores públicos" }, value: compactDisplay(publicData.subscribers), state: "measured" },
        ...(catalogue ? [catalogue] : []),
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
  const [audience, benchmark, calendar, current] = await Promise.all([
    readFile(AUDIENCE_PATH, "utf8").then(JSON.parse),
    readFile(BENCHMARK_PATH, "utf8").then(JSON.parse),
    readFile(CALENDAR_PATH, "utf8").then(JSON.parse),
    readFile(CURRENT_PATH, "utf8").then(JSON.parse)
  ]);
  const attemptedAt = now.toISOString();
  const today = londonIsoDate(now);
  const sources = [];
  const failures = [];
  let nextAudience = audience;
  let nextBenchmark = benchmark;
  let appendedAudienceSnapshot = false;
  let appendedBenchmarkSnapshot = false;

  try {
    const youtube = parseYoutubePublicAbout(await fetchText(YOUTUBE_URL, "YouTube"));
    const latest = audience.snapshots.at(-1);
    const previousVideos = latest?.metrics.find((item) => item.key === "lcl-youtube-videos")?.value ?? null;
    const metrics = [
      metric("lcl-youtube-subscribers", { en: "London City YouTube subscribers", es: "Suscriptores de YouTube de London City" }, youtube.subscribers, "subscribers", "London City Lionesses on YouTube", YOUTUBE_URL),
      metric("lcl-youtube-videos", { en: "London City public videos", es: "Vídeos públicos de London City" }, previousVideos, "videos", "London City Lionesses on YouTube", YOUTUBE_URL),
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
    sources.push({ id: "lcl-youtube", label: "London City YouTube", state: "measured", confidence: "medium", checkedAt: attemptedAt, sourceUrl: YOUTUBE_URL });
  } catch (error) {
    const message = error instanceof Error ? error.message : "YouTube refresh failed";
    failures.push(`YouTube: ${message}`);
    sources.push({ id: "lcl-youtube", label: "London City YouTube", state: "waiting", confidence: "unavailable", checkedAt: attemptedAt, sourceUrl: YOUTUBE_URL, message });
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
    source_failures: [...new Set([...(current.source_failures ?? []).filter((item) => !/^YouTube:|^WSL attendance:/.test(item)), ...failures])]
  };

  if (!DRY_RUN) {
    await Promise.all([
      writeFile(AUDIENCE_PATH, `${JSON.stringify(nextAudience, null, 2)}\n`),
      writeFile(BENCHMARK_PATH, `${JSON.stringify(nextBenchmark, null, 2)}\n`),
      writeFile(CURRENT_PATH, `${JSON.stringify(nextCurrent, null, 2)}\n`)
    ]);
  }
  return { today, materialChanges, appendedAudienceSnapshot, appendedBenchmarkSnapshot, failures, sources };
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
