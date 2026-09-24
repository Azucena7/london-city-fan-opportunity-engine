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
const records = Array.isArray(parsed) ? parsed : parsed.records;

let output;
try {
  output = aggregateCrmRecords(records);
} catch (error) {
  console.error("CRM/ticketing import rejected:\n" + error.message);
  process.exit(1);
}

await writeFile(targetPath, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  sourceRecordsProcessedLocally: records.length,
  fixtureSummaries: output.fixtureSummaries.length,
  repeatCohorts: output.repeatCohorts.length,
  target: "data/live/crm-ticketing.json",
  state: output.datasetState,
  rawRecordsStoredInRepository: false
}, null, 2));
