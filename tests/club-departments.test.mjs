import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const read = p => readFile(new URL(`../${p}`, import.meta.url), "utf8");
const code = ts.transpileModule(await read("src/lib/clubDepartments.ts"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { departments, departmentWork } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const plan = { actions: [{ id: "repeat", tasks: [{ id: "1", owner: "marketing", done: false, department: { en: "Business" } }, { id: "2", owner: "business", done: false }, { id: "3", owner: "business", done: true }, { id: "4", owner: "", done: false, department: { en: "Marketing" } }] }] };
test("department inbox counts explicit assignments, never suggested departments", () => {
  assert.deepEqual(departmentWork(plan, "marketing").pending.map(p => p.task.id), ["1"]);
  assert.deepEqual(departmentWork(plan, "business").pending.map(p => p.task.id), ["2"]);
  assert.equal(departmentWork(plan, "ticketing").pending.length, 0);
  assert.equal(departmentWork(plan, "all").pending.length, 3);
  assert.equal(departmentWork(plan, "direction").pending.length, 3);
  assert.equal(departmentWork(plan, "business").unassigned, 1);
});
test("missing plan has no invented tasks and departmental previews never mutate shared work", () => {
  assert.deepEqual(departmentWork(null, "business"), { pending: [], unassigned: 0, total: 0 });
  const original = JSON.stringify(plan);
  for (const id of Object.keys(departments)) departmentWork(plan, id);
  assert.equal(JSON.stringify(plan), original);
});
