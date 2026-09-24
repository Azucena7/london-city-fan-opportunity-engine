import { readFile } from "node:fs/promises";

const path = new URL("../data/live/crm-ticketing.json", import.meta.url);
const dataset = JSON.parse(await readFile(path, "utf8"));
const errors = [];
const forbiddenKeys = new Set([
  "records","supporter_id_hash","order_id_hash","ticket_id_hash","name","email","phone",
  "full_postcode","date_of_birth","payment_details"
]);

function scanForbidden(value, ref = "dataset") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${ref}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) errors.push(`${ref}: forbidden repository field ${key}`);
    scanForbidden(child, `${ref}.${key}`);
  }
}

scanForbidden(dataset);

if (!["requires-access","club-aggregate"].includes(dataset.datasetState)) {
  errors.push("datasetState must be requires-access or club-aggregate");
}
if (dataset.scope !== "club-crm-ticketing-aggregate") {
  errors.push("scope must be club-crm-ticketing-aggregate");
}
if (!Array.isArray(dataset.fixtureSummaries)) errors.push("fixtureSummaries must be an array");
if (!Array.isArray(dataset.repeatCohorts)) errors.push("repeatCohorts must be an array");

if (dataset.datasetState === "requires-access") {
  if (dataset.extractedAt !== null) errors.push("requires-access dataset must have extractedAt=null");
  if (dataset.fixtureSummaries?.length) errors.push("requires-access dataset must not contain fixture summaries");
  if (dataset.repeatCohorts?.length) errors.push("requires-access dataset must not contain repeat cohorts");
}

if (dataset.datasetState === "club-aggregate") {
  if (!dataset.extractedAt) errors.push("club-aggregate dataset requires extractedAt");
  if (!dataset.fixtureSummaries?.length) errors.push("club-aggregate dataset requires fixture summaries");
}

const fixtureIds = new Set();
for (const [index, item] of (dataset.fixtureSummaries ?? []).entries()) {
  const ref = `fixtureSummaries[${index}]`;
  if (!item.fixtureId) errors.push(`${ref}: missing fixtureId`);
  if (fixtureIds.has(item.fixtureId)) errors.push(`${ref}: duplicate fixtureId`);
  fixtureIds.add(item.fixtureId);

  for (const field of [
    "tickets","uniqueBuyers","scans","noShows","grossTicketRevenue","firstTimeBuyers",
    "consentedBuyers","campaignAttributedTickets","postcodeSectors"
  ]) {
    if (typeof item[field] !== "number" || item[field] < 0) {
      errors.push(`${ref}: ${field} must be a non-negative number`);
    }
  }
  if (item.averageTicketValue !== null &&
      (typeof item.averageTicketValue !== "number" || item.averageTicketValue < 0)) {
    errors.push(`${ref}: averageTicketValue must be null or non-negative`);
  }
  if (item.scans + item.noShows > item.tickets) errors.push(`${ref}: scans + noShows cannot exceed tickets`);
  if (item.campaignAttributedTickets > item.tickets) errors.push(`${ref}: attributed tickets cannot exceed tickets`);
  if (item.consentedBuyers > item.uniqueBuyers) errors.push(`${ref}: consented buyers cannot exceed unique buyers`);
}

const cohortKeys = new Set();
for (const [index, item] of (dataset.repeatCohorts ?? []).entries()) {
  const ref = `repeatCohorts[${index}]`;
  const key = `${item.sourceFixtureId}->${item.targetFixtureId}`;
  if (!item.sourceFixtureId || !item.targetFixtureId) errors.push(`${ref}: fixture ids are required`);
  if (item.sourceFixtureId === item.targetFixtureId) errors.push(`${ref}: source and target fixtures must differ`);
  if (cohortKeys.has(key)) errors.push(`${ref}: duplicate cohort pair`);
  cohortKeys.add(key);

  for (const field of [
    "sourceBuyers","sourceConsentedBuyers","alreadyPurchasedTarget","addressableConsentedNonReturners"
  ]) {
    if (typeof item[field] !== "number" || item[field] < 0) {
      errors.push(`${ref}: ${field} must be a non-negative number`);
    }
  }
  if (item.sourceConsentedBuyers > item.sourceBuyers) errors.push(`${ref}: consented source buyers cannot exceed source buyers`);
  if (item.alreadyPurchasedTarget + item.addressableConsentedNonReturners !== item.sourceConsentedBuyers) {
    errors.push(`${ref}: repeat cohort must partition consented source buyers`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    state: dataset.datasetState,
    fixtureSummaries: dataset.fixtureSummaries.length,
    repeatCohorts: dataset.repeatCohorts.length,
    extractedAt: dataset.extractedAt,
    rawSupporterRecordsStored: false
  }, null, 2));
}
