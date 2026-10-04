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

test("runtime persistence identifiers use the AVELA namespace", () => {
  const server = readFileSync("src/lib/supabaseServer.ts", "utf8");
  const builder = readFileSync("src/components/CampaignCreditBuilder.tsx", "utf8");
  assert.match(server, /avela-sb-access/);
  assert.match(server, /avela-sb-refresh/);
  assert.doesNotMatch(server, /fge-sb-/);
  assert.match(builder, /avela:campaign-workspace/);
  assert.doesNotMatch(builder, /fan-growth-engine:/);
});

test("public product surfaces stay free of retired product names", () => {
  const paths = [
    "src/app/case-study/page.tsx",
    "src/app/case-study/technical/page.tsx",
    "src/components/LocalizedTechnicalCaseStudy.tsx",
    "src/app/pilot/page.tsx",
    "src/app/pilot/operating-pack/page.tsx",
    "src/app/for-clubs/page.tsx",
    "README.md"
  ];
  for (const path of paths) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /London City Fan Opportunity|Fan Growth Pilot|Fan Growth Playbook/);
  }
});

test("canonical surfaces do not link internally through retired redirect routes", () => {
  const paths = [
    "src/components/NavTabs.tsx",
    "src/components/LocalizedStoryPage.tsx",
    "src/components/LocalizedTechnicalCaseStudy.tsx",
    "src/app/pilot/rehearsal/page.tsx"
  ];
  const retiredHrefs = /href="\/(?:today|measurement|method|brief|results|london-city)"/;
  for (const path of paths) {
    assert.doesNotMatch(readFileSync(path, "utf8"), retiredHrefs, `${path} should link directly to a canonical surface`);
  }
});
