import { readFile, writeFile } from "node:fs/promises";
import { classify, feedUrl, mergeHeadlines, parseRss, upcomingFixtures } from "./lib/news-radar.mjs";

const CONFIG_PATH = new URL("../data/seed/news-radar.json", import.meta.url);
const CALENDAR_PATH = new URL("../data/seed/calendar.json", import.meta.url);
const RADAR_PATH = new URL("../data/live/news-radar.json", import.meta.url);
const SOURCE_HEALTH_PATH = new URL("../data/live/source-health.json", import.meta.url);
const DRY_RUN = process.env.REFRESH_DRY_RUN === "1";

function londonIsoDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

async function fetchFeed(feed) {
  const response = await fetch(feedUrl(feed), {
    signal: AbortSignal.timeout(30_000),
    headers: { "user-agent": "Mozilla/5.0 (compatible; AVELA/1.0; +https://avela-growth-intelligence.vercel.app)" }
  });
  if (!response.ok) throw new Error(`Google News returned ${response.status} for ${feed.id}`);
  return parseRss(await response.text()).map((item) => ({ ...item, feedIds: [feed.id] }));
}

async function main() {
  const now = new Date().toISOString();
  const [config, calendar, radar, health] = await Promise.all([
    readFile(CONFIG_PATH, "utf8").then(JSON.parse),
    readFile(CALENDAR_PATH, "utf8").then(JSON.parse),
    readFile(RADAR_PATH, "utf8").then(JSON.parse),
    readFile(SOURCE_HEALTH_PATH, "utf8").then(JSON.parse)
  ]);
  const fixtures = upcomingFixtures(calendar, londonIsoDate(), config.fixtureWindowDays);

  const results = await Promise.allSettled(config.feeds.map(fetchFeed));
  const failures = results
    .map((result, index) => result.status === "rejected" ? `${config.feeds[index].id}: ${result.reason?.message ?? result.reason}` : null)
    .filter(Boolean);
  const incoming = results.flatMap((result) => result.status === "fulfilled" ? result.value : []).map((item) => classify(item, config, fixtures));
  const anySucceeded = failures.length < config.feeds.length;

  const nextRadar = {
    ...radar,
    checkedAt: now,
    lastSuccessfulAt: anySucceeded ? now : radar.lastSuccessfulAt,
    failures,
    // Re-tag stored headlines too, so a change to topics or fixtures applies to them as well.
    items: mergeHeadlines(radar.items, incoming, now, config).map((item) => classify(item, config, fixtures))
  };
  const nextHealth = {
    ...health,
    sources: health.sources.map((source) => source.id !== "news-radar" ? source : {
      ...source,
      state: failures.length === 0 ? "operational" : anySucceeded ? "degraded" : (source.lastSuccessfulAt ? "degraded" : "blocked"),
      lastAttemptAt: now,
      lastSuccessfulAt: anySucceeded ? now : source.lastSuccessfulAt
    })
  };

  if (DRY_RUN) {
    console.log(JSON.stringify({ feeds: config.feeds.length, failures, fetched: incoming.length, stored: nextRadar.items.length }, null, 2));
    return;
  }
  await Promise.all([
    writeFile(RADAR_PATH, `${JSON.stringify(nextRadar, null, 2)}\n`),
    writeFile(SOURCE_HEALTH_PATH, `${JSON.stringify(nextHealth, null, 2)}\n`)
  ]);
  console.log(`News radar: ${incoming.length} headlines fetched, ${nextRadar.items.length} stored, ${failures.length} feed failures.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
