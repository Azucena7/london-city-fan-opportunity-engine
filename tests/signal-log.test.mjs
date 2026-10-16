import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/signalLog.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { describeSignalEffect, offRadarEffect, strongestEffect, isRecentSignal, summariseSignalLog } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const read = (radarState, confidence, rank) => ({ radarState, confidence, rank });

test("a signal changes a fixture's state only when the state differs without it", () => {
  const effect = describeSignalEffect("a", "v Everton", read("Act now", "Medium", 96), read("Review", "Medium", 90));
  assert.equal(effect.kind, "state");
  assert.equal(effect.label, "Moved v Everton from Review to Act now");
});

test("confidence and priority effects are reported before no change", () => {
  assert.equal(describeSignalEffect("a", "v X", read("Review", "Medium", 80), read("Review", "Low", 74)).kind, "confidence");
  const priority = describeSignalEffect("a", "v X", read("Review", "Low", 80), read("Review", "Low", 78));
  assert.equal(priority.kind, "priority");
  assert.match(priority.label, /^\+2 priority for v X; state stays Review$/);
});

test("no change says why, without claiming the signal was useless", () => {
  assert.match(describeSignalEffect("a", "v X", read("Act now", "Medium", 96), read("Act now", "Medium", 96), "low").label, /low materiality is not counted/);
  assert.match(describeSignalEffect("a", "v X", read("Act now", "Medium", 96), read("Act now", "Medium", 96), "high").label, /already at the cap/);
});

test("off-Radar signals name the reason and the strongest effect wins", () => {
  assert.equal(offRadarEffect("away", "@ Arsenal").kind, "off-radar");
  assert.match(offRadarEffect("played", "v Brighton").label, /already played/);
  assert.equal(strongestEffect([{ kind: "none" }, { kind: "priority" }, { kind: "off-radar" }]), "priority");
  assert.equal(strongestEffect([]), "off-radar");
});

test("new means observed in the seven days up to the product date, never in the future", () => {
  assert.equal(isRecentSignal("2026-10-12T09:00:00+01:00", "2026-10-16"), true);
  assert.equal(isRecentSignal("2026-10-01T09:00:00+01:00", "2026-10-16"), false);
  assert.equal(isRecentSignal("2026-10-20T09:00:00+01:00", "2026-10-16"), false);
});

test("the summary counts each signal once by its strongest effect", () => {
  const entries = [{ strongest: "state", isNew: true }, { strongest: "none", isNew: false }, { strongest: "off-radar", isNew: true }, { strongest: "priority", isNew: false }];
  assert.deepEqual(summariseSignalLog(entries), { total: 4, recent: 2, changedState: 1, changedConfidence: 0, changedPriority: 1, noChange: 2 });
});
