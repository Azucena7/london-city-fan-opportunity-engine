import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("source register uses unique ids and declared states", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const states = new Set(["operational", "degraded", "blocked", "not-configured", "requires-access"]);
  assert.equal(new Set(data.sources.map((source) => source.id)).size, data.sources.length);
  assert.ok(data.sources.every((source) => states.has(source.state)));
});

test("actionable source failures name the next owner action", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const actionable = data.sources.filter((source) => ["blocked", "not-configured"].includes(source.state));
  assert.ok(actionable.length > 0);
  assert.ok(actionable.every((source) => source.ownerAction?.en && source.ownerAction?.es));
});

test("operational modules are reachable from global navigation", () => {
  const nav = read("src/components/NavTabs.tsx");
  for (const route of ["/access", "/measurement", "/partners", "/sources"]) {
    assert.ok(nav.includes(`"${route}"`), `${route} should be visible in global navigation`);
  }
});

test("navigation names describe the internal product and fan-facing output", () => {
  const nav = read("src/components/NavTabs.tsx");
  for (const label of ["Fan Experience", "Matchday Access", "Partnerships", "Data & Sources"]) {
    assert.ok(nav.includes(label), `${label} should be visible in English navigation`);
  }
  for (const label of ["Experiencia del aficionado", "Acceso al partido", "Alianzas", "Datos y fuentes"]) {
    assert.ok(nav.includes(label), `${label} should be visible in Spanish navigation`);
  }
  assert.match(nav, /Product evaluation/);
  assert.match(nav, /Operational tools/);
});

test("document language and keyboard bypass are part of the root shell", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /lang=\{initialLang\}/);
  assert.match(layout, /className="skipLink"/);
  assert.match(layout, /href="#main-content"/);
});

test("Today is a progressive executive cockpit", () => {
  const today = read("src/components/LocalizedToday.tsx");
  assert.match(today, /Three actions before the next home fixture/);
  assert.match(today, /Three signals that change the action/);
  assert.match(today, /Why \$\{fixture\.planningScore\}/);
  assert.match(today, /timeZoneName: "short"/);
  assert.doesNotMatch(today, /<CampaignPlan/);
  assert.doesNotMatch(today, /<SourceHealthCenter/);
  assert.doesNotMatch(today, /<PostMatchScorecard/);
});

test("Calendar leads with fixture decisions and defers supporting evidence", () => {
  const calendar = read("src/components/LocalizedCalendarPage.tsx");
  assert.match(calendar, /FIXTURE-LED PLANNING/);
  assert.match(calendar, /NEXT HOME FIXTURE/);
  assert.match(calendar, /Operating actions/);
  assert.match(calendar, /className="calendarEvidence"/);
  assert.match(calendar, /scope === "home"/);
  assert.match(calendar, /scope === "results"/);
  assert.ok(calendar.indexOf("seasonTimeline") < calendar.indexOf("<DemandHistory"));
});

test("Territories flow into aggregated access before the fan preview", () => {
  const territories = read("src/components/LocalizedTerritoriesPage.tsx");
  const access = read("src/components/LocalizedAccessPage.tsx");
  assert.match(territories, /\/access\?territory=/);
  assert.match(territories, /Validate & acquire/);
  assert.match(access, /useState<View>\("territory"\)/);
  assert.match(access, /INTERNAL DECISION/);
  assert.match(access, /FAN PREVIEW/);
  assert.match(access, /initialTerritoryId=/);
});

test("Fan Experience separates internal control from the supporter preview", () => {
  const experience = read("src/components/ExperienceDemandValidation.tsx");
  assert.match(experience, /useState<ExperienceView>\("internal"\)/);
  assert.match(experience, /INTERNAL PRODUCT LAB/);
  assert.match(experience, /FAN-FACING PREVIEW/);
  assert.match(experience, /Concept portfolio to test/);
  assert.match(experience, /From interaction to decision/);
  assert.match(experience, /This is the test surface, not a commercial offer/);
});


test("Measurement is a decision control room before it is a technical dashboard", () => {
  const measurement = read("src/components/MeasurementDashboard.tsx");
  assert.match(measurement, /EVIDENCE CONTROL ROOM/);
  assert.match(measurement, /Fixture decision queue/);
  assert.match(measurement, /NEXT DECISION/);
  assert.match(measurement, /Keep measuring/);
  assert.match(measurement, /Instrument before deciding/);
  assert.match(measurement, /View technical instrumentation detail/);
});


test("Measurement compares prior engine hypotheses with observable club action without claiming causation", () => {
  const measurement = read("src/components/MeasurementDashboard.tsx");
  const validation = JSON.parse(read("data/live/decision-validation.json"));
  assert.match(measurement, /Engine hypothesis vs observable reality/);
  assert.match(measurement, /INTERPRETATION LIMIT/);
  assert.equal(validation.cases[0].hypothesisGeneratedAt.slice(0, 10), "2026-09-15");
  assert.equal(validation.cases[0].observedAt, "2026-09-18");
  assert.equal(validation.cases[0].observedSource.url, "https://www.londoncitylionesses.com/post/ldn-city-england-v-spain-watchalong");
  assert.match(validation.cases[0].caveat.en, /does not imply causation/i);
  assert.ok(validation.cases[0].dimensions.some((item) => item.state === "partial"));
});


test("Partnerships leads with an evidence-gated commercial decision queue", () => {
  const partners = read("src/components/PartnerCommercialPack.tsx");
  assert.match(partners, /PARTNERSHIP DECISION WORKSPACE/);
  assert.match(partners, /Commercial decision queue/);
  assert.match(partners, /ADVANCE TO REVIEW/);
  assert.match(partners, /BLOCKED GATES/);
  assert.match(partners, /Evidence and blockers first/);
  assert.ok(partners.indexOf("Commercial decision queue") < partners.indexOf("Open opportunity dossier"));
  assert.ok(partners.indexOf("Open opportunity dossier") < partners.indexOf("Evidence ledger"));
  assert.match(partners, /Export dossier/);
});


test("Data & Sources translates technical source health into business decision reliability", () => {
  const component = read("src/components/SourceHealthCenter.tsx");
  const page = read("src/components/LocalizedSourcesPage.tsx");
  const data = JSON.parse(read("data/live/source-health.json"));
  assert.match(component, /DECISION RELIABILITY/);
  assert.match(component, /Technical source register/);
  assert.match(component, /Open decision/);
  assert.match(page, /Which decisions can we trust today/);
  assert.ok(data.decisions.length >= 5);
  assert.ok(data.decisions.some((item) => item.id === "conversion-retention" && item.requiredSourceIds.includes("crm-ticketing")));
  assert.ok(data.decisions.some((item) => item.id === "attendance-benchmark" && item.requiredSourceIds.includes("wsl-attendance")));
});


test("production traffic is instrumented with private Vercel Web Analytics", () => {
  const layout = read("src/app/layout.tsx");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.dependencies["@vercel/analytics"], "^2.0.1");
  assert.match(layout, /@vercel\/analytics\/next/);
  assert.match(layout, /<Analytics \/>/);
});


test("Case study separates built product, observed alignment and unproven impact", () => {
  const page = read("src/app/case-study/page.tsx");
  const story = read("src/components/LocalizedStoryPage.tsx");
  const technical = read("src/components/LocalizedTechnicalCaseStudy.tsx");
  assert.match(page, /decisionValidation/);
  assert.match(story, /WHAT IS ACTUALLY DEMONSTRATED/);
  assert.match(story, /ENGINE HYPOTHESIS/);
  assert.match(story, /OBSERVED CLUB ACTION/);
  assert.match(story, /causation claimed/);
  assert.match(story, /FROM PROTOTYPE TO PILOT/);
  assert.match(story, /Six operating questions\. One system/);
  assert.match(technical, /V2\.0/);
  assert.match(technical, /Decision validation/);
  assert.match(technical, /Decision reliability/);
  assert.match(technical, /never implies causation/);
});


test("How it works leads with the decision lifecycle and keeps scoring secondary", () => {
  const method = read("src/components/LocalizedMethodPage.tsx");
  assert.match(method, /DECISION LIFECYCLE/);
  assert.match(method, /Six stages\. Three chances to stop/);
  assert.match(method, /Missing data ≠ zero/);
  assert.match(method, /Score ≠ permission/);
  assert.match(method, /Alignment ≠ causation/);
  assert.match(method, /SCORING & PRIORITISATION/);
  assert.ok(method.indexOf("DECISION LIFECYCLE") < method.indexOf("SCORING & PRIORITISATION"));
  assert.match(method, /Observe reality/);
});


test("global evidence claims stay consistent with current source availability", () => {
  const technical = read("src/components/LocalizedTechnicalCaseStudy.tsx");
  const executive = read("src/components/ExecutiveOverview.tsx");
  assert.doesNotMatch(technical, /Google Trends connected/);
  assert.doesNotMatch(technical, /proves the full path/);
  assert.match(technical, /benchmark only when its source is available/);
  assert.match(executive, /decisionReliabilityCounts/);
  assert.match(executive, /Decision reliability/);
  assert.match(executive, /Review confidence/);
});


test("social sharing matches the current Fan Growth Engine product story", () => {
  const layout = read("src/app/layout.tsx");
  const card = read("src/app/linkedin-card/route.tsx");
  const og = read("src/app/opengraph-image.tsx");
  assert.match(layout, /Fan Growth Engine/);
  assert.match(layout, /Turn fan data into the next best action for every fixture/);
  assert.match(card, /DECISION INTELLIGENCE FOR FOOTBALL CLUBS/);
  assert.match(card, /Morning Brief/);
  assert.match(card, /Opportunity/);
  assert.match(card, /Decision/);
  assert.match(card, /Results/);
  assert.match(og, /Live · Modelled · Missing/);
  assert.doesNotMatch(card, /\+280/);
});


test("Brighton club activation intelligence includes the observed England v Spain watchalong", () => {
  const activations = JSON.parse(read("data/seed/club-activations.json"));
  const watchalong = activations.observations.find((item) => item.id === "brighton-england-spain-watchalong");
  const alignment = activations.alignment.find((item) => item.id === "double-header");
  assert.ok(watchalong);
  assert.equal(watchalong.observedAt, "2026-09-18");
  assert.equal(watchalong.evidenceState, "observed");
  assert.equal(watchalong.sourceUrl, "https://www.londoncitylionesses.com/post/ldn-city-england-v-spain-watchalong");
  assert.equal(alignment.status, "partially-observed");
  assert.match(alignment.observed.en, /publicly announced/);
  assert.match(alignment.observed.en, /not yet verified/);
});


test("Today surfaces a compact engine-versus-reality check for the current fixture", () => {
  const page = read("src/app/today/page.tsx");
  const today = read("src/components/LocalizedToday.tsx");
  assert.match(page, /decisionValidation/);
  assert.match(today, /REALITY CHECK/);
  assert.match(today, /comparable public club action/);
  assert.match(today, /not influence on the club/);
  assert.match(today, /causation claimed/);
  assert.match(today, /\/measurement#decision-validation-title/);
  assert.ok(today.indexOf("REALITY CHECK") < today.indexOf("Three actions before the next home fixture"));
});


test("product and analyst branding are intentionally separated", () => {
  const productNav = read("src/components/ProductJourneyNav.tsx");
  const analystNav = read("src/components/NavTabs.tsx");
  assert.match(productNav, /Fan Growth Engine/);
  assert.match(productNav, /Morning brief/);
  assert.match(productNav, /Opportunity/);
  assert.match(productNav, /Analyst view/);
  assert.match(analystNav, /LONDON CITY \/ ANALYST VIEW/);
  assert.match(analystNav, /Evidence environment/);
  assert.match(analystNav, /Back to product/);
  assert.doesNotMatch(analystNav, /FAN OPPORTUNITY LAB/);
});


test("Brighton live validation preserves future phases as waiting evidence", () => {
  const validation = JSON.parse(read("data/live/decision-validation.json"));
  const item = validation.cases.find((entry) => entry.id === "brighton-england-spain-2026-09");
  assert.equal(item.liveValidation.state, "pre-match-active");
  assert.deepEqual(item.liveValidation.phases.map((phase) => phase.state), ["complete","complete","active","waiting","waiting"]);
  assert.ok(item.liveValidation.postMatchChecklist.some((entry) => entry.state === "requires-club-access"));
  assert.match(item.liveValidation.principle.en, /Future phases stay waiting/);
});

test("Today Calendar and Measurement share the same Brighton live validation lifecycle", () => {
  const today = read("src/components/LocalizedToday.tsx");
  const calendar = read("src/components/LocalizedCalendarPage.tsx");
  const measurement = read("src/components/MeasurementDashboard.tsx");
  assert.match(today, /todayValidationRail/);
  assert.match(calendar, /fixtureValidationLifecycle/);
  assert.match(measurement, /BRIGHTON LIVE VALIDATION/);
  assert.match(measurement, /postMatchChecklist/);
});


test("commercial product routes opt into the full-width product shell", () => {
  const routes = [
    "src/app/brief/page.tsx",
    "src/app/opportunity/page.tsx",
    "src/app/decision-room/page.tsx",
    "src/app/results/page.tsx",
    "src/app/impact/page.tsx",
    "src/app/pilot/page.tsx",
    "src/app/pilot/operating-pack/page.tsx",
    "src/app/demo/page.tsx",
    "src/app/cases/page.tsx"
  ];
  for (const route of routes) {
    assert.match(read(route), /productAppShell/, route + " should use the product app shell");
  }
  const system = read("src/app/product-system.css");
  assert.match(system, /\.productAppShell\{/);
  assert.match(system, /width:100%/);
  assert.match(system, /max-width:none/);
  assert.match(system, /padding-bottom:0/);
});

test("core product surfaces expose a shared Live Modelled Missing trust language", () => {
  const legend = read("src/components/ProductDataStateLegend.tsx");
  assert.match(legend, />Live</);
  assert.match(legend, />Modelled</);
  assert.match(legend, />Missing</);

  for (const route of [
    "src/app/opportunity/page.tsx",
    "src/app/decision-room/page.tsx",
    "src/app/impact/page.tsx",
    "src/app/results/page.tsx"
  ]) {
    assert.match(read(route), /ProductDataStateLegend/, route + " should show the shared data-state legend");
  }
});

test("mobile product flow keeps a contextual next action", () => {
  const brief = read("src/app/brief/page.tsx");
  const opportunity = read("src/app/opportunity/page.tsx");
  const briefCss = read("src/app/brief/brief.module.css");
  const opportunityCss = read("src/app/opportunity/opportunity.module.css");
  assert.match(brief, /Open Opportunity/);
  assert.match(opportunity, /Review Decision/);
  assert.match(briefCss, /position:fixed/);
  assert.match(opportunityCss, /position:fixed/);
});


test("Results switches from missing to measured only through the live CRM slot", () => {
  const page = read("src/app/results/page.tsx");
  const adapter = read("src/lib/productResults.ts");
  const live = JSON.parse(read("data/live/crm-ticketing.json"));

  assert.match(page, /getCurrentProductResults/);
  assert.match(page, /Club ticketing data connected/);
  assert.match(page, /Awaiting club conversion data/);
  assert.match(adapter, /datasetState !== "club-aggregate"/);
  assert.match(adapter, /campaignAttributedTickets/);
  assert.match(adapter, /repeatPurchaseRate/);
  assert.equal(live.datasetState, "requires-access");
  assert.deepEqual(live.fixtureSummaries, []);
  assert.deepEqual(live.repeatCohorts, []);
  assert.equal("records" in live, false);
});


test("decision confidence requires measured conversion evidence before it can become high", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  assert.match(opportunity, /conversionEvidenceConnected/);
  assert.match(opportunity, /state: "outcome-measured"/);
  assert.match(opportunity, /state: "audience-measured"/);
  assert.match(opportunity, /state: "missing"/);
  assert.match(opportunity, /strongEvidence >= 3 && !accessGap/);
  assert.match(opportunity, /campaignAttributedTickets > 0/);
});


test("repository CRM evidence is aggregate-only and importer never stores supporter hashes", () => {
  const live = JSON.parse(read("data/live/crm-ticketing.json"));
  const importer = read("scripts/import-crm-ticketing.mjs");
  const validator = read("scripts/validate-crm-ticketing-live.mjs");
  const pkg = JSON.parse(read("package.json"));

  assert.equal(live.scope, "club-crm-ticketing-aggregate");
  assert.equal("records" in live, false);
  assert.equal(pkg.scripts["import:crm"], "node scripts/import-crm-ticketing.mjs");
  assert.match(importer, /must stay outside the repository/);
  assert.match(importer, /rawRecordsStoredInRepository: false/);
  assert.match(importer, /fixtureSummaries/);
  assert.match(importer, /repeatCohorts/);
  assert.match(validator, /forbidden repository field/);
  assert.match(validator, /supporter_id_hash/);
  assert.match(validator, /ticket_id_hash/);
});


test("strategy and operational next action stay separate", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  const brief = read("src/app/brief/page.tsx");
  const decision = read("src/app/decision-room/page.tsx");

  assert.match(opportunity, /recommendedAction/);
  assert.match(opportunity, /nextRequiredAction/);
  assert.match(opportunity, /campaign\?\.nextApproval\.en/);
  assert.match(opportunity, /OVERDUE/);
  assert.match(brief, /nextAction\.label/);
  assert.match(brief, /Strategic recommendation/);
  assert.match(decision, /nextAction\.label/);
});


test("fixture lifecycle keeps pre-match and post-match UX distinct", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  const results = read("src/app/results/page.tsx");
  assert.match(opportunity, /fixturePhase: "pre-match" \| "matchday" \| "post-match"/);
  assert.match(opportunity, /timingLabel/);
  assert.match(opportunity, /T-\$\{daysToFixture\}/);
  assert.match(results, /Measurement starts after matchday/);
  assert.match(results, /Pre-match · outcome not available yet/);
});
