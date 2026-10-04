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
  const builder = readFileSync("src/components/CampaignDeliveryPlanner.tsx", "utf8");
  assert.match(server, /avela-sb-access/);
  assert.doesNotMatch(server, /avela-sb-refresh/);
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

test("authentication does not retain an unused Supabase refresh token", () => {
  const server = readFileSync("src/lib/supabaseServer.ts", "utf8");
  const login = readFileSync("src/app/api/auth/login/route.ts", "utf8");
  assert.doesNotMatch(server, /REFRESH_COOKIE|refreshToken/);
  assert.doesNotMatch(login, /refresh_token/);
  assert.match(login, /setSessionCookie\(payload\.access_token, payload\.expires_in\)/);
});

test("API responses are never cached by shared or browser caches", () => {
  const config = readFileSync("next.config.mjs", "utf8");
  assert.match(config, /source: "\/api\/:path\*"/);
  assert.match(config, /Cache-Control/);
  assert.match(config, /private, no-store, max-age=0/);
});

test("private persistence APIs do not expose raw provider error payloads", () => {
  const paths = [
    "src/app/api/access/route.ts",
    "src/app/api/access/approve/route.ts",
    "src/app/api/club-setup/route.ts",
    "src/app/api/delivery-effort/route.ts",
    "src/app/api/credit-ledger/route.ts",
    "src/app/api/campaign-history/[fixtureId]/route.ts",
    "src/app/api/campaign-workspace/[fixtureId]/route.ts"
  ];
  for (const path of paths) {
    assert.doesNotMatch(readFileSync(path, "utf8"), /detail:\s*payload/);
  }
});

test("technical package and outbound agents identify as AVELA", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  assert.equal(pkg.name, "avela-growth-intelligence");
  assert.equal(lock.name, "avela-growth-intelligence");
  assert.equal(lock.packages[""].name, "avela-growth-intelligence");

  for (const path of [
    "scripts/refresh-data.mjs",
    "scripts/refresh-public-signals.mjs"
  ]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /AVELA\/1\.0/);
    assert.doesNotMatch(source, /LondonCityFanOpportunityLab|research-prototype/);
  }
});

test("generated social cards use the default Node.js runtime", () => {
  for (const path of [
    "src/app/linkedin-card/route.tsx",
    "src/app/opengraph-image.tsx"
  ]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /ImageResponse/);
    assert.doesNotMatch(source, /runtime\s*=\s*["']edge["']/);
  }
});

test("retired standalone travel-delta prototype stays removed", () => {
  assert.equal(existsSync("src/lib/travelDelta.ts"), false);
});

test("retired territory-travel API prototype stays removed", () => {
  for (const path of [
    "src/app/api/territory-travel/route.ts",
    "src/lib/territoryTravel.ts",
    "data/territory_travel_origins.json"
  ]) {
    assert.equal(existsSync(path), false, `${path} belonged to the orphan territory-travel prototype`);
  }
});

test("retired standalone journey-routing prototype stays removed", () => {
  const retired = [
    "src/app/api/geocode/route.ts",
    "src/app/api/journey/route.ts",
    "src/app/api/national-journey/route.ts",
    "automations/journey-intelligence.md",
    "automations/national-journey-layer.md"
  ];
  for (const path of retired) assert.equal(existsSync(path), false, `${path} belonged to the retired journey-routing prototype`);

  const env = readFileSync(".env.example", "utf8");
  assert.doesNotMatch(env, /TFL_API_KEY|TRANSPORTAPI_APP_ID|TRANSPORTAPI_APP_KEY/);
  assert.match(env, /RDM_DATA_PRODUCT_ID/);
});

test("retired Club Operations licensing prototype stays removed", () => {
  assert.equal(existsSync("docs/club-licensing-strategy.md"), false);
  const strategy = readFileSync("src/lib/clubStrategy.ts", "utf8");
  assert.doesNotMatch(strategy, /ModuleId|licenceProposal|normalizeModules|toggleModule|Club Operations/);
});

test("canonical public surfaces use the AVELA production host", () => {
  const canonical = "https://avela-growth-intelligence.vercel.app";
  const legacy = "https://london-city-fan-opportunity-engine.vercel.app";
  const paths = [
    "src/app/robots.ts",
    "src/app/sitemap.ts",
    "src/app/layout.tsx",
    "scripts/refresh-data.mjs",
    "scripts/refresh-public-signals.mjs",
    "src/components/ClubPilotProposition.tsx",
    "data/contracts/campaign-plan.schema.json",
    "data/contracts/pilot-readiness.schema.json",
    "data/contracts/crm-ticketing.schema.json",
    "data/contracts/search-demand.schema.json",
    "data/contracts/experience-demand.schema.json",
    "data/contracts/partner-commercial-pack.schema.json",
    "data/contracts/experiment-measurement.schema.json",
    "data/contracts/mobility-partnership.schema.json",
    "data/live/audience-reach.json"
  ];
  for (const path of paths) {
    const source = readFileSync(path, "utf8");
    assert.ok(source.includes(canonical), `${path} should reference the AVELA canonical host`);
    assert.ok(!source.includes(legacy), `${path} should not reference the historical host`);
  }
});
