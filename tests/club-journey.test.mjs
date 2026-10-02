import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const source = await read("src/lib/clubJourney.ts");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { rehearsalStage, visibleTasks } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
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
test("both demo entry routes lead to one canonical guided workspace", async () => {
  assert.match(await read("src/app/club-demo/page.tsx"), /ClubOperationsDemo/);
  assert.match(await read("src/app/club-demo/operations/page.tsx"), /redirect\("\/club-demo"\)/);
  const ui = await read("src/components/ClubOperationsDemo.tsx");
  assert.match(ui, /useState<View>\("home"\)/);
  assert.match(ui, /"home","plan","flow","calendar","audiences","partners","results"/);
  assert.match(ui, /actionStep === "prepare"/);
  assert.match(ui, /actionStep === "creative"/);
  assert.match(ui, /actionStep === "control"/);
});
test("configuration edits retain the plan and block approval pending resolution", async () => {
  const ui = await read("src/components/ClubOperationsDemo.tsx");
  const clear = ui.slice(ui.indexOf("function clearPlan()"), ui.indexOf("function go("));
  assert.doesNotMatch(clear, /setPlan\(null\)|setCreative\(null\)/);
  assert.match(ui, /configurationChanged \? \["configuration"\]/);
  assert.match(ui, /window.confirm/);
  assert.match(ui, /Descartar cambios/);
});
