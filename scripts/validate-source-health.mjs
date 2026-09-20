import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../data/live/source-health.json", import.meta.url), "utf8"));
const allowedStates = new Set(["operational", "degraded", "blocked", "not-configured", "requires-access"]);
const ids = new Set();

if (data.version !== "1.0" || !Array.isArray(data.sources) || data.sources.length === 0) {
  throw new Error("Source health must expose version 1.0 and at least one source");
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

console.log(`Source health valid: ${data.sources.length} sources, ${ids.size} unique ids`);
