import test from "node:test";
import assert from "node:assert/strict";
import { loadLib } from "./lib/load-ts.mjs";

const { contextPressure, CONTEXT_PRESSURE_CAP } = await loadLib("contextPressure");
const quiet = { date: "2026-10-18", competing: [], weather: null, roadClosures: 0, railDisruptions: [], moments: [] };

test("a quiet context adds nothing and names no driver", () => {
  assert.deepEqual(contextPressure(quiet), { points: 0, drivers: [] });
});

test("each family adds named, sourced points with its evidence state", () => {
  const result = contextPressure({
    ...quiet,
    competing: [{ level: "high", name: "Charlton v Man Utd" }, { level: "medium", name: "Chelsea v Spurs" }],
    weather: { validFor: "2026-10-18", rainProbability: 70, windKmh: 12 },
    roadClosures: 1,
    moments: ["Bank holiday weekend"]
  });
  const byFamily = Object.fromEntries(result.drivers.map((driver) => [driver.family, driver]));
  assert.equal(byFamily["competing-events"].points, 4);
  assert.match(byFamily["competing-events"].label, /2 competing fixtures.*Charlton v Man Utd/);
  assert.equal(byFamily.weather.points, 6);
  assert.equal(byFamily.weather.evidence, "forecast");
  assert.equal(byFamily.transport.points, 6);
  assert.equal(byFamily.calendar.points, 3);
  assert.equal(result.points, 19);
  assert.deepEqual(result.drivers.map((driver) => driver.points), [6, 6, 4, 3], "largest driver first");
});

test("a forecast for another day never counts, and low weather adds nothing", () => {
  assert.equal(contextPressure({ ...quiet, weather: { validFor: "2026-10-11", rainProbability: 90 } }).points, 0);
  assert.equal(contextPressure({ ...quiet, weather: { validFor: "2026-10-18", rainProbability: 10, windKmh: 5 } }).points, 0);
});

test("pressure is capped so context reorders the Radar without swamping it", () => {
  const busy = contextPressure({
    ...quiet,
    competing: Array.from({ length: 10 }, (_, i) => ({ level: "high", name: `Event ${i}` })),
    weather: { validFor: "2026-10-18", rainProbability: 80 },
    roadClosures: 3,
    railDisruptions: ["Southeastern minor delays"],
    moments: ["Bank holiday", "International window ends"]
  });
  assert.equal(busy.points, CONTEXT_PRESSURE_CAP);
  assert.equal(busy.drivers.find((driver) => driver.family === "competing-events").points, 9);
  assert.equal(busy.drivers.find((driver) => driver.family === "calendar").points, 4);
});

test("a forecast that moved by 10 points or more says so; small moves stay quiet", () => {
  const up = contextPressure({ ...quiet, weather: { validFor: "2026-10-18", rainProbability: 64, previousRainProbability: 20 } });
  assert.match(up.drivers[0].label, /64% rain risk on matchday \(up from 20%\)/);
  const small = contextPressure({ ...quiet, weather: { validFor: "2026-10-18", rainProbability: 64, previousRainProbability: 58 } });
  assert.doesNotMatch(small.drivers[0].label, /from/);
});

test("a disruption TfL attributes to strike action says so", () => {
  const result = contextPressure({ ...quiet, railDisruptions: ["Southeastern part suspended"], strike: true });
  assert.match(result.drivers[0].label, /^Strike or industrial action · rail: Southeastern part suspended$/);
  assert.equal(result.drivers[0].points, 6);
});
