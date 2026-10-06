import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("Matchday Companion keeps live and modelled travel separate", () => {
  const widget = read("src/components/MatchdayCompanionWidget.tsx");
  const provider = read("src/lib/mobilityProviderReadiness.ts");
  const api = read("src/app/api/matchday/[fixtureId]/travel/route.ts");

  assert.match(widget, /planning signal only/);
  assert.match(provider, /Do not present a route as live until an authorised provider returns a timestamped route response/);
  assert.match(api, /Never present modelled travel friction as a live route/);
});

test("Matchday Companion measurement stays privacy safe", () => {
  const measurement = JSON.parse(read("data/live/experiment-measurement.json"));
  const prohibited = new Set(measurement.prohibitedFields);
  for (const field of ["address", "postcode", "ip_address", "user_agent", "supporter_id"]) {
    assert.equal(prohibited.has(field), true, field + " must remain prohibited");
  }

  const events = new Map(measurement.events.map((event) => [event.name, event]));
  for (const name of ["matchday_utility_opened", "matchday_official_directions_opened", "matchday_official_ticketing_opened"]) {
    const event = events.get(name);
    assert.ok(event, "missing " + name);
    assert.deepEqual(event.allowedProperties, ["surface"]);
  }
});

test("Matchday Companion territory context never treats club postcode data as public", () => {
  const territory = read("src/lib/matchdayTerritoryContext.ts");
  assert.match(territory, /authorisedPostcodeState: crmTicketingLive\.datasetState/);
  assert.match(territory, /exact supporter postcodes are not exposed/i);
});

test("TfL road adapter fails closed when credentials are absent", () => {
  const road = read("src/app/api/matchday/road/route.ts");
  assert.match(road, /if \(!appId \|\| !appKey\)/);
  assert.match(road, /state: "not-configured"/);
  assert.match(road, /MATERIAL_RADIUS_KM/);
});


test("Matchday Companion does not infer checkout or ticket inventory from a commercial landing", () => {
  const resolver = read("src/lib/verifiedFixtureTicketing.ts");
  const landing = read("src/app/matchday/[fixtureId]/page.tsx");
  assert.match(resolver, /looksLikeOfficialTicketRoute/);
  assert.match(resolver, /buytickets|seatselection|checkout|purchase/);
  assert.doesNotMatch(landing, /InStock/);
});

test("Executive escalation ignores informational matchday context", () => {
  const alertLogic = read("src/lib/matchdayDecisionAlert.ts");
  assert.match(alertLogic, /MatchdayAttentionLevel = "inform" \| "review" \| "act"/);
  assert.match(alertLogic, /attention\.level === "inform"/);
});


test("Matchday Companion uses the universal decision language in the UI", () => {
  const widget = read("src/components/MatchdayCompanionWidget.tsx");
  assert.match(widget, /attention\.level === "inform" \? "MONITOR"/);
});

test("Source governance exposes Matchday Companion dependencies", () => {
  const sources = read("src/components/IntelligenceSources.tsx");
  const health = JSON.parse(read("data/live/source-health.json"));
  assert.match(sources, /name: "Matchday travel"/);
  assert.match(sources, /"open-meteo", "tfl-road", "national-rail-rdm"/);
  const decision = health.decisions.find((item) => item.id === "matchday-travel");
  assert.ok(decision, "missing matchday-travel source decision");
  assert.deepEqual(decision.requiredSourceIds, ["club-public-web", "open-meteo"]);
});


test("Travel partner prospecting stays internal until approved", () => {
  const widget = read("src/components/MatchdayCompanionWidget.tsx");
  const publicLanding = read("src/app/matchday/[fixtureId]/page.tsx");
  assert.match(widget, /Review partner opportunity/);
  assert.doesNotMatch(publicLanding, /partnerCommercialPack|relationshipState|Review partner opportunity/);
});


test("Critical interactive controls expose selection and async state", () => {
  const players = read("src/components/PlayerAssetPlanner.tsx");
  const setup = read("src/components/ClubSetup.tsx");
  const access = read("src/components/AccessCenter.tsx");
  const handoffs = read("src/components/OperationalHandoffs.tsx");

  assert.match(players, /aria-pressed=\{count === value\}/);
  assert.match(players, /role="status" aria-live="polite"/);
  assert.match(setup, /aria-pressed=\{channels\.includes\(channel\)\}/);
  assert.match(setup, /aria-busy=\{saving\}/);
  assert.match(access, /aria-busy=\{busy\}/);
  assert.match(handoffs, /role="status" aria-live="polite"/);
});
