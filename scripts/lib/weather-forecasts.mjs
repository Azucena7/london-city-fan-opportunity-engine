// One matchday forecast per upcoming home fixture inside the forecast window, from a single
// Open-Meteo daily response. Each keeps the previous refresh's rain risk for the same fixture
// and date, so a change in the forecast can be read as a change, not just a new number.

export const FORECAST_WINDOW_DAYS = 16;

export function fixtureForecasts(daily, fixtures, previous = [], generatedAt) {
  const dates = daily?.time ?? [];
  return fixtures.flatMap((fixture) => {
    const index = dates.indexOf(fixture.date);
    if (index < 0) return [];
    const before = previous.find((item) => item.fixture_id === fixture.id && item.valid_for === fixture.date);
    return [{
      fixture_id: fixture.id,
      status: "forecast",
      valid_for: fixture.date,
      generated_at: generatedAt,
      precipitation_probability_max: daily.precipitation_probability_max?.[index] ?? null,
      precipitation_sum: daily.precipitation_sum?.[index] ?? null,
      temperature_max: daily.temperature_2m_max?.[index] ?? null,
      temperature_min: daily.temperature_2m_min?.[index] ?? null,
      wind_speed_max: daily.wind_speed_10m_max?.[index] ?? null,
      previous_precipitation_probability_max: before ? before.precipitation_probability_max : null,
      previous_generated_at: before ? before.generated_at : null,
      source: "Open-Meteo"
    }];
  });
}
