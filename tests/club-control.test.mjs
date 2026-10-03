import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(new URL("../src/lib/clubControl.ts",import.meta.url),"utf8");
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const d = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const date = "2026-10-18";
function reviews(version="v1",settings=d.defaultControl) { return d.requiredReviews(settings).map((kind) => d.attestReview(kind,version,"marketing",d.reviewers[kind],d.evidenceIds[kind],"approver","2026-10-01T00:00:00Z")); }
const blockers=(settings=d.defaultControl,paused=false,version="v1",rows=reviews(),owner="marketing",creative=true,day=date) => d.controlBlockers(settings,day,paused,version,rows,owner,creative);
test("base requires operational, brand and rights reviews; spending adds financial review",()=>{
  assert.deepEqual(d.requiredReviews(d.defaultControl),["operations","brand","rights"]);
  assert.ok(d.requiredReviews({...d.defaultControl,budget:1}).includes("finance"));
  assert.deepEqual(blockers(),[]);
  assert.ok(blockers({...d.defaultControl,budget:100}).includes("finance"));
});
test("reviews require authorised simulated role, designated reviewer and evidence; no self approval",()=>{
  assert.equal(d.attestReview("brand","v1","communications","communications",d.evidenceIds.brand,"approver","now"),null);
  assert.equal(d.attestReview("brand","v1","marketing","communications","unknown","approver","now"),null);
  assert.equal(d.attestReview("brand","v1","marketing","communications",d.evidenceIds.brand,"operator","now"),null);
  assert.equal(d.attestReview("brand","v1","marketing","ticketing",d.evidenceIds.brand,"approver","now"),null);
  assert.ok(blockers(d.defaultControl,false,"v1",reviews(),"communications").includes("brand"));
});
test("changed version and revoked reviews fail closed; pause overrides a complete sheet",()=>{
  assert.equal(blockers(d.defaultControl,false,"v2").length,3);
  assert.equal(blockers(d.defaultControl,false,"v1",[]).length,3);
  assert.ok(blockers(d.defaultControl,true).includes("paused"));
});
test("purpose withdrawn, minors and synthetic likeness cannot be enabled by approvals",()=>{
  for (const [field,value,reason] of [["purposeAllowed",false,"purpose"],["minors",true,"minors"],["syntheticLikeness",true,"likeness"]]) assert.ok(blockers({...d.defaultControl,[field]:value}).includes(reason));
});
test("unknown budget, missing creative, expired and invalid policy dates block launch",()=>{
  assert.ok(blockers({...d.defaultControl,budget:NaN}).includes("budget"));
  assert.ok(blockers(d.defaultControl,false,"v1",reviews(),"marketing",false).includes("creative"));
  for (const day of ["2028-10-18","2026-02-30",""]) assert.ok(blockers(d.defaultControl,false,"v1",reviews(),"marketing",true,day).includes("policy"));
});
const player={id:"P1",name:"Demo",signed:true,validated:true,document:"DEMO-RIGHTS",start:"2026-07-01",end:"2027-06-30",channels:["club-social"],territories:["UK"],blockedCategories:[],quota:2,confirmedDates:[date],fee:50};
const reservation={id:"A1",playerId:"P1",date,status:"reserved",channel:"club-social",territory:"UK",category:"retail",owner:"partnerships",evidence:null};
const talent=(p=player,rows=[reservation],channel="instagram",territory="UK",budget=100)=>d.talentLaunchBlockers(p,true,rows,date,channel,territory,budget);
test("valid existing reservation revalidates without duplicate reservation collision",()=>assert.deepEqual(talent(),[]));
test("event, cancelled or completed reservations cannot authorise social launch",()=>{
  for (const patch of [{channel:"event"},{status:"cancelled"},{status:"completed"}]) assert.ok(talent(player,[{...reservation,...patch}]).includes("reservation"));
});
test("social rights do not inherit WhatsApp, another territory or excluded categories",()=>{
  assert.ok(talent(player,[reservation],"whatsapp").includes("channel"));
  assert.ok(talent(player,[reservation],"instagram","ES").includes("territory"));
  assert.ok(talent({...player,blockedCategories:["retail"]}).includes("conflict"));
});
test("agreement revoked, expired, unknown quota and insufficient fee block talent",()=>{
  assert.ok(talent({...player,validated:false}).includes("agreement"));
  assert.ok(talent({...player,end:"2026-10-17"}).includes("dates"));
  assert.ok(talent({...player,quota:null}).includes("quota"));
  assert.ok(talent(player,[reservation],"instagram","UK",0).includes("talentBudget"));
  assert.deepEqual(d.talentLaunchBlockers(undefined,false,[],date,"whatsapp","UK",0),[]);
});
