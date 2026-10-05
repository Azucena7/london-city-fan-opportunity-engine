import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read=(path)=>readFileSync(path,"utf8");

test("operational continuity is embedded in the Team workspace",()=>{
  const page=read("src/app/app/access/page.tsx");
  const component=read("src/components/OperationalContinuity.tsx");
  assert.match(page,/OperationalContinuity/);
  assert.match(component,/Staff can change\. The operating memory should not\./);
  assert.match(component,/Access removal is the final step, not the first/);
  assert.match(component,/Do not deactivate the departing owner yet/);
  assert.match(component,/open decisions, requests, work packages, contracts, calendars, sources, access and tacit operating knowledge/i);
});

test("continuity protocol covers the operational handover surface",()=>{
  const component=read("src/components/OperationalContinuity.tsx");
  for(const label of ["Decisions","Requests","Work packages","Contracts","Calendar","Sources","Access","Knowledge"]){
    assert.ok(component.includes(label),label+" should remain in the handover surface");
  }
  assert.match(component,/Detect change/);
  assert.match(component,/Map exposure/);
  assert.match(component,/Transfer ownership/);
  assert.match(component,/Verify handover/);
  assert.match(component,/Deactivate last/);
  assert.match(component,/successor_status/);
  assert.match(component,/Ready to close/);
});

test("continuity persistence is club scoped, permissioned and closure gated",()=>{
  const sql=read("supabase/migrations/20261005114500_operational_continuity_protocol.sql");
  assert.match(sql,/operational_continuity_cases/);
  assert.match(sql,/operational_continuity_items/);
  assert.match(sql,/club_has_permission\(club_id,'users','view'\)/);
  assert.match(sql,/club_has_permission\(club_id,'users','administer'\)/);
  assert.match(sql,/closed continuity cases are immutable/);
  assert.match(sql,/cannot close while handover items remain unresolved/);
  assert.match(sql,/cannot close until successor coverage is confirmed/);
  assert.match(sql,/verified continuity handover items are immutable/);
  assert.match(sql,/foreign key\(case_id,club_id\)/);
});

test("continuity API creates a standard handover checklist and never deactivates access itself",()=>{
  const route=read("src/app/api/operational-continuity/route.ts");
  for(const category of ["decisions","requests","work-packages","contracts","calendar","sources","access","knowledge"]){
    assert.ok(route.includes('["'+category+'",'),category+" should be part of the default handover checklist");
  }
  assert.match(route,/successor_status/);
  assert.match(route,/Team-admin permission may be required/);
  assert.doesNotMatch(route,/club_memberships[^\n]*active\s*=\s*false/i);
  assert.doesNotMatch(route,/delete\s+from\s+public\.club_memberships/i);
});


test("Decision Center promotes unresolved continuity into operational attention",()=>{
  const helper=read("src/lib/decisionCenterOverview.ts");
  const home=read("src/app/app/page.tsx");
  assert.match(helper,/operational_continuity_cases/);
  assert.match(helper,/operational_continuity_items/);
  assert.match(helper,/Staff continuity ·/);
  assert.match(helper,/Confirm successor or interim coverage before access changes/);
  assert.match(helper,/continuity: \{/);
  assert.match(home,/Team continuity/);
  assert.match(home,/Open Team continuity/);
  assert.match(home,/opsState\.continuity/);
});
