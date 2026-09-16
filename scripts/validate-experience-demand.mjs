import { readFile } from "node:fs/promises";

const [data, calendar, searchDemand] = await Promise.all([
  readFile(new URL("../data/live/experience-demand-validation.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/seed/calendar.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/search-demand.json", import.meta.url), "utf8").then(JSON.parse)
]);

const conceptIds = new Set();
const allowedConceptStates = new Set(["concept", "validation", "partner-required", "sellable"]);
const canonicalFixtures = new Set(calendar.filter((item) => item.homeAway === "home").map((item) => item.id));
const searchGateIds = new Set(searchDemand.experienceGates.map((item) => item.id));
const directIdentifiers = new Set(["name", "email", "phone", "address", "postcode", "payment", "free_text"]);

if (data.version !== "1.0") throw new Error("Experience demand contract version must be 1.0");
if (data.concepts.length !== 3) throw new Error("V1 must test exactly three experience concepts");

for (const concept of data.concepts) {
  if (conceptIds.has(concept.id)) throw new Error(`Duplicate experience concept: ${concept.id}`);
  conceptIds.add(concept.id);
  if (!allowedConceptStates.has(concept.state)) throw new Error(`Invalid concept state: ${concept.state}`);
  if (concept.priceBands.length < 3) throw new Error(`Concept needs price bands: ${concept.id}`);
}

for (const fixture of data.fixtures) {
  if (!canonicalFixtures.has(fixture.id)) throw new Error(`Experience references unknown or away fixture: ${fixture.id}`);
}
for (const gateId of data.searchDemandGateIds) {
  if (!searchGateIds.has(gateId)) throw new Error(`Unknown SearchDemand gate: ${gateId}`);
}
for (const field of data.analytics.fields) {
  if (directIdentifiers.has(field)) throw new Error(`Analytics payload includes prohibited personal field: ${field}`);
}
for (const required of directIdentifiers) {
  if (!data.analytics.prohibitedFields.includes(required)) throw new Error(`Missing prohibited-field guardrail: ${required}`);
}

const funnel = new Map(data.funnel.map((item) => [item.id, item]));
if (data.status === "validation-concept") {
  if (data.concepts.some((item) => item.state === "sellable")) throw new Error("Validation concepts cannot be sellable");
  for (const id of ["register_interest", "deposit", "purchase"]) {
    if (funnel.get(id)?.state !== "blocked") throw new Error(`${id} must remain blocked during concept validation`);
  }
}

const guardrailIds = new Set(data.guardrails.map((item) => item.id));
for (const id of ["no-sale", "no-player-guarantee", "no-personal-data", "operator-required"]) {
  if (!guardrailIds.has(id)) throw new Error(`Missing experience guardrail: ${id}`);
}

console.log(JSON.stringify({ status: data.status, concepts: conceptIds.size, fixtures: data.fixtures.length, analytics: data.analytics.state, blockedStages: ["register_interest", "deposit", "purchase"] }, null, 2));
