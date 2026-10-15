import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { aggregateCrmRecords } from "./lib/crm-ticketing-aggregate.mjs";

const sourceArg = process.argv[2];
if (!sourceArg) {
  console.error("Usage: npm run import:crm -- /absolute/path/outside-repo/authorised-export.json");
  process.exit(1);
}

const repoRoot = resolve(process.cwd());
const sourcePath = resolve(repoRoot, sourceArg);
const targetPath = resolve(repoRoot, "data/live/crm-ticketing.json");

if (sourcePath === repoRoot || sourcePath.startsWith(repoRoot + sep)) {
  console.error("CRM/ticketing source files must stay outside the repository. Move the authorised export to a secure external path before importing.");
  process.exit(1);
}

const parsed = JSON.parse(await readFile(sourcePath, "utf8"));
// Kickoffs let scans be grouped by how early supporters arrive; only date and kickoff time are used.
const calendar = JSON.parse(await readFile(resolve(repoRoot, "data/seed/calendar.json"), "utf8"));
const kickoffs = Object.fromEntries((Array.isArray(calendar) ? calendar : calendar.fixtures)
  .filter((fixture) => fixture.date && fixture.kickoff)
  .map((fixture) => [fixture.id, { date: fixture.date, kickoff: fixture.kickoff }]));
const records = Array.isArray(parsed) ? parsed : parsed.records;
// The next home fixtures after the export get repeat audiences even before they have sales.
const exportedIds = new Set((Array.isArray(records) ? records : []).map((row) => row?.fixture_id));
const lastExported = [...exportedIds].filter(Boolean).sort().at(-1) ?? "";
const upcomingFixtureIds = (Array.isArray(calendar) ? calendar : calendar.fixtures)
  .filter((fixture) => fixture.homeAway === "home" && fixture.id > lastExported && !exportedIds.has(fixture.id))
  .map((fixture) => fixture.id)
  .sort()
  .slice(0, 3);

let output;
try {
  output = aggregateCrmRecords(records, { kickoffs, upcomingFixtureIds });
} catch (error) {
  console.error("CRM/ticketing import rejected:\n" + error.message);
  process.exit(1);
}

await writeFile(targetPath, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  sourceRecordsProcessedLocally: records.length,
  fixtureSummaries: output.fixtureSummaries.length,
  repeatCohorts: output.repeatCohorts.length,
  audienceDefinitions: output.audienceDefinitions.length,
  smallCellThreshold: output.privacy.smallCellThreshold,
  target: "data/live/crm-ticketing.json",
  state: output.datasetState,
  rawRecordsStoredInRepository: false
}, null, 2));
