import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const sample=JSON.parse(await readFile(new URL("../data/seed/club-strategy-demo.json",import.meta.url),"utf8"));
const source=(await readFile(new URL("../src/lib/clubStrategy.ts",import.meta.url),"utf8")).replace(/import sample from .*?;/,`const sample = ${JSON.stringify(sample)};`);
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const d=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const request={date:"2026-10-18",category:"retail",channel:"club-social",territory:"UK",owner:"partnerships",budget:500};
const weights={fit:40,balance:40,engagement:20};

test("brand imports whitelist synthetic fields and reject private or unsafe schemas",()=>{
  assert.deepEqual(d.parseDemoBrand(JSON.stringify(sample.brand)),sample.brand);
  assert.throws(()=>d.parseDemoBrand(JSON.stringify({...sample.brand,synthetic:false})));
  assert.throws(()=>d.parseDemoBrand(JSON.stringify({...sample.brand,primary:"url(https://example.com)"})));
  assert.throws(()=>d.parseDemoBrand(JSON.stringify({...sample.brand,font:"external-font"})));
  assert.throws(()=>d.parseDemoBrand("x".repeat(10001)));
  assert.equal(d.parseDemoBrand(JSON.stringify({...sample.brand,url:"https://example.com"})).url,undefined);
});
test("campaign direction is independent and versions bind exact content and dates",()=>{
  const brand=structuredClone(sample.brand),campaign=structuredClone(sample.campaigns[1]);
  assert.deepEqual(d.campaignBlockers(brand,campaign,request.date),[]);
  assert.ok(d.campaignBlockers(brand,campaign,"2027-01-01").includes("dates"));
  assert.ok(d.campaignBlockers(brand,{...campaign,start:"2026-02-30"},request.date).includes("dates"));
  assert.ok(d.campaignBlockers(brand,{...campaign,headline:{es:"",en:""}},request.date).includes("brief"));
  assert.ok(d.campaignBlockers(brand,{...campaign,primary:campaign.background},request.date).includes("contrast"));
  const version=d.brandCampaignVersion(brand,campaign);
  assert.notEqual(version,d.brandCampaignVersion(brand,{...campaign,end:"2026-11-30"}));
  assert.notEqual(version,d.brandCampaignVersion({...brand,version:2},campaign));
  assert.equal(brand.primary,"#21432f");
});
test("intelligence separates account, format and platform and uses weighted denominators",()=>{
  const rows=d.contentInsights(d.demoPosts,{account:"club",platform:"instagram",format:"video"},"playerId","rate");
  assert.equal(rows[0].id,"PLAYER-DEMO-D");
  assert.equal(rows.find((r)=>r.id==="PLAYER-DEMO-B").rate,8);
  assert.equal(rows.find((r)=>r.id==="PLAYER-DEMO-B").delta,3);
  assert.equal(rows.find((r)=>r.id==="PLAYER-DEMO-A").interactions,2000);
  const own=d.contentInsights(d.demoPosts,{account:"player",platform:"instagram",format:"video"},"playerId","volume");
  assert.equal(own.length,1);assert.equal(own[0].interactions,3000);
  const image=d.contentInsights(d.demoPosts,{account:"club",platform:"instagram",format:"image"},"playerId","rate");
  assert.equal(image.find((r)=>r.id==="PLAYER-DEMO-C").rate,null);
  assert.equal(image.find((r)=>r.id==="PLAYER-DEMO-C").delta,null);
  const all=d.contentInsights(d.demoPosts,{account:"club",platform:"instagram",format:"all"},"playerId","rate");
  assert.ok(Math.abs(all.find((r)=>r.id==="PLAYER-DEMO-B").rate - 7) < 1e-10);
});
test("rights are hard gates before ranking and capacity includes future commitments",()=>{
  const [a,b,c,dPlayer]=d.demoPlayers;
  assert.deepEqual(d.playerCapacity(a,d.demoAppearances),{completed:2,reserved:1,remaining:1,used:3});
  assert.deepEqual(d.activationBlockers(b,request,d.demoAppearances),[]);
  assert.ok(d.activationBlockers(a,{...request,category:"mobility"},d.demoAppearances).includes("conflict"));
  assert.ok(d.activationBlockers(c,{...request,date:"2027-07-01"},d.demoAppearances).includes("dates"));
  assert.ok(d.activationBlockers(dPlayer,request,d.demoAppearances).includes("agreement"));
  assert.ok(d.activationBlockers(dPlayer,request,d.demoAppearances).includes("quotaUnknown"));
  for(const [patch,reason] of [[{channel:"paid-ad"},"channel"],[{territory:"US"},"territory"],[{budget:0},"budget"],[{owner:""},"owner"],[{date:"2026-10-20"},"availability"]]) assert.ok(d.activationBlockers(b,{...request,...patch},d.demoAppearances).includes(reason));
});
test("allocation explains scores, respects weights and never ranks an ineligible player first",()=>{
  const ranked=d.recommendPlayers(d.demoPlayers,request,d.demoAppearances,weights,d.demoPosts,true);
  assert.equal(ranked[0].player.id,"PLAYER-DEMO-C");
  assert.equal(ranked[0].blockers.length,0);
  assert.equal(ranked.find((r)=>r.player.id==="PLAYER-DEMO-D").rate,9);
  const balanced=d.recommendPlayers(d.demoPlayers,request,d.demoAppearances,{fit:1,balance:100,engagement:0},d.demoPosts,false);
  assert.equal(balanced[0].player.id,"PLAYER-DEMO-C");
  assert.throws(()=>d.recommendPlayers(d.demoPlayers,request,[],{fit:0,balance:0,engagement:0},[],false));
  assert.throws(()=>d.recommendPlayers(d.demoPlayers,request,[],{fit:-1,balance:1,engagement:1},[],true));
  const noMetric=d.recommendPlayers([d.demoPlayers[1]],request,[],weights,[],true)[0];
  assert.equal(noMetric.rate,null);assert.equal(noMetric.score,92.5);
});
test("reservation is gated, prevents duplicates and completion does not consume twice",()=>{
  const player=d.demoPlayers[1];
  assert.throws(()=>d.reserveAppearance(player,request,d.demoAppearances,"operator"));
  let list=d.reserveAppearance(player,request,d.demoAppearances,"approver");
  assert.equal(d.playerCapacity(player,list).remaining,3);
  assert.throws(()=>d.reserveAppearance(player,request,list,"approver"));
  const id=list.at(-1).id;
  assert.throws(()=>d.completeAppearance(id,list,"viewer"));
  list=d.completeAppearance(id,list,"approver");
  assert.equal(d.playerCapacity(player,list).remaining,3);
  assert.throws(()=>d.completeAppearance(id,list,"approver"));
  list=list.map((a)=>a.id===id?{...a,status:"cancelled"}:a);
  const replacement=d.reserveAppearance(player,request,list,"approver");
  assert.notEqual(replacement.at(-1).id,id);
  assert.equal(new Set(replacement.map((a)=>a.id)).size,replacement.length);
});
test("strategy source has no actual players, contracts, Blinkfire values or credentials",()=>{
  assert.equal(sample.synthetic,true);assert.equal(sample.schemaVersion,1);
  assert.ok(sample.players.every((p)=>p.id.startsWith("PLAYER-DEMO-")));
  assert.ok(sample.appearances.every((a)=>a.id.startsWith("AP-DEMO-")));
  assert.equal(sample.posts.length,9);
  assert.ok(!/api[_-]?key|access[_-]?token|@/i.test(JSON.stringify(sample)));
});
