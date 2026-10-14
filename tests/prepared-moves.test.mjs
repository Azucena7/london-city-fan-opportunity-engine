import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/preparedMoves.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const timing = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const { buildPreparedMoves, preparationWindow } = timing;

const fixtures = [
  { id: "planned", date: "2026-10-18", opponent: "Everton", homeAway: "home" },
  { id: "bundle", date: "2026-10-28", opponent: "Crystal Palace", homeAway: "home" },
  { id: "clash", date: "2026-11-21", opponent: "Palace", homeAway: "home" },
  { id: "quiet", date: "2026-11-18", opponent: "Brighton", homeAway: "home" },
  { id: "holiday", date: "2027-05-02", opponent: "Tottenham", homeAway: "home" },
  { id: "away", date: "2026-10-25", opponent: "Away", homeAway: "away" }
];
const signals = [
  { id: "s1", fixtureId: "bundle", category: "demand", state: "confirmed", materiality: "high", observedAt: "2026-10-09T10:00:00Z",
    title: { en: "Three home cup matches offered for the price of two" },
    marketingAction: { en: "Prepare separate bundle and single-match CRM journeys for the official sale windows. Measure bundles separately." },
    sourceName: "Club" },
  { id: "s2", fixtureId: "quiet", category: "demand", state: "reported", materiality: "high", title: { en: "Unconfirmed" }, marketingAction: { en: "Do something." }, sourceName: "Rumour" }
];
const events = [{ name: "Newcastle v Arsenal", fixtureScores: [{ fixtureId: "clash", level: "high", timeGapMinutes: 30 }] }];
const moments = [{ fixtureId: "holiday", kind: "bank-holiday", label: "Bank holiday weekend: Tottenham is the day before Early May bank holiday" }];
const base = { today: "2026-10-14", fixtures, signals, events, moments, weather: null, plannedFixtureIds: new Set(["planned"]) };
const byId = (moves) => Object.fromEntries(moves.map((move) => [move.fixtureId, move]));

test("a curated, confirmed signal becomes the move, with the date its action was written", () => {
  const move = byId(buildPreparedMoves(base)).bundle;
  assert.equal(move.move, "Prepare separate bundle and single-match CRM journeys for the official sale windows.");
  assert.equal(move.moveRecordedAt, "2026-10-09");
  assert.equal(move.ownerRole, "Ticketing & CRM");
  assert.equal(move.prepareBy, "2026-10-21");
  assert.ok(move.gates.includes("Confirm consented audience access"));
});

test("fixtures with a campaign plan, no confirmed signal or outside the window get no draft", () => {
  const moves = byId(buildPreparedMoves(base));
  assert.equal(moves.planned, undefined);
  assert.equal(moves.quiet, undefined, "a reported (unconfirmed) signal is not enough");
  assert.equal(moves.away, undefined);
  assert.equal(byId(buildPreparedMoves({ ...base, horizon: 2 })).clash, undefined);
});

test("external pressure and calendar moments prepare a move when no curated action exists", () => {
  const moves = byId(buildPreparedMoves(base));
  assert.match(moves.clash.move, /before Newcastle v Arsenal competes for attention in a nearby slot/);
  assert.match(moves.holiday.move, /bank holiday family day out/);
  assert.equal(moves.holiday.ownerRole, "Marketing");
  assert.ok(!moves.holiday.gates.includes("Confirm consented audience access"));
});

test("a draft never carries numbers it does not have, and late drafts say so", () => {
  const late = byId(buildPreparedMoves({ ...base, today: "2026-10-25" })).bundle;
  assert.equal(late.late, true);
  assert.equal(late.prepareBy, "2026-10-25");
  for (const move of buildPreparedMoves(base)) {
    assert.doesNotMatch(JSON.stringify(move), /£|\d+\s?(fans|tickets|%)/);
  }
});

test("the preparation window is the next six home fixtures in date order", () => {
  assert.deepEqual(preparationWindow(fixtures, "2026-10-14", 3).map((fixture) => fixture.id), ["planned", "bundle", "quiet"]);
});

test("an action written on an earlier day is flagged when its own timing has run out", () => {
  const { actionTiming } = timing;
  const birmingham = "Run a segmented sequence for holders today, registered-interest supporters on 12 October and general audiences on 14 October.";
  assert.equal(
    actionTiming(birmingham, "2026-10-09", "2026-10-14"),
    'Timing out of date: written 9 Oct, "today" meant 9 Oct; 12 Oct has passed. Re-time the steps before using it.'
  );
  assert.equal(actionTiming(birmingham, "2026-10-14", "2026-10-14"), null, "same day: still current");
  assert.equal(actionTiming("Prepare separate bundle journeys for the sale windows.", "2026-10-09", "2026-10-14"), null);
  assert.equal(actionTiming("Open sales on 3 January.", "2026-12-20", "2026-12-28"), null, "a January date written in December is next year");
  assert.equal(actionTiming(birmingham, null, "2026-10-14"), null);
});

test("the prepared move carries the timing note for a stale curated action", () => {
  const stale = { ...signals[0], marketingAction: { en: "Email holders today and open general sale on 12 October. Then measure." } };
  const move = byId(buildPreparedMoves({ ...base, signals: [stale] })).bundle;
  assert.match(move.timingNote, /"today" meant 9 Oct; 12 Oct has passed/);
  assert.equal(byId(buildPreparedMoves(base)).bundle.timingNote, null);
  assert.equal(byId(buildPreparedMoves(base)).clash.timingNote, null, "engine-written moves have no recorded date");
});
