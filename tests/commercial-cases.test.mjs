import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("commercial fixture route resolves known cases and rejects unknown cases", async () => {
  const page = await source("src/app/london-city/[case]/page.tsx");
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

test("pilot discussion remains local with honest copy and no fabricated contact", async () => {
  const page = await source("src/components/ClubPilotProposition.tsx");
  assert.match(page, /navigator\.clipboard\.writeText\(brief\)/);
  assert.match(page, /catch \{\s*setCopyState\("manual"\)/);
  assert.match(page, /readOnly value=\{brief\}/);
  assert.match(page, /No request has been sent/);
  assert.doesNotMatch(page, /mailto:|commercialContact|contactHref/);
  assert.match(page, /No guaranteed commercial outcomes/);
  assert.match(page, /No live CRM or ticketing access is connected today/);
  assert.doesNotMatch(page, /fetch\(|onSubmit|type="email"/);
  assert.match(page, /htmlFor="pilot-goal"/);
  assert.match(page, /htmlFor="pilot-data"/);
  assert.match(page, /aria-live="polite"/);
});

test("new commercial views are discoverable from the product and case overview", async () => {
  const [marketingNav, appNav, product, pilot, overview] = await Promise.all([
    source("src/components/MarketingNav.tsx"), source("src/components/ProductJourneyNav.tsx"),
    source("src/app/page.tsx"), source("src/app/pilot/page.tsx"), source("src/components/LondonCityCase.tsx")
  ]);
  for (const page of [marketingNav, product, pilot]) assert.match(page, /href[=:]\s*"\/for-clubs"/);
  assert.doesNotMatch(appNav, /href[=:]\s*"\/for-clubs"/);
  assert.match(appNav, /href="\/"/);
  assert.match(overview, /href="\/london-city\/everton"/);
  assert.match(overview, /href="\/london-city\/brighton"/);
});

test("commercial primary link retains readable text against its dark button", async () => {
  const css = await source("src/app/commercial-pilot.css");
  assert.match(css, /\.commercialHero a\.productButton \{ color: #fff;/);
  assert.match(css, /\.commercialTableWrap \{ overflow-x: auto;/);
});
