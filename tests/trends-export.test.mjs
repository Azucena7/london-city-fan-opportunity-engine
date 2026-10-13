import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyTrendsExport, markTrendsCaptured, parseTrendsCsv } from "../scripts/lib/trends-export.mjs";

const live = () => JSON.parse(readFileSync("data/live/search-demand.json", "utf8"));
const gbExport = [
  "Category: All categories",
  "",
  "Week,Alexia Putellas: (United Kingdom),London City Lionesses: (United Kingdom),Alexia Putellas London City: (United Kingdom)",
  "2026-09-06,100,12,<1",
  "2026-09-13,64,9,3"
].join("\n");

test("parses a Trends multiTimeline export", () => {
  const parsed = parseTrendsCsv(gbExport);
  assert.deepEqual(parsed.columns.map((column) => column.query), ["Alexia Putellas", "London City Lionesses", "Alexia Putellas London City"]);
  assert.equal(parsed.points.length, 2);
  assert.deepEqual(parsed.points[0].values[2], { value: 0, belowOne: true });
});

test("adds a measured snapshot to the matching comparison set", () => {
  const data = live();
  const before = data.markets[0].comparisonSets[0].snapshots.length;
  const summary = applyTrendsExport(data, "gb-awareness-bridge", parseTrendsCsv(gbExport), "2026-10-13T08:00:00Z");
  const snapshot = data.markets[0].comparisonSets[0].snapshots.at(-1);
  assert.equal(data.markets[0].comparisonSets[0].snapshots.length, before + 1);
  assert.equal(snapshot.state, "measured");
  assert.equal(snapshot.series.length, 6);
  assert.deepEqual(snapshot.series[0], { date: "2026-09-06", termId: "alexia", value: 100 });
  assert.match(snapshot.note.en, /not search volume/);
  assert.match(snapshot.note.en, /below 1, not zero searches/);
  assert.equal(summary.status, "baseline-pending", "one measured set is not a full baseline");
});

test("rejects exports for the wrong market or with different terms", () => {
  const spain = gbExport.replaceAll("United Kingdom", "Spain");
  assert.throws(() => applyTrendsExport(live(), "gb-awareness-bridge", parseTrendsCsv(spain), "2026-10-13T08:00:00Z"), /exported for Spain/);
  const other = gbExport.replace("London City Lionesses", "Arsenal Women");
  assert.throws(() => applyTrendsExport(live(), "gb-awareness-bridge", parseTrendsCsv(other), "2026-10-13T08:00:00Z"), /missing "London City Lionesses"/);
  assert.throws(() => parseTrendsCsv(gbExport.replace("64", "164")), /outside 0–100/);
});

test("the source register records the capture without inventing data", () => {
  const health = JSON.parse(readFileSync("data/live/source-health.json", "utf8"));
  const trends = markTrendsCaptured(health, "2026-10-13T08:00:00Z").sources.find((source) => source.id === "google-trends");
  assert.equal(trends.state, "operational");
  assert.equal(trends.lastSuccessfulAt, "2026-10-13T08:00:00Z");
  assert.equal(trends.method, "manual-snapshot-until-api-access");
});
