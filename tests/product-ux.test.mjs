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

test("National Rail RDM is registered as approved access awaiting a data product", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const rdm = data.sources.find((source) => source.id === "national-rail-rdm");
  assert.ok(rdm);
  assert.equal(rdm.label.en, "National Rail / Rail Data Marketplace");
  assert.equal(rdm.access, "account-approved-product-pending");
  assert.equal(rdm.state, "not-configured");
  assert.match(rdm.note.en, /TransportAPI remains the temporary national-routing fallback/);

  const env = read(".env.example");
  assert.match(env, /RDM_DATA_PRODUCT_ID=/);
  assert.match(env, /RDM_DELIVERY_ENDPOINT=/);
  assert.match(env, /RDM_AUTH_MODE=/);
});
