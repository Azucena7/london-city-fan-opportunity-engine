import { readFile } from "node:fs/promises";

const [data, packs, measurement, calendar] = await Promise.all([
  readFile(new URL("../data/live/pilot-readiness.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/partner-commercial-pack.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/live/experiment-measurement.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/seed/calendar.json", import.meta.url), "utf8").then(JSON.parse)
]);

if (data.version !== "1.0") throw new Error("Pilot readiness version must be 1.0");
if (data.status !== "decision-draft") throw new Error("Repository readiness must remain a decision draft");
if (data.recommendationState !== "provisional") throw new Error("Repository recommendation must remain provisional");
if (data.outreachDraft.state !== "not-approved" || data.outreachDraft.sendEnabled !== false) throw new Error("Outreach must remain disabled");
if (data.decision.state !== "hold") throw new Error("Draft readiness cannot issue a go decision");

const packIds = new Set(packs.packs.map((item) => item.id));
const fixtureIds = new Set(calendar.filter((item) => item.homeAway === "home").map((item) => item.id));
const candidatePackIds = new Set(data.candidates.map((item) => item.packId));
if (data.candidates.length !== packs.packs.length || candidatePackIds.size !== packIds.size) throw new Error("Every commercial pack must be scored exactly once");
for (const packId of packIds) if (!candidatePackIds.has(packId)) throw new Error(`Missing readiness candidate: ${packId}`);

const dimensions = data.scoringModel.dimensions;
if (dimensions.length !== 5 || new Set(dimensions.map((item) => item.id)).size !== 5) throw new Error("Scoring model must define five unique dimensions");
if (dimensions.reduce((sum, item) => sum + item.weight, 0) !== 100) throw new Error("Scoring weights must total 100");
const ranks = new Set();
for (const candidate of data.candidates) {
  if (!packIds.has(candidate.packId)) throw new Error(`Unknown commercial pack: ${candidate.packId}`);
  if (!fixtureIds.has(candidate.fixtureId)) throw new Error(`Unknown home fixture: ${candidate.fixtureId}`);
  if (ranks.has(candidate.rank)) throw new Error(`Duplicate readiness rank: ${candidate.rank}`);
  ranks.add(candidate.rank);
  const pack = packs.packs.find((item) => item.id === candidate.packId);
  if (!pack.recommendedFixtureIds.includes(candidate.fixtureId)) throw new Error(`Readiness fixture is not recommended by pack: ${candidate.packId}`);
  const score = dimensions.reduce((total, dimension) => {
    const value = candidate.scores[dimension.id];
    if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error(`Score outside 1-5: ${candidate.packId}.${dimension.id}`);
    return total + value * dimension.weight / 100;
  }, 0);
  if (Math.abs(score - candidate.weightedScore) > 0.001) throw new Error(`Weighted score mismatch: ${candidate.packId}`);
}

const ordered = [...data.candidates].sort((a, b) => b.weightedScore - a.weightedScore);
if (ordered[0].packId !== data.recommendedPackId || ordered[0].rank !== 1 || ordered[0].decision !== "recommended-for-review") throw new Error("Recommendation must be the highest-ranked review candidate");
if (ordered[0].fixtureId !== data.recommendedFixtureId) throw new Error("Recommended fixture mismatch");

const ownerIds = new Set(data.owners.map((item) => item.id));
if (data.owners.some((item) => item.state !== "awaiting-assignment")) throw new Error("Draft cannot imply assigned club owners");
const checklist = new Map(data.checklist.map((item) => [item.id, item]));
for (const item of data.checklist) if (!ownerIds.has(item.ownerId)) throw new Error(`Unknown checklist owner: ${item.id}`);
for (const item of data.timeline) if (!ownerIds.has(item.ownerId)) throw new Error(`Unknown timeline owner: ${item.id}`);
for (const id of data.decision.blockingChecklistIds) {
  const item = checklist.get(id);
  if (!item || item.state === "ready") throw new Error(`Decision blocker must exist and remain unresolved: ${id}`);
}
if (measurement.status === "provider-not-configured" && checklist.get("measurement-baseline")?.state !== "blocked") throw new Error("Unconfigured measurement must block readiness");
if (data.budgetInputs.some((item) => item.value !== null || item.state !== "required-input")) throw new Error("Draft budget inputs must remain empty");
for (const id of ["provisional-ranking", "no-automatic-go", "no-outreach", "no-budget-assumption", "human-approval"]) {
  if (!data.guardrails.some((item) => item.id === id)) throw new Error(`Missing readiness guardrail: ${id}`);
}

console.log(JSON.stringify({ status: data.status, recommendation: data.recommendedPackId, score: ordered[0].weightedScore, decision: data.decision.state, blocked: data.checklist.filter((item) => item.state === "blocked").length }, null, 2));
