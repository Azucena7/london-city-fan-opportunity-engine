import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const retiredRootArtifacts = [
  "HOTFIX.md",
  "REPO_MANIFEST.txt",
  "09_REPO_UPLOAD_CHECKLIST.md",
  "competitors.json",
  "fixtures.json",
  "grassroots_nodes.json",
  "london_city_fan_opportunity_v1_weekly_decision_engine.xlsx",
  "territories.json",
  "ticketing_strategy.json"
];

test("legacy bootstrap artifacts stay out of the repository root", () => {
  for (const path of retiredRootArtifacts) {
    assert.equal(existsSync(path), false, `${path} should not return to the repository root`);
  }
  for (let index = 1; index <= 16; index += 1) {
    const padded = String(index).padStart(2, "0");
    assert.equal(existsSync(`FRONTEND_BLOCK_${padded}.md`), false);
  }
  assert.equal(existsSync("FRONTEND_BLOCK_11_1.md"), false);
  assert.equal(existsSync("FRONTEND_BLOCK_11_2.md"), false);
});

test("canonical data and source locations remain present", () => {
  const canonicalPaths = [
    "data/seed/competitors.json",
    "data/seed/fixtures.json",
    "data/seed/grassroots.json",
    "data/seed/territories.json",
    "data/seed/ticketing.json",
    "data/source/london_city_fan_opportunity_v1_weekly_decision_engine.xlsx"
  ];

  for (const path of canonicalPaths) {
    assert.equal(existsSync(path), true, `${path} is a canonical project input`);
  }
});

test("retired first persistence prototype stays removed", () => {
  for (const path of [
    "docs/club-control-demo.md",
    "docs/club-private-drafts.md",
    "supabase/migrations/20261002_club_match_drafts.sql"
  ]) {
    assert.equal(existsSync(path), false, `${path} belongs to the retired first persistence prototype`);
  }
  assert.equal(existsSync("supabase/migrations/20261002_campaign_workspace.sql"), true);
});

test("legacy root seed tree and V1 frontend specification stay retired", () => {
  for (const path of [
    "seed/competitors.json",
    "seed/fixtures.json",
    "seed/grassroots.json",
    "seed/territories.json",
    "seed/ticketing.json",
    "05_FRONTEND_SPEC.md"
  ]) {
    assert.equal(existsSync(path), false, `${path} has a canonical replacement and should not return`);
  }
});

test("dependency install scripts stay explicitly reviewed and narrowly allowlisted", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.deepEqual(pkg.allowScripts, { "unrs-resolver": true });
  assert.equal(pkg.allowScripts["*"], undefined);
});
