import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/sourceRegister.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { filterRows, parseSourceFilter, registerRows } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const live = JSON.parse(await readFile(new URL("../data/live/source-health.json", import.meta.url), "utf8"));

test("every registered source gets one row, most urgent first", () => {
  const rows = registerRows(live);
  assert.equal(rows.length, live.sources.length);
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length);
  const order = ["blocked", "not-configured", "degraded", "requires-access", "operational"];
  const ranks = rows.map((row) => order.indexOf(row.state));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
});

test("rows name the decisions a source feeds and only ask for action when it is not operational", () => {
  const rows = registerRows(live);
  const trends = rows.find((row) => row.id === "google-trends");
  assert.ok(trends.usedBy.includes("Attention & campaign timing"));
  for (const row of rows.filter((item) => item.state === "operational")) assert.equal(row.nextStep, null);
});

test("filters split the register without losing a source", () => {
  const rows = registerRows(live);
  assert.equal(filterRows(rows, "attention").length + filterRows(rows, "operational").length, rows.length);
  assert.equal(filterRows(rows, "all").length, rows.length);
  assert.equal(parseSourceFilter("attention"), "attention");
  assert.equal(parseSourceFilter(["operational"]), "all", "unexpected shapes fall back to all");
  assert.equal(parseSourceFilter("anything"), "all");
});
