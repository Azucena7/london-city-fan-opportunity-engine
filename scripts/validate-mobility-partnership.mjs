import { readFile } from "node:fs/promises";

const [data, calendar, experience] = await Promise.all([
  readFile(new URL("../data/live/mobility-partnership.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/seed/calendar.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/experience-demand-validation.json", import.meta.url), "utf8").then(JSON.parse)
]);

const expectedPilots = new Set(["2027-01-24-ars-h", "2027-02-14-che-h", "2027-03-14-liv-h"]);
const canonicalFixtures = new Set(calendar.filter((item) => item.homeAway === "home").map((item) => item.id));
const experienceFixtures = new Set(experience.fixtures.map((item) => item.id));
const prohibitedKeys = new Set(["name", "email", "phone", "address", "postcode", "full_address", "individual_movement"]);

if (data.version !== "1.0") throw new Error("Mobility partnership contract version must be 1.0");
if (data.pilots.length !== 3) throw new Error("Mobility V1 must contain exactly three pilot fixtures");
for (const pilot of data.pilots) {
  if (!expectedPilots.has(pilot.fixtureId)) throw new Error(`Unexpected mobility pilot: ${pilot.fixtureId}`);
  if (!canonicalFixtures.has(pilot.fixtureId)) throw new Error(`Unknown home fixture: ${pilot.fixtureId}`);
  if (!experienceFixtures.has(pilot.fixtureId)) throw new Error(`Pilot missing from experience validation: ${pilot.fixtureId}`);
}

const weightTotal = Object.values(data.scoring.weights).reduce((sum, value) => sum + value, 0);
if (Math.abs(weightTotal - 1) > 0.0001) throw new Error(`Mobility score weights must total 1, found ${weightTotal}`);
if (data.simulator.minimumAggregateCohort < 10) throw new Error("Aggregate privacy threshold must be at least 10");
if (data.simulator.capacities.some((item) => item.seats <= 0 || item.scenarioCost <= 0)) throw new Error("Simulator assumptions must be positive");

if (data.demandState === "requires-instrumentation") {
  if (data.status !== "planning-scenario") throw new Error("Unmeasured demand can only support planning-scenario status");
  if (data.corridors.some((item) => item.evidenceState !== "modelled-scenario")) throw new Error("Unmeasured corridors must remain modelled scenarios");
  if (data.partnerModels.some((item) => item.state !== "candidate-not-contacted")) throw new Error("Unmeasured planning cannot imply partner engagement");
}

if (data.experienceEvent.eventName !== experience.analytics.eventName) throw new Error("Mobility event must join to the experience validation event");
if (!experience.analytics.fields.includes(data.experienceEvent.demandField)) throw new Error("Mobility demand field is not declared by experience validation");

function checkKeys(value, path = "root") {
  if (Array.isArray(value)) return value.forEach((item, index) => checkKeys(item, `${path}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    if (prohibitedKeys.has(key.toLowerCase())) throw new Error(`Prohibited individual field at ${path}.${key}`);
    checkKeys(nested, `${path}.${key}`);
  }
}
checkKeys(data);

const guardrailIds = new Set(data.guardrails.map((item) => item.id));
for (const id of ["no-booking", "no-quote", "aggregate-only", "no-individual-movement", "approval-required"]) {
  if (!guardrailIds.has(id)) throw new Error(`Missing mobility guardrail: ${id}`);
}

console.log(JSON.stringify({ status: data.status, demand: data.demandState, pilots: data.pilots.length, corridors: data.corridors.length, privacyThreshold: data.simulator.minimumAggregateCohort }, null, 2));
