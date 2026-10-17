import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { loadLib } from "./lib/load-ts.mjs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("internal work-management panels are hidden unless explicitly switched on", async () => {
  const { internalWorkManagementVisible } = await loadLib("frozenFeatures");
  const previous = process.env.AVELA_INTERNAL_WORK_MANAGEMENT;
  try {
    delete process.env.AVELA_INTERNAL_WORK_MANAGEMENT;
    assert.equal(internalWorkManagementVisible(), false);
    process.env.AVELA_INTERNAL_WORK_MANAGEMENT = "yes";
    assert.equal(internalWorkManagementVisible(), false);
    process.env.AVELA_INTERNAL_WORK_MANAGEMENT = " ON ";
    assert.equal(internalWorkManagementVisible(), true);
  } finally {
    if (previous === undefined) delete process.env.AVELA_INTERNAL_WORK_MANAGEMENT;
    else process.env.AVELA_INTERNAL_WORK_MANAGEMENT = previous;
  }
});

test("frozen panels are gated where they render; their APIs and data stay in place", () => {
  const brief = read("src/app/app/matches/[fixtureId]/page.tsx");
  const access = read("src/app/app/access/page.tsx");
  assert.match(brief, /internalWorkManagementVisible\(\) \? <OperationalCapacityPanel/);
  assert.match(brief, /internalWorkManagementVisible\(\) \? <OperationalHandoffs/);
  assert.match(access, /internalWorkManagementVisible\(\) \? \(\s*<div className=\{styles\.continuity\}>/);
  // The execution monitor is the replacement and is never gated.
  assert.match(brief, /<ExternalExecutionSync/);
  assert.doesNotMatch(brief, /internalWorkManagementVisible\(\) \? <ExternalExecutionSync/);
  for (const route of ["operational-requests", "operational-continuity", "operational-capacity"]) {
    assert.ok(read(`src/app/api/${route}/route.ts`).length > 0, `${route} API is kept`);
  }
});
