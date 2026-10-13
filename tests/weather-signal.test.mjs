import test from "node:test";
import assert from "node:assert/strict";
import { applyWeatherSignal } from "../scripts/lib/weather-signal.mjs";

const forecast = {
  status: "forecast",
  generated_at: "2026-10-13T12:54:19.091Z",
  precipitation_probability_max: 10,
  precipitation_sum: 0,
  wind_speed_max: 20.2
};
const demand = { id: "demand-1", fixtureId: "everton", category: "demand", state: "confirmed" };

test("creates the weather signal for the next home fixture when none exists", () => {
  const next = applyWeatherSignal([demand], "everton", forecast, "2026-10-13T12:54:19Z");
  assert.equal(next.length, 2);
  const weather = next.find((signal) => signal.category === "weather");
  assert.equal(weather.id, "weather-everton");
  assert.equal(weather.fixtureId, "everton");
  assert.equal(weather.state, "forecast");
  assert.equal(weather.materiality, "low");
  assert.match(weather.summary.en, /10% maximum rain probability.*Forecast, not measured weather/);
  assert.deepEqual(next[0], demand, "other signals are untouched");
});

test("updates an existing weather signal instead of duplicating it", () => {
  const existing = { id: "weather-everton", fixtureId: "everton", category: "weather", state: "waiting" };
  const next = applyWeatherSignal([existing], "everton", { ...forecast, precipitation_probability_max: 70 }, "x");
  assert.equal(next.length, 1);
  assert.equal(next[0].state, "forecast");
  assert.equal(next[0].materiality, "high");
  assert.equal(next[0].direction, "negative");
});

test("does not invent a signal before a forecast exists", () => {
  const next = applyWeatherSignal([demand], "everton", { status: "outside-window" }, "x");
  assert.deepEqual(next, [demand]);
});

test("marks an existing signal as waiting when the forecast is unavailable", () => {
  const existing = { id: "weather-everton", fixtureId: "everton", category: "weather", state: "forecast" };
  const next = applyWeatherSignal([existing], "everton", { status: "waiting" }, "2026-10-13T12:00:00Z");
  assert.equal(next[0].state, "waiting");
  assert.equal(next[0].observedAt, "2026-10-13T12:00:00Z");
});

test("leaves weather signals for other fixtures untouched", () => {
  const brighton = { id: "weather-brighton", fixtureId: "brighton", category: "weather", state: "forecast" };
  const next = applyWeatherSignal([brighton], "everton", forecast, "x");
  assert.deepEqual(next[0], brighton);
  assert.equal(next.length, 2);
});
