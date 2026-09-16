import { readFile } from "node:fs/promises";

const [data, calendar, experience, mobility] = await Promise.all([
  readFile(new URL("../data/live/experiment-measurement.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/seed/calendar.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/experience-demand-validation.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/mobility-partnership.json", import.meta.url), "utf8").then(JSON.parse)
]);

const canonicalFixtures = new Set(calendar.filter((item) => item.homeAway === "home").map((item) => item.id));
const mobilityPilots = new Set(mobility.pilots.map((item) => item.fixtureId));
const experimentFixtures = new Set(data.experiments.map((item) => item.fixtureId));
const eventNames = new Set(data.events.map((item) => item.name));
const prohibited = new Set(data.prohibitedFields);

if (data.version !== "1.0") throw new Error("Experiment measurement version must be 1.0");
if (data.minimumAggregateCohort !== mobility.simulator.minimumAggregateCohort) throw new Error("Measurement and mobility thresholds must match");
if (data.experiments.length !== 3 || data.cohorts.length !== 3) throw new Error("V1 must define exactly three experiments and cohorts");
for (const fixtureId of experimentFixtures) {
  if (!canonicalFixtures.has(fixtureId)) throw new Error(`Unknown experiment fixture: ${fixtureId}`);
  if (!mobilityPilots.has(fixtureId)) throw new Error(`Experiment is not a mobility pilot: ${fixtureId}`);
}
for (const cohort of data.cohorts) {
  if (!experimentFixtures.has(cohort.fixtureId)) throw new Error(`Cohort has no experiment: ${cohort.fixtureId}`);
  if (data.status === "provider-not-configured") {
    if (cohort.state !== "not-instrumented") throw new Error("Unconfigured provider cannot expose a measured cohort");
    for (const key of ["sampleSize", "transportInterestCount", "mobilityScenarioCount"]) {
      if (cohort[key] !== null) throw new Error(`Unconfigured count must be null: ${cohort.fixtureId}.${key}`);
    }
  }
}

for (const expected of ["experience_concept_selected", experience.analytics.eventName, "mobility_scenario_evaluated"]) {
  if (!eventNames.has(expected)) throw new Error(`Missing measurement event: ${expected}`);
}
for (const event of data.events) {
  const allowed = new Set(event.allowedProperties);
  const typed = new Set(Object.keys(event.propertyTypes));
  for (const field of event.allowedProperties) {
    if (prohibited.has(field)) throw new Error(`Event allowlist includes prohibited field: ${event.name}.${field}`);
    if (!typed.has(field)) throw new Error(`Allowlisted event field has no declared type: ${event.name}.${field}`);
  }
  for (const field of event.requiredProperties) {
    if (!allowed.has(field)) throw new Error(`Required event field is not allowlisted: ${event.name}.${field}`);
  }
}
for (const field of data.commonFields) {
  if (prohibited.has(field)) throw new Error(`Common fields include prohibited field: ${field}`);
}
for (const required of ["name", "email", "phone", "address", "postcode", "ip_address", "user_agent", "supporter_id", "payment", "free_text"]) {
  if (!prohibited.has(required)) throw new Error(`Missing prohibited measurement field: ${required}`);
}
if (data.provider.maximumRetentionDays > 90) throw new Error("Raw-event retention cannot exceed 90 days");
if (data.provider.defaultMode !== "test") throw new Error("Measurement must default to test mode");

const qualityIds = new Set(data.qualityRules.map((item) => item.id));
for (const id of ["test-separation", "event-deduplication", "canonical-fixture", "null-not-zero", "minimum-cohort"]) {
  if (!qualityIds.has(id)) throw new Error(`Missing measurement quality rule: ${id}`);
}

console.log(JSON.stringify({ status: data.status, experiments: data.experiments.length, events: data.events.length, threshold: data.minimumAggregateCohort, retentionDays: data.provider.maximumRetentionDays }, null, 2));
