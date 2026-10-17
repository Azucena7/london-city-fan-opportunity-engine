import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadLib } from "./lib/load-ts.mjs";

const { WEATHER_THRESHOLDS, weatherLevel } = await loadLib("weatherThresholds");

test("one scale decides when weather matters", () => {
  assert.equal(weatherLevel(70, 10), "high");
  assert.equal(weatherLevel(10, 50), "high", "wind alone can make it high");
  assert.equal(weatherLevel(40, 10), "medium");
  assert.equal(weatherLevel(16, 12), "low");
  assert.equal(weatherLevel(null, null), "low", "a missing forecast never reads as weather risk");
});

test("the daily refresh signal uses the same high threshold as the app", async () => {
  const script = await readFile(new URL("../scripts/lib/weather-signal.mjs", import.meta.url), "utf8");
  assert.match(script, new RegExp(`>= ${WEATHER_THRESHOLDS.high.rainProbability}\\b`));
  assert.match(script, new RegExp(`>= ${WEATHER_THRESHOLDS.high.windKmh}\\b`));
});

test("no product module keeps its own rain threshold", async () => {
  for (const file of ["morningRead.ts", "preparedMoves.ts", "matchdayWeatherContext.ts"]) {
    const source = await readFile(new URL(`../src/lib/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /precipitation_probability_max[^;\n]*>=\s*\d/, file);
    assert.match(source, /weatherLevel\(/, file);
  }
});
