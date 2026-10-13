import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/engineSignals.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { engineSignals } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const states = (sources) => Object.fromEntries(engineSignals({ sources }).map((signal) => [signal.id, signal.state]));

test("a signal family is live only when one of its own sources is operational", () => {
  const result = states([
    { id: "open-meteo", state: "operational" },
    { id: "tfl-road", state: "not-configured" },
    { id: "national-rail-rdm", state: "operational" },
    { id: "crm-ticketing", state: "requires-access" }
  ]);
  assert.equal(result.weather, "live");
  assert.equal(result.transport, "live");
  assert.equal(result["fan-demand"], "pilot");
  assert.equal(result["city-events"], "pilot");
});

test("unknown or missing sources never read as live", () => {
  assert.ok(Object.values(states([])).every((state) => state === "pilot"));
});

