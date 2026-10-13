import { readFile, writeFile } from "node:fs/promises";
import { applyTrendsExport, markTrendsCaptured, parseTrendsCsv } from "./lib/trends-export.mjs";

const [setId, csvPath, observedArg] = process.argv.slice(2);
if (!setId || !csvPath) {
  console.error("Usage: npm run import:trends -- <comparison-set-id> <path/to/multiTimeline.csv> [observed-at ISO timestamp]");
  console.error("Comparison sets: gb-awareness-bridge, gb-ticket-intent, es-awareness-bridge, es-travel-intent");
  process.exit(1);
}

const demandPath = new URL("../data/live/search-demand.json", import.meta.url);
const healthPath = new URL("../data/live/source-health.json", import.meta.url);
const observedAt = observedArg ?? new Date().toISOString();
if (Number.isNaN(Date.parse(observedAt))) {
  console.error(`Invalid observed-at timestamp: ${observedAt}`);
  process.exit(1);
}

const [csv, demand, health] = await Promise.all([
  readFile(csvPath, "utf8"),
  readFile(demandPath, "utf8").then(JSON.parse),
  readFile(healthPath, "utf8").then(JSON.parse)
]);

let summary;
try {
  summary = applyTrendsExport(demand, setId, parseTrendsCsv(csv), observedAt);
} catch (error) {
  console.error("Trends import rejected:\n" + error.message);
  process.exit(1);
}

await Promise.all([
  writeFile(demandPath, JSON.stringify(demand, null, 2) + "\n"),
  writeFile(healthPath, JSON.stringify(markTrendsCaptured(health, observedAt), null, 2) + "\n")
]);
console.log(JSON.stringify(summary, null, 2));
