import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/pilotWindow.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { cycleStates, windowProgress } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const calendar = [
  { id: "2026-09-26-bha-h", date: "2026-09-26", status: "final", attendance: 4177 },
  { id: "2026-10-18-eve-h", date: "2026-10-18", status: "scheduled" },
  { id: "2026-10-28-cry-h", date: "2026-10-28", status: "scheduled" },
  { id: "2026-11-01-mci-h", date: "2026-11-01", status: "scheduled" }
];

test("cycle states follow the calendar", () => {
  assert.deepEqual(Object.values(cycleStates(calendar, "2026-10-14")), ["Observed", "Active", "Next", "Next"]);
  const played = calendar.map((f) => f.id === "2026-10-18-eve-h" ? { ...f, status: "final" } : f);
  assert.deepEqual(Object.values(cycleStates(played, "2026-10-19")), ["Observed", "Played · evidence pending", "Active", "Next"]);
});

test("the end decision is only due once every cycle is played", () => {
  assert.equal(windowProgress(cycleStates(calendar, "2026-10-14")).endDecisionDue, false);
  const done = calendar.map((f) => ({ ...f, status: "final", attendance: 3000 }));
  const progress = windowProgress(cycleStates(done, "2026-11-02"));
  assert.deepEqual({ played: progress.played, observed: progress.observed, due: progress.endDecisionDue }, { played: 4, observed: 4, due: true });
});
