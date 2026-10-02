import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";
const read = p=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
const url = source=>`data:text/javascript;base64,${Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString("base64")}`;
const operations=url((await read("src/lib/clubOperations.ts")).replace(/import sample from .*?;/,`const sample=${await read("data/seed/club-operations-demo.json")};`));
const context=url((await read("src/lib/clubMatchContext.ts")).replace('from "./clubOperations";',`from "${operations}";`));
const {generateContextPlan}=await import(context);
const comparison=url(await read("src/lib/clubProposalChanges.ts"));
const {proposalChanges}=await import(comparison);
const {recalculatePlan,rebaseActionCreatives}=await import(url((await read("src/lib/clubPlanRecalculation.ts")).replace('from "./clubOperations";',`from "${operations}";`).replace('from "./clubProposalChanges";',`from "${comparison}";`)));
const {actionVersion,generateCreative}=await import(operations);
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

test("recalculation preserves unchanged work and invalidates only changed actions",()=>{
  const current=draft();
  for(const action of current.actions){action.owner="marketing";action.measurement=true;action.audienceReviewed=true;action.tasks[0].owner="marketing";action.tasks[0].done=true;action.approvedVersion=actionVersion(action,current.date,sources);}
  const repeat=current.actions.find(a=>a.id==="repeat"), mobility=current.actions.find(a=>a.id==="mobility");
  const copy=action=>({...generateCreative(action,actionVersion(action,current.date,sources),"instagram","Club","Rival",current.date,"es"),text:"Texto editado",approvedVersion:"approved"});
  const packages={"repeat:instagram":copy(repeat),"mobility:instagram":copy(mobility)};
  const original=JSON.stringify([current,packages]);
  const result=recalculatePlan(current,draft(["transport","weather"]),packages,sources);
  assert.equal(result.plan.actions.length,4);
  assert.equal(result.plan.actions.find(a=>a.id==="repeat"),repeat);
  const changed=result.plan.actions.find(a=>a.id==="mobility");
  assert.equal(changed.owner,"marketing");assert.equal(changed.tasks[0].done,true);
  assert.equal(changed.approvedVersion,null);assert.equal(changed.audienceReviewed,false);
  assert.equal(result.creatives["repeat:instagram"],packages["repeat:instagram"]);
  assert.equal(result.creatives["mobility:instagram"].text,"Texto editado");
  assert.equal(result.creatives["mobility:instagram"].approvedVersion,null);
  assert.equal(result.creatives["mobility:instagram"].actionVersion,actionVersion(changed,current.date,sources));
  assert.equal(JSON.stringify([current,packages]),original);
});
test("date changes retain owners but reopen completed tasks; another fixture does not inherit work",()=>{
  const current=draft();current.actions[0].owner="marketing";current.actions[0].tasks[0].owner="marketing";current.actions[0].tasks[0].done=true;
  const shifted={...draft(),date:"2026-10-19"};
  const updated=recalculatePlan(current,shifted,{},sources).plan.actions[0];
  assert.equal(updated.owner,"marketing");assert.equal(updated.tasks[0].owner,"marketing");assert.equal(updated.tasks[0].done,false);
  const other=recalculatePlan(current,{...shifted,fixtureId:"another"},{},sources);
  assert.equal(other.plan.actions[0].owner,"");assert.equal(other.unchangedIds.length,0);
});
test("source changes invalidate dependent actions and removed tasks are not resurrected",()=>{
  const current=draft();const nextSources={...sources,crm:"stale"};
  const proposed=generateContextPlan("2026-10-18","14:00","everton","repeat",[],nextSources);
  const result=recalculatePlan(current,proposed,{},nextSources);
  assert.ok(!result.unchangedIds.includes("repeat"));
  assert.equal(result.plan.actions.find(a=>a.id==="repeat").approvedVersion,null);
  const removed=recalculatePlan(current,draft(["transport"]),{},sources);
  assert.ok(!removed.plan.actions.find(a=>a.id==="mobility").tasks.some(t=>t.id.includes("transport")));
});

test("reviewing an edited action keeps copy across channels and revokes creative approvals",()=>{
  const current=draft();const action=current.actions[0];
  const creative={...generateCreative(action,"old","instagram","Club","Rival",current.date,"es"),text:"Texto del club",approvedVersion:"old"};
  const whatsapp={...creative,channel:"whatsapp"};
  const updated={...action,owner:"marketing",audienceReviewed:true};
  const packages={"repeat:instagram":creative,"repeat:whatsapp":whatsapp};
  const result=rebaseActionCreatives(packages,updated,current.date,sources);
  assert.equal(result["repeat:instagram"].text,"Texto del club");
  assert.equal(result["repeat:whatsapp"].text,"Texto del club");
  assert.equal(result["repeat:instagram"].approvedVersion,null);
  assert.equal(result["repeat:whatsapp"].actionVersion,actionVersion(updated,current.date,sources));
  assert.equal(creative.approvedVersion,"old");
});
