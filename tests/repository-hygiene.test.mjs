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


test("AVELA product eyebrow labels override the case-study accent", () => {
  const css = readFileSync("src/app/product-system.css", "utf8");
  assert.match(css, /\.productShell \.eyebrow/);
  assert.match(css, /\.productAppShell \.eyebrow/);
  assert.match(css, /color:var\(--product-accent\)/);
});


test("Supabase runtime accepts only publishable-key naming", () => {
  const server = readFileSync("src/lib/supabaseServer.ts", "utf8");
  const env = readFileSync(".env.example", "utf8");
  assert.match(server, /CLUB_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(server, /NEXT_PUBLIC_CLUB_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(server, /CLUB_SUPABASE_ANON_KEY|NEXT_PUBLIC_CLUB_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(env, /CLUB_SUPABASE_ANON_KEY|NEXT_PUBLIC_CLUB_SUPABASE_ANON_KEY/);
});


test("runtime env example contains only active or explicitly planned contracts", () => {
  const env = readFileSync(".env.example", "utf8");
  assert.doesNotMatch(env, /WEATHER_API_KEY|NEXT_PUBLIC_MAP_STYLE_URL/);
  assert.match(env, /AI_GATEWAY_API_KEY/);
  assert.match(env, /CLUB_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(env, /RDM_DATA_PRODUCT_ID/);
});


test("architecture document reflects the as-built AVELA runtime", () => {
  const architecture = readFileSync("docs/architecture.md", "utf8");
  assert.match(architecture, /Current system/);
  assert.match(architecture, /Supabase Auth \+ RLS/);
  assert.match(architecture, /Vercel AI Gateway/);
  assert.match(architecture, /There is no hidden TransportAPI fallback/);
  assert.match(architecture, /delivery_effort_events/);
  assert.match(architecture, /former `credit_ledger` table is retained only during the staged database cutover/);
  assert.doesNotMatch(architecture, /Phase 1 - Public prototype|Phase 2 - Live decision engine|Phase 3 - Agentic workflows/);
});


test("commercial home keeps one canonical CSS layer", () => {
  const css = readFileSync("src/app/commercial-home.module.css", "utf8");
  assert.doesNotMatch(css, /tickerTint/);
  assert.doesNotMatch(css, /animation:\s*none!important/);
  assert.doesNotMatch(css, /Reading-width and hierarchy reset|Remove legacy oversized\/full-bleed behavior/);
  assert.equal((css.match(/^\.signalTicker\{/gm) ?? []).length, 1);
});


test("construction-era stylesheet names stay retired", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  for (const path of ["src/app/block14.css", "src/app/block16.css", "src/app/ux-consolidation.css"]) {
    assert.equal(existsSync(path), false, `${path} is a construction-era artifact`);
    assert.ok(!layout.includes(path.split("/").at(-1)), `${path} should not be imported`);
  }
  for (const path of ["src/app/workspace-structure.css", "src/app/case-study.css", "src/app/product-ux.css"]) {
    assert.equal(existsSync(path), true, `${path} is a canonical stylesheet`);
  }

  const workflow = readFileSync(".github/workflows/daily-data-refresh.yml", "utf8");
  assert.match(workflow, /avela-data-bot/);
  assert.doesNotMatch(workflow, /lcl-data-bot/);
});


test("shared visual system avoids the retired lcl CSS namespace", () => {
  const activeStyles = [
    "src/app/case-brand.css",
    "src/app/workspace-structure.css",
    "src/app/case-study.css",
    "src/app/product-ux.css"
  ];
  for (const path of activeStyles) {
    assert.doesNotMatch(readFileSync(path, "utf8"), /--lcl-/);
  }
  assert.equal(existsSync("src/app/brand.css"), false);
  assert.match(readFileSync("src/app/layout.tsx", "utf8"), /case-brand\.css/);
});


test("phase-numbered root documentation stays retired", () => {
  const retired = [
    "01_PRODUCT_BRIEF.md",
    "02_ARCHITECTURE.md",
    "03_DATA_MODEL.md",
    "04_SCORING_LOGIC.md",
    "06_AUTOMATIONS_AND_AGENTS.md",
    "07_SOURCE_REGISTER.md",
    "08_ROADMAP.md"
  ];
  for (const path of retired) assert.equal(existsSync(path), false, `${path} belongs in docs/`);

  for (const path of [
    "docs/product-brief.md",
    "docs/architecture.md",
    "docs/data-model.md",
    "docs/scoring-logic.md",
    "docs/automations-and-agents.md",
    "docs/source-register.md",
    "docs/roadmap.md",
    "docs/daily-update-runbook.md",
    "docs/womens-football-product-thesis.md",
    "docs/README.md"
  ]) assert.equal(existsSync(path), true, `${path} is canonical documentation`);
});


test("retired live weather scoring prototype stays removed", () => {
  for (const path of [
    "src/lib/scoring.ts",
    "src/lib/weather.ts",
    "automations/LIVE_STATE.md",
    "automations/TRAVEL_FRICTION_DELTA.md",
    "automations/fixture-selection.md",
    "automations/live-signal-contract.md",
    "automations/weather-live.md"
  ]) assert.equal(existsSync(path), false, `${path} belonged to the retired live-weather prototype`);

  assert.doesNotMatch(readFileSync("src/lib/models.ts", "utf8"), /LiveMatchState/);
});


test("orphan source-health helper stays retired", () => {
  assert.equal(existsSync("src/lib/sourceHealth.ts"), false);
});


test("Node runtime stays aligned across Vercel and CI", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const quality = readFileSync(".github/workflows/quality-gate.yml", "utf8");
  const refresh = readFileSync(".github/workflows/daily-data-refresh.yml", "utf8");

  assert.equal(pkg.engines?.node, "24.x");
  assert.equal(lock.packages[""].engines?.node, "24.x");
  assert.match(quality, /node-version: 24/);
  assert.match(refresh, /node-version: 24/);
});


test("permission migration generator is enforced", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const quality = readFileSync(".github/workflows/quality-gate.yml", "utf8");
  assert.equal(pkg.scripts["check:permissions"], "node scripts/generate-club-permissions-migration.mjs --check");
  assert.match(pkg.scripts.build, /check:permissions/);
  assert.match(quality, /npm run check:permissions/);
});


test("active CSS avoids construction-phase labels", () => {
  for (const path of [
    "src/app/case-study.css",
    "src/app/navigation-v2.css",
    "src/app/workspace-structure.css",
    "src/app/product-ux.css"
  ]) {
    const css = readFileSync(path, "utf8");
    assert.doesNotMatch(css, /\/\*\s*(?:Block \d+|PR #\d+)/);
  }
});


test("historical redirects are explicitly isolated from canonical routing", () => {
  const config = readFileSync("next.config.mjs", "utf8");
  assert.match(config, /const historicalWorkspaceRedirects/);
  assert.match(config, /const historicalClubRedirects/);
  assert.match(config, /const historicalProofRedirects/);
  assert.match(config, /historicalRouteRedirects\.map/);
  assert.doesNotMatch(config, /const redirects =/);
});


test("automation documentation distinguishes live workflows from future agents", () => {
  const doc = readFileSync("docs/automations-and-agents.md", "utf8");
  assert.match(doc, /deterministic scheduled workflows and validation scripts/);
  assert.match(doc, /daily-data-refresh\.yml/);
  assert.match(doc, /Node\.js 24/);
  assert.match(doc, /refresh:data/);
  assert.match(doc, /refresh:public-signals/);
  assert.match(doc, /Future agentic layer/);
  assert.match(doc, /future capability, not part of the current production claim/);
  assert.doesNotMatch(doc, /Existing monitoring concept/);
});


test("canonical product docs use current effort and CRM persistence contracts", () => {
  const product = readFileSync("docs/product-brief.md", "utf8");
  const model = readFileSync("docs/data-model.md", "utf8");

  assert.match(product, /estimated delivery effort/);
  assert.doesNotMatch(product, /credit estimate/);

  assert.match(model, /external import contract/);
  assert.match(model, /Authorised row-level exports must stay outside the repository/);
  assert.match(model, /writes only aggregate evidence/);
  assert.match(model, /Pseudonymous supporter, order and ticket hashes are input-only/);
  assert.match(model, /fixture summaries and repeat cohorts/);
  assert.doesNotMatch(model, /## CrmTicketingRecord v1\.0/);
});


test("refresh language matches the scheduled as-built automation", () => {
  const product = readFileSync("docs/product-brief.md", "utf8");
  const runbook = readFileSync("docs/daily-update-runbook.md", "utf8");
  const readme = readFileSync("README.md", "utf8");
  const radar = readFileSync("src/app/app/matches/page.tsx", "utf8");
  const socialCard = readFileSync("src/app/linkedin-card/route.tsx", "utf8");

  assert.match(product, /scheduled cadence/);
  assert.match(product, /scheduled fixture refresh/);
  assert.doesNotMatch(product, /continuously reads/);
  assert.match(runbook, /active daily workflow already refreshes its declared public sources/);
  assert.doesNotMatch(runbook, /after this pull request is merged/);
  assert.match(readme, /scheduled fixture refresh starts the work automatically/);
  assert.match(radar, /re-prioritised whenever the validated evidence state refreshes/);
  assert.doesNotMatch(radar, /continuously re-prioritised/);
  assert.match(socialCard, /Scheduled fixture refresh starts monitoring/);
});


test("canonical delivery-effort storage is versioned and application-facing", () => {
  const migration = readFileSync("supabase/migrations/20261004193752_create_delivery_effort_events.sql", "utf8");
  const route = readFileSync("src/app/api/delivery-effort/route.ts", "utf8");
  assert.match(migration, /create table if not exists public\.delivery_effort_events/);
  assert.match(migration, /units integer not null/);
  assert.match(migration, /campaign viewers can read delivery effort events/);
  assert.match(migration, /campaign editors can add delivery effort events/);
  assert.match(route, /delivery_effort_events/);
  assert.doesNotMatch(route, /credit_ledger|credits/);
});
