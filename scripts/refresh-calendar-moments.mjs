import { readFile, writeFile } from "node:fs/promises";
import { parseBankHolidays } from "./lib/bank-holidays.mjs";

const HOLIDAYS_PATH = new URL("../data/live/bank-holidays.json", import.meta.url);
const SOURCE_HEALTH_PATH = new URL("../data/live/source-health.json", import.meta.url);
const DRY_RUN = process.env.REFRESH_DRY_RUN === "1";

function londonIsoDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

async function main() {
  const now = new Date().toISOString();
  const [holidays, health] = await Promise.all([
    readFile(HOLIDAYS_PATH, "utf8").then(JSON.parse),
    readFile(SOURCE_HEALTH_PATH, "utf8").then(JSON.parse)
  ]);
  // Keep the last month too, so a fixture just after a bank holiday can still be read.
  const from = new Date(Date.now() - 31 * 86_400_000);

  let events = null;
  let failure = null;
  try {
    const response = await fetch(holidays.source.url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`GOV.UK returned ${response.status}`);
    events = parseBankHolidays(await response.json(), holidays.division, londonIsoDate(from));
  } catch (error) {
    failure = error?.message ?? String(error);
  }

  const nextHolidays = {
    ...holidays,
    checkedAt: now,
    lastSuccessfulAt: events ? now : holidays.lastSuccessfulAt,
    events: events ?? holidays.events
  };
  const nextHealth = {
    ...health,
    sources: health.sources.map((source) => source.id !== "uk-bank-holidays" ? source : {
      ...source,
      state: events ? "operational" : source.lastSuccessfulAt ? "degraded" : "blocked",
      lastAttemptAt: now,
      lastSuccessfulAt: events ? now : source.lastSuccessfulAt
    })
  };

  if (DRY_RUN) {
    console.log(JSON.stringify({ events: events?.length ?? null, failure }, null, 2));
    return;
  }
  await Promise.all([
    writeFile(HOLIDAYS_PATH, `${JSON.stringify(nextHolidays, null, 2)}\n`),
    writeFile(SOURCE_HEALTH_PATH, `${JSON.stringify(nextHealth, null, 2)}\n`)
  ]);
  console.log(failure ? `Bank holidays: refresh failed (${failure}); kept ${nextHolidays.events.length} stored.` : `Bank holidays: ${events.length} stored.`);
  if (failure) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
