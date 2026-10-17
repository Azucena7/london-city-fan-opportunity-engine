import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadLib } from "./lib/load-ts.mjs";

const { evidenceClass, isExpired, confidenceLabel } = await loadLib("signalSchema");
const signals = JSON.parse(readFileSync("data/live/signals.json", "utf8"));

test("observed, forecast, inferred and pending evidence stay apart", () => {
  assert.equal(evidenceClass("measured"), "observed");
  assert.equal(evidenceClass("confirmed"), "observed");
  assert.equal(evidenceClass("reported"), "observed");
  assert.equal(evidenceClass("forecast"), "forecast");
  assert.equal(evidenceClass("inferred"), "inferred");
  assert.equal(evidenceClass("waiting"), "pending");
});

test("a signal stops counting the day after its validUntil; no date means no expiry", () => {
  assert.equal(isExpired({ state: "forecast", validUntil: "2026-10-18" }, "2026-10-18"), false);
  assert.equal(isExpired({ state: "forecast", validUntil: "2026-10-18" }, "2026-10-19"), true);
  assert.equal(isExpired({ state: "confirmed" }, "2030-01-01"), false);
});

test("missing confidence reads as not rated, never as high", () => {
  assert.equal(confidenceLabel({ state: "confirmed" }), "confidence not rated");
  assert.equal(confidenceLabel({ state: "confirmed", confidence: "medium" }), "medium confidence");
});

test("every stored signal uses the schema's vocabulary", () => {
  for (const signal of signals) {
    if (signal.confidence !== undefined) assert.ok(["high", "medium", "low"].includes(signal.confidence), signal.id);
    if (signal.geoScope !== undefined) assert.ok(["venue", "local", "london", "national"].includes(signal.geoScope), signal.id);
    if (signal.validUntil !== undefined) assert.match(signal.validUntil, /^\d{4}-\d{2}-\d{2}$/, signal.id);
  }
});

test("the daily weather signal expires with its matchday", async () => {
  const { applyWeatherSignal } = await import("../scripts/lib/weather-signal.mjs");
  const [weather] = applyWeatherSignal([], "eve", { status: "forecast", valid_for: "2026-10-18", generated_at: "2026-10-17T00:00:00Z", precipitation_probability_max: 10, precipitation_sum: 0, wind_speed_max: 10 }, "2026-10-17T00:00:00Z");
  assert.equal(weather.validUntil, "2026-10-18");
  assert.equal(weather.geoScope, "venue");
});
