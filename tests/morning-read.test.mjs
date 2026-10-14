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
  assert.equal(lines.transport.headline, "1 listed road closure near Hayes Lane on Birmingham day (8 Nov)");
  assert.match(lines.transport.detail, /\[A21\] Bromley Road · 1.2 km/);
  assert.match(lines.transport.detail, /TfL snapshot of 14 Oct/);
  assert.match(lines.transport.detail, /Rail disruption is not connected yet/);

  const quiet = byId(buildMorningRead({ ...base, sources, road: { ...road, incidents: [road.incidents[1]] } }));
  assert.equal(quiet.transport.headline, "No listed road closure near Hayes Lane on the next 2 home fixture days");

  const neverFetched = byId(buildMorningRead({ ...base, sources, road: { lastSuccessfulAt: null, incidents: [] } }));
  assert.equal(neverFetched.transport.state, "not-connected", "operational without a stored snapshot is not live");
});

test("open-ended road incidents count on any later fixture day", () => {
  const incidents = [{ location: "X", startDate: "2026-10-01", endDate: null, distanceKm: 3, material: true }];
  assert.equal(roadClosuresOn(incidents, "2026-11-08").length, 1);
  assert.equal(roadClosuresOn(incidents, "2026-09-30").length, 0);
});
