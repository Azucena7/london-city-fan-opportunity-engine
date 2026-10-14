import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { parseBankHolidays } from "../scripts/lib/bank-holidays.mjs";

const source = await readFile(new URL("../src/lib/calendarMoments.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { calendarMoments } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const govuk = {
  "england-and-wales": { division: "england-and-wales", events: [
    { title: "Christmas Day", date: "2025-12-25", notes: "", bunting: true },
    { title: "Early May bank holiday", date: "2027-05-03", notes: "", bunting: true },
    { title: "New Year’s Day", date: "2027-01-01", notes: "", bunting: true },
    { title: "Broken", date: "May 2027" }
  ] },
  scotland: { division: "scotland", events: [{ title: "St Andrew's Day", date: "2026-11-30" }] }
};

test("GOV.UK bank holidays are read for one division, from a date, in order", () => {
  assert.deepEqual(parseBankHolidays(govuk, "england-and-wales", "2026-01-01"), [
    { date: "2027-01-01", title: "New Year's Day" },
    { date: "2027-05-03", title: "Early May bank holiday" }
  ]);
  assert.throws(() => parseBankHolidays({}, "england-and-wales"));
});

const fixtures = [
  { id: "eve", date: "2026-10-18", opponent: "Everton", homeAway: "home" },
  { id: "pal", date: "2026-11-21", opponent: "Crystal Palace", homeAway: "home" },
  { id: "away", date: "2026-11-28", opponent: "Away", homeAway: "away" },
  { id: "bri", date: "2026-12-16", opponent: "Bristol City", homeAway: "home" },
  { id: "tot", date: "2027-05-02", opponent: "Tottenham Hotspur", homeAway: "home" }
];
const windows = [
  { id: "2026-10", start: "2026-10-05", end: "2026-10-13" },
  { id: "2026-11", start: "2026-11-24", end: "2026-12-05" }
];

test("moments place home fixtures against bank holidays and international windows", () => {
  const moments = calendarMoments(fixtures, [{ date: "2027-05-03", title: "Early May bank holiday" }], windows);
  const byFixture = Object.fromEntries(moments.map((moment) => [`${moment.fixtureId}:${moment.kind}`, moment.label]));
  assert.match(byFixture["tot:bank-holiday"], /Tottenham Hotspur is the day before Early May bank holiday/);
  assert.match(byFixture["eve:after-window"], /First home match after the international window \(Everton\)/);
  assert.match(byFixture["pal:before-window"], /Last home match before the international window/);
  assert.match(byFixture["bri:after-window"], /Bristol City/);
  assert.equal(moments.filter((moment) => moment.fixtureId === "away").length, 0);
});

test("far-away fixtures get no window moment and nothing is inferred without holidays", () => {
  const moments = calendarMoments([{ id: "far", date: "2027-01-24", opponent: "Arsenal", homeAway: "home" }], [], windows);
  assert.deepEqual(moments, []);
});

test("international windows are a reviewed seed without the unconfirmed June 2027 window", () => {
  const seed = JSON.parse(readFileSync("data/seed/international-windows.json", "utf8"));
  assert.equal(seed.review.state, "cross-checked");
  assert.ok(seed.windows.every((window) => window.start <= window.end));
  assert.ok(!seed.windows.some((window) => window.start.startsWith("2027-06")));
});

test("the daily refresh fetches bank holidays without blocking the rest", () => {
  const workflow = readFileSync(".github/workflows/daily-data-refresh.yml", "utf8");
  assert.match(workflow, /npm run refresh:calendar-moments/);
  assert.match(workflow, /scripts\/refresh-calendar-moments\.mjs/);
  assert.match(workflow, /git add [^\n]*data\/live\/bank-holidays\.json/);
  const step = workflow.slice(workflow.indexOf("Refresh UK bank holidays"));
  assert.match(step.slice(0, step.indexOf("run:")), /continue-on-error: true/);
  const health = JSON.parse(readFileSync("data/live/source-health.json", "utf8"));
  for (const id of ["uk-bank-holidays", "fifa-international-windows"]) {
    assert.ok(health.sources.some((item) => item.id === id), id);
  }
});
