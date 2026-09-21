import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../data/live/source-health.json", import.meta.url), "utf8"));
const allowedStates = new Set(["operational", "degraded", "blocked", "not-configured", "requires-access"]);
const ids = new Set();

if (data.version !== "1.0" || !Array.isArray(data.sources) || data.sources.length === 0) {
  throw new Error("Source health must expose version 1.0 and at least one source");
}
if (!Array.isArray(data.decisions) || data.decisions.length === 0) {
  throw new Error("Source health must expose at least one business decision");
}

for (const source of data.sources) {
  if (!source.id || ids.has(source.id)) throw new Error(`Invalid or duplicate source id: ${source.id}`);
  ids.add(source.id);
  if (!allowedStates.has(source.state)) throw new Error(`Invalid state for ${source.id}: ${source.state}`);
  if (!source.label?.en || !source.label?.es || !source.note?.en || !source.note?.es) {
    throw new Error(`Source ${source.id} is missing bilingual copy`);
  }
  if (source.state === "operational" && !source.lastSuccessfulAt) {
    throw new Error(`Operational source ${source.id} must have a successful timestamp`);
  }
  if (["blocked", "not-configured"].includes(source.state) && !source.ownerAction?.en) {
    throw new Error(`Actionable source ${source.id} must name an owner action`);
  }
}

const decisionIds = new Set();
for (const decision of data.decisions) {
  if (!decision.id || decisionIds.has(decision.id)) throw new Error(`Invalid or duplicate decision id: ${decision.id}`);
  decisionIds.add(decision.id);
  if (!decision.label?.en || !decision.label?.es || !decision.question?.en || !decision.question?.es || !decision.nextAction?.en || !decision.nextAction?.es) {
    throw new Error(`Decision ${decision.id} is missing bilingual copy`);
  }
  if (!decision.route || !Array.isArray(decision.requiredSourceIds) || decision.requiredSourceIds.length === 0 || !Array.isArray(decision.supportingSourceIds)) {
    throw new Error(`Decision ${decision.id} has an invalid source mapping`);
  }
  for (const sourceId of [...decision.requiredSourceIds, ...decision.supportingSourceIds]) {
    if (!ids.has(sourceId)) throw new Error(`Decision ${decision.id} references unknown source: ${sourceId}`);
  }
}

console.log(`Source health valid: ${data.sources.length} sources, ${decisionIds.size} mapped decisions`);
