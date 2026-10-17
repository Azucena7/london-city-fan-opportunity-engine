import { currentState } from "@/lib/data";

export type FixtureForecast = {
  status: "forecast";
  valid_for: string;
  generated_at?: string;
  precipitation_probability_max?: number | null;
  precipitation_sum?: number | null;
  temperature_max?: number | null;
  temperature_min?: number | null;
  wind_speed_max?: number | null;
  previous_precipitation_probability_max?: number | null;
  previous_generated_at?: string | null;
  source?: string;
};

type StoredForecast = FixtureForecast & { fixture_id: string };

/**
 * The matchday forecast for one fixture from the latest refresh, or null outside the forecast
 * window. Every home fixture inside the window has its own; older snapshots carry only the next
 * home fixture's, which is still read when the date matches.
 */
export function forecastForFixture(fixtureId: string, date: string): FixtureForecast | null {
  const stored = (currentState as { weather_by_fixture?: StoredForecast[] }).weather_by_fixture ?? [];
  const hit = stored.find((item) => item.fixture_id === fixtureId && item.valid_for === date);
  if (hit) return hit;
  const weather = currentState.weather as Partial<FixtureForecast> | null | undefined;
  return weather?.status === "forecast" && weather.valid_for === date && currentState.next_home_fixture_id === fixtureId
    ? (weather as FixtureForecast)
    : null;
}
