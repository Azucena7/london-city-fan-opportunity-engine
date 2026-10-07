import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("commercial fixture route resolves known cases and rejects unknown cases", async () => {
  const page = await source("src/app/live/london-city/[case]/page.tsx");
  assert.match(page, /2026-10-18-eve-h/);
  assert.match(page, /2026-09-26-bha-h/);
  assert.match(page, /key !== "everton" && key !== "brighton"\) notFound\(\)/);
  assert.match(page, /if \(!fixture \|\| !campaign\) notFound\(\)/);
  assert.match(page, /campaignPlans\.campaigns\.find/);
  assert.match(page, /decisionValidation\.cases\.find/);
});

test("commercial stories distinguish proposals, delivery and commercial outcomes", async () => {
  const story = await source("src/components/CommercialCaseStory.tsx");
  assert.match(story, /PROPOSED DECISION · NOT ACTIVATED/);
  assert.match(story, /Do not approve spend yet/);
  assert.match(story, /An announcement does not establish delivery/);
  assert.match(story, /campaign\.approvals\.map/);
  assert.match(story, /validation\?\.caveat\[lang\]/);
  assert.match(story, /A campaign identifier alone does not establish additional sales/);
  assert.match(story, /\/app\/learning\?fixture=\$\{fixture\.id\}/);
});

test("pilot path stays honest and low-friction with real lead capture", async () => {
  const page = await source("src/components/ClubPilotProposition.tsx");
  const route = await source("src/app/api/commercial-lead/route.ts");
  assert.doesNotMatch(page, /navigator\.clipboard|pilot-brief|copyBrief|mailto:/);
  assert.match(page, /fetch\("\/api\/commercial-lead"/);
  assert.match(page, /onSubmit=\{submitLead\}/);
  assert.match(page, /type="email"/);
  assert.match(page, /No supporter data or system access is requested at this stage/);
  assert.match(page, /Request a conversation/);
  assert.match(page, /Try the guided demo/);
  assert.match(page, /See the pilot structure/);
  assert.match(page, /AVELA does not need supporter names or emails/);
  assert.match(route, /commercial_leads/);
  assert.match(route, /supabaseServerConfigured/);
  assert.match(route, /supabaseServerRequest/);
  assert.doesNotMatch(route, /supabaseRequest\(/);
});

test("new commercial views are discoverable from the product and case overview", async () => {
  const [marketingNav, appNav, product, pilot, overview] = await Promise.all([
    source("src/components/MarketingNav.tsx"), source("src/components/ProductJourneyNav.tsx"),
    source("src/app/page.tsx"), source("src/app/pilot/page.tsx"), source("src/components/LondonCityCase.tsx")
  ]);
  assert.match(marketingNav, /\/for-clubs\?utm_source=avela_nav/);
  assert.match(product, /\/for-clubs\?utm_source=avela_home/);
  assert.match(pilot, /\/for-clubs\?utm_source=pilot/);
  assert.doesNotMatch(appNav, /href[=:]\s*"\/for-clubs"/);
  assert.match(appNav, /href="\/"/);
  assert.match(overview, /href="\/live\/london-city\/everton"/);
  assert.match(overview, /href="\/live\/london-city\/brighton"/);
});

test("commercial pilot cards and primary link retain readable styling", async () => {
  const css = await source("src/app/commercial-pilot.css");
  assert.match(css, /\.commercialHero a\.productButton \{[^}]*color:#fff/);
  assert.match(css, /\.commercialThreeColumns\{/);
  assert.match(css, /\.commercialNextStep\{/);
});


test("commercial home connects public proof to the multi-cycle pilot", async () => {
  const home = await source("src/app/page.tsx");
  assert.match(home, /The club pilot is a separate test/);
  assert.match(home, /Brighton, Everton, Crystal Palace and Manchester City/);
  assert.match(home, /See the 4-cycle London City pilot window/);
  assert.match(home, /href="\/pilot\?utm_source=avela_home/);
});


test("commercial lead capture requires server-side Supabase credentials", async () => {
  const server = await source("src/lib/supabaseServer.ts");
  assert.match(server, /CLUB_SUPABASE_SECRET_KEY/);
  assert.match(server, /CLUB_SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(server, /supabaseServerRequest/);
});


test("For Clubs surfaces the multi-cycle pilot window", async () => {
  const page = await source("src/components/ClubPilotProposition.tsx");
  assert.match(page, /Brighton, Everton, Crystal Palace and Manchester City/);
  assert.match(page, /See the 4-cycle pilot window/);
  assert.match(page, /utm_content=multi_cycle_proof/);
});

