import { readFile } from "node:fs/promises";

const [data, calendar, mobility, experience, measurement] = await Promise.all([
  readFile(new URL("../data/live/partner-commercial-pack.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/seed/calendar.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/mobility-partnership.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/experience-demand-validation.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/experiment-measurement.json", import.meta.url), "utf8").then(JSON.parse)
]);

const categories = new Set(data.packs.map((item) => item.category));
const expectedCategories = ["journey-technology", "rail", "vehicle-operator", "travel-hospitality"];
const canonicalHomeFixtures = new Set(calendar.filter((item) => item.homeAway === "home").map((item) => item.id));
const mobilityFixtures = new Set(mobility.pilots.map((item) => item.fixtureId));
const packFixtures = new Set(data.fixtures.map((item) => item.fixtureId));
const evidenceStates = ["public-verified", "modelled-scenario", "requires-measurement", "requires-partner"];
const mobilityPartners = new Map(mobility.partnerModels.map((item) => [item.category, item]));

if (data.version !== "1.0") throw new Error("Partner commercial pack version must be 1.0");
if (data.status !== "prospecting-draft") throw new Error("Repository partner packs must remain prospecting drafts");
if (data.measurementState !== measurement.status) throw new Error("Partner pack measurement state must match the measurement contract");
if (data.packs.length !== 4) throw new Error("V1 must define exactly four partner packs");
for (const category of expectedCategories) {
  if (!categories.has(category)) throw new Error(`Missing partner category: ${category}`);
}
for (const fixtureId of packFixtures) {
  if (!canonicalHomeFixtures.has(fixtureId)) throw new Error(`Unknown partner-pack fixture: ${fixtureId}`);
  if (!mobilityFixtures.has(fixtureId)) throw new Error(`Partner-pack fixture is not a mobility pilot: ${fixtureId}`);
}

const ids = new Set();
for (const pack of data.packs) {
  if (ids.has(pack.id)) throw new Error(`Duplicate partner pack: ${pack.id}`);
  ids.add(pack.id);
  if (pack.relationshipState !== "candidate-not-contacted") throw new Error(`Draft cannot imply a partner relationship: ${pack.id}`);
  for (const fixtureId of pack.recommendedFixtureIds) {
    if (!packFixtures.has(fixtureId)) throw new Error(`Pack references an undeclared fixture: ${pack.id}.${fixtureId}`);
  }
  const states = new Set(pack.evidence.map((item) => item.state));
  for (const state of evidenceStates) {
    if (!states.has(state)) throw new Error(`Pack must disclose ${state}: ${pack.id}`);
  }
  if (pack.kpis.some((item) => !["public-measurable", "requires-instrumentation", "requires-partner", "requires-access"].includes(item.state))) {
    throw new Error(`Invalid partner KPI state: ${pack.id}`);
  }
  if (pack.category !== "travel-hospitality") {
    const source = mobilityPartners.get(pack.category);
    if (!source || source.candidate !== pack.candidate || source.state !== pack.relationshipState) throw new Error(`Mobility candidate mismatch: ${pack.id}`);
  }
}

const international = experience.concepts.find((item) => item.id === "international-weekend");
if (!international || international.state !== "partner-required") throw new Error("Travel pack requires the international partner-required concept");
if (data.approvalGates.some((item) => item.state !== "waiting")) throw new Error("Prospecting draft cannot pass approval gates");
if (data.pilotPhases.some((item) => item.state !== "waiting")) throw new Error("Prospecting draft cannot imply pilot execution");
if (measurement.status === "provider-not-configured" && measurement.cohorts.some((item) => item.sampleSize !== null)) throw new Error("Unconfigured measurement cannot support a partner cohort");

const guardrailIds = new Set(data.guardrails.map((item) => item.id));
for (const id of ["no-endorsement", "no-outreach", "no-quote", "no-inventory", "aggregate-only", "human-approval"]) {
  if (!guardrailIds.has(id)) throw new Error(`Missing partner-pack guardrail: ${id}`);
}

console.log(JSON.stringify({ status: data.status, packs: data.packs.length, fixtures: data.fixtures.length, measurement: data.measurementState, gatesWaiting: data.approvalGates.length }, null, 2));
