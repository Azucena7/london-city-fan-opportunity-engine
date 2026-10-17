import test from "node:test";
import assert from "node:assert/strict";
import { fixtureForecasts } from "../scripts/lib/weather-forecasts.mjs";

const daily = {
  time: ["2026-10-18", "2026-10-19", "2026-10-28"],
  precipitation_probability_max: [39, 10, 72],
  precipitation_sum: [3.3, 0, 6.1],
  temperature_2m_max: [13.1, 14, 11],
  temperature_2m_min: [7, 8, 6],
  wind_speed_10m_max: [19.4, 10, 33]
};
const fixtures = [
  { id: "eve", date: "2026-10-18" },
  { id: "pal", date: "2026-10-28" },
  { id: "far", date: "2026-11-21" }
];

test("every home fixture inside the window gets its own forecast; fixtures outside get none", () => {
  const out = fixtureForecasts(daily, fixtures, [], "2026-10-17T00:00:00Z");
  assert.deepEqual(out.map((item) => item.fixture_id), ["eve", "pal"]);
  const palace = out.find((item) => item.fixture_id === "pal");
  assert.equal(palace.precipitation_probability_max, 72);
  assert.equal(palace.wind_speed_max, 33);
  assert.equal(palace.status, "forecast");
  assert.equal(palace.previous_precipitation_probability_max, null, "a first forecast has no previous one");
});

test("the previous refresh's rain risk is kept for the same fixture and date only", () => {
  const previous = [
    { fixture_id: "eve", valid_for: "2026-10-18", precipitation_probability_max: 20, generated_at: "2026-10-16T00:00:00Z" },
    { fixture_id: "pal", valid_for: "2026-10-27", precipitation_probability_max: 5, generated_at: "2026-10-16T00:00:00Z" }
  ];
  const out = fixtureForecasts(daily, fixtures, previous, "2026-10-17T00:00:00Z");
  assert.equal(out[0].previous_precipitation_probability_max, 20);
  assert.equal(out[0].previous_generated_at, "2026-10-16T00:00:00Z");
  assert.equal(out[1].previous_precipitation_probability_max, null, "a moved fixture date is a new forecast");
});
