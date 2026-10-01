import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const sample = JSON.parse(await readFile(new URL("../data/seed/club-operations-demo.json", import.meta.url), "utf8"));
const source = (await readFile(new URL("../src/lib/clubOperations.ts", import.meta.url), "utf8")).replace(/import sample from .*?;/, `const sample = ${JSON.stringify(sample)};`);
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const domain = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const { generatePlan, relativeDate, validDate, demoFans, eligibleFans, rankFans, approvalBlockers, actionVersion, generateCreative, creativeVersion, canSimulate, calendarExport } = domain;
const sources = { ticketing: "ready", crm: "ready", access: "ready", transport: "ready", weather: "ready" };
const readyAction = () => ({ ...generatePlan("2026-10-18", "repeat", false).actions[0], owner: "marketing", measurement: true, audienceReviewed: true });

test("plans recalculate relative dates, validate dates and reset approvals", () => {
  for (const goal of ["acquisition", "repeat", "attendance", "partners", "loyalty"]) {
    const plan = generatePlan("2026-10-18", goal, true);
    assert.deepEqual(plan.actions.map((item) => item.id), [goal, "mobility"]);
    assert.equal(plan.actions.flatMap((item) => item.tasks).length, 8);
    assert.ok(plan.actions.every((item) => item.approvedVersion === null && item.simulatedVersion === null));
  }
  const completePlan = generatePlan("2026-10-18", "repeat", true, true);
  assert.equal(completePlan.actions.length, 6);
  assert.equal(completePlan.actions.flatMap((item) => item.tasks).length, 24);
  assert.equal(new Set(completePlan.actions.map((item) => item.id)).size, 6);
  assert.equal(relativeDate("2026-10-18", -7), "2026-10-11");
  assert.equal(relativeDate("2026-12-30", 4), "2027-01-03");
  assert.equal(validDate("2026-02-30"), false);
  assert.throws(() => generatePlan("bad", "repeat", false));
  assert.throws(() => generatePlan("2026-10-18", "invalid", false));
});

test("repeat audiences suppress existing tickets, entitlements, opt-outs and fatigue", () => {
  assert.deepEqual(eligibleFans("repeat", demoFans).map((fan) => fan.id), ["DEMO-002", "DEMO-007"]);
  assert.ok(eligibleFans("attendance", demoFans).every((fan) => fan.hasTicket || fan.entitlement));
  assert.ok(eligibleFans("loyalty", demoFans).every((fan) => fan.reconciled));
  assert.deepEqual(eligibleFans("acquisition", demoFans), []);
});

test("rankings compare selected cohorts and never score unresolved attendance", () => {
  const subscribers = rankFans(demoFans, "subscriber", "attendance");
  assert.equal(subscribers.length, 2);
  assert.equal(subscribers[0].fan.id, "DEMO-001");
  assert.equal(subscribers[1].value, null);
  assert.equal(rankFans(demoFans, "occasional", "purchases")[0].fan.id, "DEMO-004");
});

test("approval requires owner, measurement, role, fresh sources and partner rights", () => {
  assert.deepEqual(approvalBlockers(readyAction(), "2026-10-18", sources, "approver"), []);
  assert.ok(approvalBlockers(readyAction(), "2026-10-18", sources, "operator").includes("role"));
  assert.ok(approvalBlockers(readyAction(), "2026-10-18", { ...sources, crm: "stale" }, "approver").includes("sources"));
  assert.ok(approvalBlockers({ ...readyAction(), owner: "" }, "2026-10-18", sources, "approver").includes("owner"));
  const partner = { ...generatePlan("2026-10-18", "partners", false).actions[0], owner: "partnerships", measurement: true, audienceReviewed: true };
  assert.ok(approvalBlockers(partner, "2026-10-18", sources, "approver").includes("rights"));
});

test("launch requires current action AND creative approval and prevents repeat execution", () => {
  const action = readyAction();
  const version = actionVersion(action, "2026-10-18", sources);
  action.approvedVersion = version;
  const creative = generateCreative(action, version, "instagram", "Demo Club", "Example opponent", "2026-10-18", "es");
  assert.equal(canSimulate(action, "2026-10-18", sources, "approver", creative), false);
  creative.approvedVersion = creativeVersion(creative);
  assert.equal(canSimulate(action, "2026-10-18", sources, "approver", creative), true);
  assert.equal(canSimulate(action, "2026-10-18", sources, "viewer", creative), false);
  assert.equal(canSimulate(action, "2026-10-19", sources, "approver", creative), false);
  assert.equal(canSimulate(action, "2026-10-18", { ...sources, crm: "missing" }, "approver", creative), false);
  assert.equal(canSimulate(action, "2026-10-18", sources, "approver", { ...creative, text: "Edited" }), false);
  const blank = { ...creative, text: " " }; blank.approvedVersion = creativeVersion(blank);
  assert.equal(canSimulate(action, "2026-10-18", sources, "approver", blank), false);
  assert.equal(canSimulate({ ...action, simulatedVersion: version }, "2026-10-18", sources, "approver", creative), false);
});

test("calendar export contains unique all-day events with recalculated end dates", () => {
  const ics = calendarExport(generatePlan("2026-10-18", "repeat", true), "es");
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 8);
  assert.equal(new Set(ics.match(/UID:[^\r]+/g)).size, 8);
  assert.match(ics, /DTSTART;VALUE=DATE:20261011/);
  assert.match(ics, /DTEND;VALUE=DATE:20261012/);
  assert.match(ics, /ENSAYO/);
  assert.ok(ics.split("\r\n").every((line) => Buffer.byteLength(line, "utf8") <= 75));
});

test("brand campaign and talent context participates in action and creative versions", () => {
  const action=readyAction();
  const one={...action,strategyVersion:"brand-v1-campaign-a-no-talent"};
  const two={...action,strategyVersion:"brand-v2-campaign-b-player-b"};
  assert.notEqual(actionVersion(one,"2026-10-18",sources),actionVersion(two,"2026-10-18",sources));
  const creative=generateCreative(one,actionVersion(one,"2026-10-18",sources),"instagram","Demo","Rival","2026-10-18","es",{name:"Campaign Demo",headline:"Un partido para compartir",brief:"Brief demo",talent:"Talento Demo B"});
  assert.equal(creative.headline,"Un partido para compartir");
  assert.equal(creative.brief,"Brief demo");
  assert.ok(creative.storyboard.some((shot)=>shot.includes("Talento Demo B")));
  assert.notEqual(creativeVersion(creative),creativeVersion({...creative,brief:"Changed"}));
});

test("sample manifest contains no real identities or live connections", () => {
  assert.equal(sample.synthetic, true);
  assert.equal(sample.schemaVersion, 1);
  assert.equal(new Set(sample.fans.map((fan) => fan.id)).size, sample.fans.length);
  assert.ok(sample.fans.every((fan) => fan.id.startsWith("DEMO-") && fan.visits <= fan.eligibleMatches));
  assert.ok(Object.entries(sample.delivery).filter(([key]) => key.endsWith("Connected")).every(([, value]) => value === false));
  assert.equal(sample.measurementExample.incrementalImpact, null);
});
