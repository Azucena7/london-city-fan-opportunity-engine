import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";
const read = p=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
const url = source=>`data:text/javascript;base64,${Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString("base64")}`;
const operations=url((await read("src/lib/clubOperations.ts")).replace(/import sample from .*?;/,`const sample=${await read("data/seed/club-operations-demo.json")};`));
const context=url((await read("src/lib/clubMatchContext.ts")).replace('from "./clubOperations";',`from "${operations}";`));
const {generateContextPlan}=await import(context);
const {proposalChanges}=await import(url(await read("src/lib/clubProposalChanges.ts")));
const sources={ticketing:"ready",crm:"ready",access:"ready",transport:"ready",weather:"ready"};
const draft=(excluded=[],kickoff="14:00",goal="repeat")=>generateContextPlan("2026-10-18",kickoff,"everton",goal,excluded,sources);
test("proposal comparison works before a draft exists without mutating either plan",()=>{
  const proposed=draft();const original=JSON.stringify(proposed);
  const delta=proposalChanges(null,proposed);
  assert.equal(delta.added.length,5);
  assert.equal(delta.removed.length,0);
  assert.equal(delta.taskDifference,25);
  assert.equal(JSON.stringify(proposed),original);
});
test("excluding one of two mobility signals changes evidence and tasks but retains the action",()=>{
  const current=draft();const proposed=draft(["transport"]);
  const delta=proposalChanges(current,proposed);
  assert.deepEqual(delta.updated.map(a=>a.id),["mobility"]);
  assert.equal(delta.removed.length,0);
  assert.equal(delta.taskDifference,-1);
  assert.deepEqual(delta.signals,[{id:"transport",before:"used",after:"excluded"}]);
});
test("removing weather drops its action unless attendance is the club's own objective",()=>{
  assert.deepEqual(proposalChanges(draft(),draft(["weather"])).removed.map(a=>a.id),["attendance"]);
  const delta=proposalChanges(draft([],"14:00","attendance"),draft(["weather"],"14:00","attendance"));
  assert.equal(delta.removed.length,0);
  assert.deepEqual(delta.updated.map(a=>a.id),["attendance"]);
});
test("kickoff changes affect scheduling and relevance; assignments alone do not change proposals",()=>{
  const delta=proposalChanges(draft(),draft([],"12:00"));
  assert.equal(delta.fixtureChanged,true);
  assert.deepEqual(delta.removed.map(a=>a.id),["acquisition"]);
  const current=draft();current.actions[0].owner="marketing";current.actions[0].tasks[0].done=true;current.actions[0].approvedVersion="v1";
  const unchanged=proposalChanges(current,draft());
  assert.equal(unchanged.unchanged.length,5);
  assert.equal(unchanged.updated.length,0);
  assert.equal(unchanged.taskDifference,0);
});
