import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadLib } from "./lib/load-ts.mjs";

const { calendarMoments } = await loadLib("calendarMoments");
const data = JSON.parse(readFileSync("data/seed/school-holidays.json", "utf8"));
const fixtures = [
  { id: "eve", date: "2026-10-18", opponent: "Everton", homeAway: "home" },
  { id: "pal", date: "2026-10-28", opponent: "Crystal Palace", homeAway: "home" }
];
const periods = (verified) => data.layers.flatMap((layer) => layer.periods.map((period) => ({
  layer: layer.id, layerLabel: layer.label.replace(/ \(.*\)$/, ""), label: period.label, start: period.start, end: period.end, verified
})));

test("every school-holiday layer cites official council sources and says how it was verified", () => {
  for (const layer of data.layers) {
    assert.ok(layer.sources.length > 0, layer.id);
    for (const source of layer.sources) assert.match(source.url, /^https:\/\/(www\.)?[a-z]+\.gov\.uk\//, source.url);
    assert.ok(["verified", "reported-unverified"].includes(layer.verification), layer.id);
    for (const period of layer.periods) {
      assert.match(period.start, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(period.end >= period.start, period.id);
    }
  }
});

test("unverified school holidays never become a calendar moment", () => {
  const moments = calendarMoments(fixtures, [], [], periods(false));
  assert.equal(moments.filter((moment) => moment.kind === "school-holiday").length, 0);
});

test("verified periods name every layer a fixture falls in", () => {
  const moments = calendarMoments(fixtures, [], [], periods(true)).filter((moment) => moment.kind === "school-holiday");
  assert.deepEqual(moments.map((moment) => moment.fixtureId), ["pal"]);
  assert.match(moments[0].label, /Crystal Palace falls in school holidays: Bromley october half-term \(two weeks\); Lewisham, Greenwich, Bexley and Croydon october half-term/);
});
