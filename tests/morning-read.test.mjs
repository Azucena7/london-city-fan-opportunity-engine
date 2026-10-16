import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/morningRead.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { buildMorningRead, roadClosuresOn } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const calendar = [
  { id: "past", date: "2026-10-01", opponent: "Past", homeAway: "home", status: "final" },
  { id: "a", date: "2026-10-18", opponent: "Everton", homeAway: "home" },
  { id: "away", date: "2026-10-25", opponent: "Away", homeAway: "away" },
  { id: "b", date: "2026-11-08", opponent: "Birmingham", homeAway: "home" }
];
const events = [
  { name: "Charlton v Man Utd", date: "2026-10-18", fixtureScores: [{ fixtureId: "a", level: "high", timeGapMinutes: 0 }] },
  { name: "Concert", date: "2026-11-08", fixtureScores: [{ fixtureId: "b", level: "medium", timeGapMinutes: 60 }] }
];
const live = {
  fixtureId: "a",
  fixture: { opponent: "Everton" },
  opportunityLabel: "Selective opportunity",
  opportunity: "Test a return visit.",
  recommendedAction: "Build the audience.",
  decisionState: "HOLD",
  primaryBlocker: "Assign the owner"
};
const base = { today: "2026-10-14", calendar, events, signals: [], weather: null, live };
const byId = (lines) => Object.fromEntries(lines.map((line) => [line.id, line]));

test("only high external pressure on upcoming home fixtures is counted", () => {
  const lines = byId(buildMorningRead({ ...base, sources: [{ id: "ticketmaster-events", state: "operational" }] }));
  assert.equal(lines.pressure.headline, "1 of the next 2 home fixtures face external attendance pressure");
  assert.match(lines.pressure.detail, /Everton \(18 Oct\): Charlton v Man Utd in the same slot/);
  assert.equal(lines.pressure.state, "live");
});

test("transport without a connected source is marked, never inferred", () => {
  const lines = byId(buildMorningRead({ ...base, sources: [{ id: "tfl-road", state: "not-configured" }] }));
  assert.equal(lines.transport.state, "not-connected");
  assert.match(lines.transport.detail, /No disruption is inferred/);
  assert.equal(lines.pressure.state, "not-connected");
});

test("weather only speaks for the fixture date it was forecast for", () => {
  const sources = [{ id: "open-meteo", state: "operational" }];
  const matching = byId(buildMorningRead({ ...base, sources, weather: { valid_for: "2026-10-18", temperature_max: 13.3, precipitation_probability_max: 70 } }));
  assert.match(matching.weather.headline, /70% rain risk for Everton: prepare the wet-weather message/);
  const stale = byId(buildMorningRead({ ...base, sources, weather: { valid_for: "2026-10-11", temperature_max: 13, precipitation_probability_max: 0 } }));
  assert.equal(stale.weather.headline, "No forecast yet for Everton");
});

test("a held decision says what it is waiting on", () => {
  const lines = byId(buildMorningRead({ ...base, sources: [] }));
  assert.equal(lines.move.headline, "Build the audience.");
  assert.equal(lines.move.detail, "On hold until: Assign the owner.");
});

test("calendar moments read as not connected until a calendar source is operational", () => {
  const moments = [{ fixtureId: "a", label: "First home match after the international window (Everton): internationals return" }];
  const off = byId(buildMorningRead({ ...base, sources: [], moments }));
  assert.equal(off.calendar.state, "not-connected");
  const on = byId(buildMorningRead({ ...base, sources: [{ id: "fifa-international-windows", state: "operational" }], moments }));
  assert.equal(on.calendar.state, "live");
  assert.match(on.calendar.headline, /First home match after the international window/);
  assert.match(on.calendar.detail, /Bank holidays join after the first GOV.UK refresh/);
});

test("road disruption reads live from the TfL snapshot, with rail still marked as not connected", () => {
  const sources = [{ id: "tfl-road", state: "operational" }];
  const road = {
    lastSuccessfulAt: "2026-10-14T01:20:00Z",
    incidents: [
      { location: "[A21] Bromley Road", startDate: "2026-11-01", endDate: "2026-11-10", distanceKm: 1.2, material: true },
      { location: "Hayes Street", startDate: "2026-10-18", endDate: "2026-10-18", distanceKm: 0.8, material: false }
    ]
  };
  const lines = byId(buildMorningRead({ ...base, sources, road }));
  assert.equal(lines.transport.state, "live");
  assert.equal(lines.transport.headline, "1 listed road closure within 5 km of Hayes Lane on Birmingham day (8 Nov)");
  assert.match(lines.transport.detail, /\[A21\] Bromley Road · 1.2 km/);
  assert.match(lines.transport.detail, /TfL snapshot of 14 Oct/);
  assert.match(lines.transport.detail, /Rail disruption is not connected yet/);

  const quiet = byId(buildMorningRead({ ...base, sources, road: { ...road, incidents: [road.incidents[1]] } }));
  assert.equal(quiet.transport.headline, "No listed road closure within 5 km of Hayes Lane on the next 2 home fixture days");

  const neverFetched = byId(buildMorningRead({ ...base, sources, road: { lastSuccessfulAt: null, incidents: [] } }));
  assert.equal(neverFetched.transport.state, "not-connected", "operational without a stored snapshot is not live");
});

test("open-ended road incidents count on any later fixture day", () => {
  const incidents = [{ location: "X", startDate: "2026-10-01", endDate: null, distanceKm: 3, material: true }];
  assert.equal(roadClosuresOn(incidents, "2026-11-08").length, 1);
  assert.equal(roadClosuresOn(incidents, "2026-09-30").length, 0);
  assert.equal(roadClosuresOn([{ ...incidents[0], distanceKm: 9.6 }], "2026-11-08").length, 0, "works across south London are not the approach roads");
});

test("rail disruption on a fixture day leads the transport line; clear modes are named", () => {
  const sources = [{ id: "tfl-road", state: "operational" }, { id: "tfl-national-rail", state: "operational" }];
  const road = { lastSuccessfulAt: "2026-10-14T01:20:00Z", incidents: [] };
  const rail = {
    lastSuccessfulAt: "2026-10-14T01:21:00Z",
    days: [
      { date: "2026-10-18", disruptions: [] },
      { date: "2026-11-08", disruptions: [{ line: "Southeastern", status: "Part Closure", reason: "No trains between Hayes and Elmers End." }] }
    ]
  };
  const lines = byId(buildMorningRead({ ...base, sources, road, rail }));
  assert.equal(lines.transport.headline, "Southeastern: part closure on Birmingham day (8 Nov)");
  assert.match(lines.transport.detail, /No trains between Hayes and Elmers End\./);
  assert.doesNotMatch(lines.transport.detail, /not connected/);

  const clear = byId(buildMorningRead({ ...base, sources, road, rail: { ...rail, days: rail.days.map((d) => ({ ...d, disruptions: [] })) } }));
  assert.equal(clear.transport.headline, "No listed road closure or rail disruption within 5 km of Hayes Lane on the next 2 home fixture days");

  const railOnly = byId(buildMorningRead({ ...base, sources: [sources[1]], rail: { ...rail, days: [rail.days[0]] } }));
  assert.equal(railOnly.transport.headline, "No listed rail disruption near Hayes Lane on the next home fixture day");
  assert.match(railOnly.transport.detail, /Rail status read for 1 of 2 fixture days\./);
  assert.match(railOnly.transport.detail, /Road disruption is not connected yet\./);
});

test("supporter origins come only from the club aggregate, by postcode district", () => {
  const missing = byId(buildMorningRead({ ...base, sources: [] })).origins;
  assert.equal(missing.state, "not-connected");
  assert.match(missing.headline, /needs the club's ticketing aggregate/);
  const origins = { fixtureId: "past", supporters: 200, districts: [{ district: "BR1", supporters: 70 }, { district: "SE9", supporters: 30 }, { district: "DA1", supporters: 20 }, { district: "BR2", supporters: 12 }] };
  const line = byId(buildMorningRead({ ...base, sources: [], origins })).origins;
  assert.equal(line.state, "live");
  assert.equal(line.headline, "60% of Past (1 Oct) buyers came from BR1, SE9 and DA1");
  assert.match(line.detail, /districts under 10 supporters are withheld/);
  // It sits after transport, so corridors are read next to disruption.
  const ids = buildMorningRead({ ...base, sources: [], origins }).map((item) => item.id);
  assert.equal(ids.indexOf("origins"), ids.indexOf("transport") + 1);
});
