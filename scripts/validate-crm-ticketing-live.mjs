import { readFile } from "node:fs/promises";
import { validateAggregate } from "./lib/crm-aggregate-validate.mjs";

const path = new URL("../data/live/crm-ticketing.json", import.meta.url);
const dataset = JSON.parse(await readFile(path, "utf8"));
const errors = validateAggregate(dataset);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    state: dataset.datasetState,
    fixtureSummaries: dataset.fixtureSummaries.length,
    repeatCohorts: dataset.repeatCohorts.length,
    audienceDefinitions: dataset.audienceDefinitions?.length ?? 0,
    extractedAt: dataset.extractedAt,
    rawSupporterRecordsStored: false
  }, null, 2));
}
