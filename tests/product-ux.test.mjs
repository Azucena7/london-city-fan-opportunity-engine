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


test("social sharing tells the current decision-validation story", () => {
  const layout = read("src/app/layout.tsx");
  const card = read("src/app/linkedin-card/route.tsx");
  const og = read("src/app/opengraph-image.tsx");
  assert.match(layout, /London City Fan Opportunity Engine/);
  assert.match(layout, /From signals to decisions to observed outcomes/);
  assert.match(card, /Then reality/);
  assert.match(card, /DECISION VALIDATION · BRIGHTON/);
  assert.match(card, /CAUSATION CLAIMED/);
  assert.match(og, /REALITY CHECK · BRIGHTON/);
  assert.doesNotMatch(card, /A LIVING FAN INTELLIGENCE TOOL/);
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


test("visible product branding consistently uses Fan Opportunity Engine", () => {
  const nav = read("src/components/NavTabs.tsx");
  const partners = read("src/components/PartnerCommercialPack.tsx");
  const story = read("src/components/LocalizedStoryPage.tsx");
  const technical = read("src/components/LocalizedTechnicalCaseStudy.tsx");
  assert.match(nav, /LCL \/ FAN OPPORTUNITY ENGINE/);
  assert.match(partners, /London City Fan Opportunity Engine · Partner Commercial Pack/);
  assert.match(story, /London City Fan Opportunity Engine/);
  assert.match(technical, /London City Fan Opportunity Engine · Technical case study/);
  assert.doesNotMatch(nav, /FAN OPPORTUNITY LAB/);
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
