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

test("pilot path stays honest and low-friction without fabricated contact", async () => {
  const page = await source("src/components/ClubPilotProposition.tsx");
  assert.doesNotMatch(page, /navigator\.clipboard|pilot-brief|copyBrief/);
  assert.doesNotMatch(page, /mailto:|commercialContact|contactHref/);
  assert.doesNotMatch(page, /fetch\(|onSubmit|type="email"/);
  assert.match(page, /No migration, no commitment and no personal data requested on this page/);
  assert.match(page, /Try the guided demo/);
  assert.match(page, /See the pilot structure/);
  assert.match(page, /AVELA does not need supporter names or emails/);
});

test("new commercial views are discoverable from the product and case overview", async () => {
  const [marketingNav, appNav, product, pilot, overview] = await Promise.all([
    source("src/components/MarketingNav.tsx"), source("src/components/ProductJourneyNav.tsx"),
    source("src/app/page.tsx"), source("src/app/pilot/page.tsx"), source("src/components/LondonCityCase.tsx")
  ]);
  assert.match(marketingNav, /\/for-clubs#demo/);
  assert.match(product, /\/for-clubs#demo/);
  assert.match(pilot, /href[=:]\s*"\/for-clubs"/);
  assert.doesNotMatch(appNav, /href[=:]\s*"\/for-clubs"/);
  assert.match(appNav, /href="\/"/);
  assert.match(overview, /href="\/live\/london-city\/everton"/);
  assert.match(overview, /href="\/live\/london-city\/brighton"/);
});

test("commercial primary link retains readable text against its dark button", async () => {
  const css = await source("src/app/commercial-pilot.css");
  assert.match(css, /\.commercialHero a\.productButton \{[^}]*color:#fff/);
  assert.match(css, /\.commercialTableWrap \{ overflow-x: auto;/);
});
