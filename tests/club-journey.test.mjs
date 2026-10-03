import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const source = await read("src/lib/clubJourney.ts");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { rehearsalStage, visibleTasks, taskGroups, actionTaskProgress } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const action = { id: "repeat", owner: "", audienceReviewed: false, measurement: false, approvedVersion: null, simulatedVersion: null, tasks: [{ id: "a", owner: "marketing", done: false, offset: -2 }, { id: "b", owner: "", done: false, offset: -4 }, { id: "c", owner: "marketing", done: true, offset: -3 }] };
test("stages do not confuse approved actions with real campaign delivery", () => {
  assert.equal(rehearsalStage(action, "v1"), "preparing");
  assert.equal(rehearsalStage({ ...action, owner: "marketing", audienceReviewed: true, measurement: true }, "v1"), "review");
  assert.equal(rehearsalStage({ ...action, approvedVersion: "v1" }, "v1"), "approved");
  assert.equal(rehearsalStage({ ...action, simulatedVersion: "v1" }, "v1"), "simulated");
  assert.equal(rehearsalStage({ ...action, simulatedVersion: "v0", approvedVersion: "v0" }, "v1"), "preparing");
});
test("tasks filter by selected owner and completion without mutating the plan", () => {
  const plan = { actions: [action] };
  const original = JSON.stringify(plan);
  assert.deepEqual(visibleTasks(plan, "all", "pending").map(p => p.task.id), ["b", "a"]);
  assert.deepEqual(visibleTasks(plan, "marketing", "done").map(p => p.task.id), ["c"]);
  assert.deepEqual(visibleTasks(plan, "unassigned", "all").map(p => p.task.id), ["b"]);
  assert.deepEqual(visibleTasks(plan, "ticketing", "all"), []);
  assert.equal(JSON.stringify(plan), original);
});
test("calendar filters action and relative phase without inventing an overdue state", () => {
  const plan = { actions: [action, { ...action, id: "attendance", tasks: [{ id: "d", owner: "", done: false, offset: 0 }, { id: "e", owner: "marketing", done: false, offset: 4 }] }] };
  assert.deepEqual(visibleTasks(plan, "all", "all", "attendance", "matchday").map(p => p.task.id), ["d"]);
  assert.deepEqual(visibleTasks(plan, "all", "pending", "all", "after").map(p => p.task.id), ["e"]);
  assert.equal(visibleTasks(plan, "all", "all", "repeat", "after").length, 0);
  assert.deepEqual(taskGroups(visibleTasks(plan, "all", "all")).map(g => g.offset), [-4, -3, -2, 0, 4]);
});
test("action progress counts tasks independently of approvals and handles empty actions", () => {
  assert.deepEqual(actionTaskProgress(action), { total: 3, done: 1, unassigned: 1, firstOffset: -4, lastOffset: -2 });
  assert.deepEqual(actionTaskProgress({ ...action, tasks: [] }), { total: 0, done: 0, unassigned: 0, firstOffset: null, lastOffset: null });
});
test("legacy club demo routes redirect to the canonical guided demo", async () => {
  const config = await read("next.config.mjs");
  const page = await read("src/app/app/demo/page.tsx");
  assert.match(config, /source: "\/club-demo", destination: "\/app\/demo"/);
  assert.match(config, /source: "\/club-demo\/:path\*", destination: "\/app\/demo"/);
  assert.match(page, /DemoTour/);
});
