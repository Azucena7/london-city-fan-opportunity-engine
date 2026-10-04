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
  const retiredRoute = /["']\/(?:today|this-week|calendar|territories|experience|access|measurement|partners|sources|method|brief|results|london-city)["']/;
  for (const path of paths) {
    assert.doesNotMatch(readFileSync(path, "utf8"), retiredRoute, `${path} should link directly to a canonical surface`);
  }
  const analystNav = readFileSync("src/components/NavTabs.tsx", "utf8");
  assert.match(analystNav, /"\/live\/london-city"/);
  assert.match(analystNav, /"\/app\/matches"/);
  assert.match(analystNav, /"\/app\/campaigns"/);
  assert.match(analystNav, /"\/app\/learning"/);
  assert.match(analystNav, /"\/app\/players"/);
  assert.match(analystNav, /"\/app\/season"/);
  assert.match(analystNav, /"\/app\/sources"/);
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


test("retired story and live global stylesheets stay removed", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  for (const path of ["src/app/story.css", "src/app/live.css"]) {
    assert.equal(existsSync(path), false, `${path} should not return as a global legacy layer`);
  }
  assert.doesNotMatch(layout, /story\.css|live\.css/);
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


test("retired credit-ledger API alias stays removed", () => {
  assert.equal(existsSync("src/app/api/credit-ledger/route.ts"), false);
});


test("historical Vercel host permanently redirects to AVELA", () => {
  const config = readFileSync("next.config.mjs", "utf8");
  assert.match(config, /type: "host", value: "london-city-fan-opportunity-engine\.vercel\.app"/);
  assert.match(config, /destination: "https:\/\/avela-growth-intelligence\.vercel\.app\/:path\*"/);
  assert.match(config, /permanent: true/);
});


test("language persistence uses the AVELA namespace and only reads the retired key for migration", () => {
  const provider = readFileSync("src/components/LanguageProvider.tsx", "utf8");
  const i18n = readFileSync("src/lib/i18n.ts", "utf8");
  assert.match(provider, /avela-language/);
  assert.match(provider, /getItem\("lcl-language"\)/);
  assert.match(provider, /removeItem\("lcl-language"\)/);
  assert.doesNotMatch(provider, /setItem\("lcl-language"/);
  assert.doesNotMatch(provider, /dictionary\[lang\]|\bt:\s*dictionary/);
  assert.equal(i18n.trim(), 'export type Lang = "en" | "es";');
});


test("server language bootstrap prefers the AVELA cookie with legacy fallback", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(layout, /get\("avela-language"\)/);
  assert.match(layout, /\?\? cookieStore\.get\("lcl-language"\)/);
});


test("retired i18n fixes stylesheet stays removed", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.equal(existsSync("src/app/i18n-fixes.css"), false);
  assert.doesNotMatch(layout, /i18n-fixes\.css/);
});


test("shared language switcher uses AVELA design tokens", () => {
  const css = readFileSync("src/app/i18n.css", "utf8");
  assert.match(css, /var\(--product-accent, #6657FF\)/);
  assert.match(css, /var\(--product-accent-ink, #FFFFFF\)/);
  assert.match(css, /var\(--product-line, #D9DDE5\)/);
  assert.doesNotMatch(css, /lcl-hyperturq|lcl-navy/);
});
