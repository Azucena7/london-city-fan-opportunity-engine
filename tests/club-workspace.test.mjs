import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/clubWorkspace.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { clubDemoDefaults, clubDemoExample, validateClubDemoData, clubDemoMetrics, canApproveClubDemo, clubDemoVersion } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const complete = { ...clubDemoDefaults, ownerAssigned: true, measurementAgreed: true };

test("workspace rejects inconsistent and non-synthetic aggregate examples", () => {
  assert.deepEqual(validateClubDemoData(clubDemoExample), []);
  assert.ok(validateClubDemoData({ ...clubDemoExample, synthetic: false }).includes("synthetic-only"));
  assert.ok(validateClubDemoData({ ...clubDemoExample, fixtureId: "other-club" }).includes("fixture"));
  assert.ok(validateClubDemoData({ ...clubDemoExample, scans: 1001 }).includes("scans"));
  assert.ok(validateClubDemoData({ ...clubDemoExample, repeatPurchased: 121 }).includes("repeat"));
  for (const ticketsSold of [-1, 0.5, Infinity, NaN]) assert.ok(validateClubDemoData({ ...clubDemoExample, ticketsSold }).includes("counts"));
  for (const revenue of [-1, Infinity, NaN]) assert.ok(validateClubDemoData({ ...clubDemoExample, revenue }).includes("revenue"));
});

test("missing and invalid data never produce measured zeros", () => {
  assert.equal(clubDemoMetrics(null), null);
  assert.equal(clubDemoMetrics({ ...clubDemoExample, scans: 2000 }), null);
  const empty = clubDemoMetrics({ ...clubDemoExample, ticketsSold: 0, scans: 0, revenue: 0, repeatEligible: 0, repeatPurchased: 0 });
  assert.equal(empty.scanRate, null);
  assert.equal(empty.repeatRate, null);
});

test("validated synthetic aggregates calculate descriptive rates correctly", () => {
  const metrics = clubDemoMetrics(clubDemoExample);
  assert.equal(metrics.scanRate, 0.8);
  assert.equal(metrics.repeatRate, 0.25);
  assert.equal(metrics.revenue, 12000);
});

test("approval requires the approver role, complete gates and valid data", () => {
  assert.equal(canApproveClubDemo(complete, clubDemoExample, "approver"), true);
  for (const role of ["viewer", "operator"]) assert.equal(canApproveClubDemo(complete, clubDemoExample, role), false);
  assert.equal(canApproveClubDemo(clubDemoDefaults, clubDemoExample, "approver"), false);
  assert.equal(canApproveClubDemo(complete, null, "approver"), false);
  assert.equal(canApproveClubDemo(complete, { ...clubDemoExample, scans: 2000 }, "approver"), false);
  assert.equal(canApproveClubDemo({ ...complete, goal: "invalid" }, clubDemoExample, "approver"), false);
});

test("approval version changes when goal, cadence or applied data changes", () => {
  const original = clubDemoVersion(complete, clubDemoExample);
  assert.notEqual(original, clubDemoVersion({ ...complete, goal: "attendance" }, clubDemoExample));
  assert.notEqual(original, clubDemoVersion({ ...complete, planningDays: 14 }, clubDemoExample));
  assert.notEqual(original, clubDemoVersion(complete, { ...clubDemoExample, revenue: 11000 }));
  assert.equal(original, clubDemoVersion({ ...complete }, { ...clubDemoExample }));
});

test("legacy workspace entry redirects to the canonical guided demo", async () => {
  const config = await readFile(new URL("../next.config.mjs", import.meta.url), "utf8");
  const page = await readFile(new URL("../src/app/app/demo/page.tsx", import.meta.url), "utf8");
  assert.match(config, /source: "\/club-demo", destination: "\/app\/demo"/);
  assert.match(page, /DemoTour/);
});
