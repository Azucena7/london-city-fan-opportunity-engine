import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/sourceCoverage.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { summariseSourceCoverage, BRIEF_DECISION_IDS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const label = (en) => ({ en, es: en });
const health = {
  sources: [
    { id: "web", label: label("Club web"), state: "operational" },
    { id: "trends", label: label("Google Trends"), state: "blocked" },
    { id: "rail", label: label("National Rail"), state: "not-configured" },
    { id: "crm", label: label("CRM"), state: "requires-access" }
  ],
  decisions: [
    { id: "planning", label: label("Planning"), requiredSourceIds: ["web"], supportingSourceIds: ["trends"] },
    { id: "travel", label: label("Travel"), requiredSourceIds: ["web", "rail"], supportingSourceIds: [] },
    { id: "elsewhere", label: label("Elsewhere"), requiredSourceIds: ["crm"], supportingSourceIds: [] }
  ]
};

test("counts each source once and lists only the ones that are not operational", () => {
  const coverage = summariseSourceCoverage(health, ["planning", "travel"]);
  assert.equal(coverage.total, 3);
  assert.equal(coverage.operational, 1);
  assert.deepEqual(coverage.gaps.map((gap) => gap.id), ["rail", "trends"], "required gaps come first");
  assert.equal(coverage.gaps[0].state, "not configured");
  assert.deepEqual(coverage.gaps[0].affects, ["Travel"]);
  assert.equal(coverage.gaps[1].role, "supporting");
});

test("ignores decisions outside the brief", () => {
  const coverage = summariseSourceCoverage(health, ["planning"]);
  assert.ok(!coverage.gaps.some((gap) => gap.id === "crm"));
});

test("a source required by any decision is reported as required", () => {
  const mixed = {
    ...health,
    decisions: [
      { id: "a", label: label("A"), requiredSourceIds: [], supportingSourceIds: ["trends"] },
      { id: "b", label: label("B"), requiredSourceIds: ["trends"], supportingSourceIds: [] }
    ]
  };
  const [gap] = summariseSourceCoverage(mixed, ["a", "b"]).gaps;
  assert.equal(gap.role, "required");
  assert.deepEqual(gap.affects, ["A", "B"]);
});

test("every brief decision exists in the live source health register", async () => {
  const live = JSON.parse(await readFile(new URL("../data/live/source-health.json", import.meta.url), "utf8"));
  const ids = new Set(live.decisions.map((decision) => decision.id));
  for (const id of BRIEF_DECISION_IDS) assert.ok(ids.has(id), `${id} is missing from source-health.json`);
});
