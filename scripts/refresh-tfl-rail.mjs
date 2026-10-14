import { readFile, writeFile } from "node:fs/promises";
import { RAIL_LINES, RAIL_STATIONS, parseRailStatus, railStatusUrl } from "./lib/tfl-rail.mjs";

const RAIL_PATH = new URL("../data/live/tfl-rail.json", import.meta.url);
const CALENDAR_PATH = new URL("../data/seed/calendar.json", import.meta.url);
const SOURCE_HEALTH_PATH = new URL("../data/live/source-health.json", import.meta.url);
const DRY_RUN = process.env.REFRESH_DRY_RUN === "1";
const HORIZON = 4;

function londonIsoDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

async function main() {
  const now = new Date().toISOString();
  const [stored, calendarRaw, health] = await Promise.all([
    readFile(RAIL_PATH, "utf8").then(JSON.parse),
    readFile(CALENDAR_PATH, "utf8").then(JSON.parse),
    readFile(SOURCE_HEALTH_PATH, "utf8").then(JSON.parse)
  ]);
  const fixtures = (Array.isArray(calendarRaw) ? calendarRaw : calendarRaw.fixtures ?? [])
    .filter((fixture) => fixture.homeAway === "home" && fixture.status !== "final" && fixture.date >= londonIsoDate())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, HORIZON);

  let days = null;
  let failure = null;
  try {
    days = [];
    for (const fixture of fixtures) {
      const response = await fetch(railStatusUrl(fixture.date, process.env.TFL_APP_KEY), { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`TfL returned ${response.status} for ${fixture.date}`);
      days.push({ fixtureId: fixture.id, date: fixture.date, disruptions: parseRailStatus(await response.json()) });
    }
  } catch (error) {
    days = null;
    failure = error?.message ?? String(error);
  }

  const next = {
    ...stored,
    version: now.slice(0, 10),
    lines: RAIL_LINES,
    stations: RAIL_STATIONS,
    checkedAt: now,
    lastSuccessfulAt: days ? now : stored.lastSuccessfulAt,
    days: days ?? stored.days
  };
  const nextHealth = {
    ...health,
    sources: health.sources.map((source) => source.id !== "tfl-national-rail" ? source : {
      ...source,
      state: days ? "operational" : source.lastSuccessfulAt ? "degraded" : "blocked",
      lastAttemptAt: now,
      lastSuccessfulAt: days ? now : source.lastSuccessfulAt
    })
  };

  if (DRY_RUN) {
    console.log(JSON.stringify({ days, failure }, null, 2));
    return;
  }
  await Promise.all([
    writeFile(RAIL_PATH, `${JSON.stringify(next, null, 2)}\n`),
    writeFile(SOURCE_HEALTH_PATH, `${JSON.stringify(nextHealth, null, 2)}\n`)
  ]);
  console.log(failure
    ? `TfL National Rail: refresh failed (${failure}); kept the stored snapshot.`
    : `TfL National Rail: ${days.length} fixture days read, ${days.filter((day) => day.disruptions.length).length} with disruption.`);
  if (failure) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
