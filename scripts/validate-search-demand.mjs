import { readFile } from "node:fs/promises";

const path = new URL("../data/live/search-demand.json", import.meta.url);
const activationsPath = new URL("../data/seed/club-activations.json", import.meta.url);
const [data, activations] = await Promise.all([
  readFile(path, "utf8").then(JSON.parse),
  readFile(activationsPath, "utf8").then(JSON.parse)
]);
const allowedStates = new Set(["measured", "insufficient-sample", "source-unavailable", "requires-access"]);
const stages = new Set(["player", "club", "fixture", "ticket", "travel"]);
const ids = new Set();
let measuredSets = 0;

if (!/^\d{4}-\d{2}-\d{2}T/.test(data.checkedAt)) throw new Error("Search demand checkedAt must be an ISO timestamp");
if (data.markets.length !== 2 || !data.markets.some((item) => item.code === "GB") || !data.markets.some((item) => item.code === "ES")) {
  throw new Error("Search demand must keep comparable GB and ES markets");
}

for (const market of data.markets) {
  if (market.comparisonSets.length < 2) throw new Error(`${market.code} needs awareness and intent comparison sets`);
  for (const set of market.comparisonSets) {
    if (ids.has(set.id)) throw new Error(`Duplicate comparison set: ${set.id}`);
    ids.add(set.id);
    if (set.terms.length < 2 || set.terms.length > 5) throw new Error(`${set.id} must compare 2–5 terms`);
    if (!set.exploreUrl.startsWith("https://trends.google.com/trends/explore")) throw new Error(`Invalid Trends URL: ${set.id}`);
    const termIds = new Set(set.terms.map((term) => term.id));
    for (const term of set.terms) if (!stages.has(term.stage)) throw new Error(`Unknown funnel stage: ${term.stage}`);
    for (const snapshot of set.snapshots) {
      if (!allowedStates.has(snapshot.state)) throw new Error(`Invalid snapshot state: ${snapshot.state}`);
      if (snapshot.state === "measured" && snapshot.series.length === 0) throw new Error(`Measured snapshot has no series: ${set.id}`);
      if (snapshot.state !== "measured" && snapshot.series.length > 0) throw new Error(`Unavailable snapshot cannot contain values: ${set.id}`);
      for (const point of snapshot.series) {
        if (!termIds.has(point.termId)) throw new Error(`Unknown term ${point.termId} in ${set.id}`);
        if (point.value < 0 || point.value > 100) throw new Error(`Index outside 0–100 in ${set.id}`);
      }
      if (snapshot.state === "measured") measuredSets += 1;
    }
  }
}

if (data.status === "baseline-ready" && measuredSets === 0) throw new Error("Baseline cannot be ready without measured series");
if (data.experienceGates.some((gate) => gate.state === "passed") && measuredSets === 0) throw new Error("Experience gate cannot pass without measured search evidence");
const activationIds = new Set(activations.observations.map((item) => item.id));
for (const link of data.activationLinks) {
  if (!activationIds.has(link.activationId)) throw new Error(`Search link references unknown activation: ${link.activationId}`);
}

console.log(JSON.stringify({ markets: data.markets.length, comparisonSets: ids.size, measuredSets, status: data.status }, null, 2));
