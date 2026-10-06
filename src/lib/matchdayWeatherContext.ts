import { currentState } from "@/lib/data";

export type MatchdayWeatherContext = {
  state: "forecast" | "waiting";
  source: string | null;
  generatedAt: string | null;
  precipitationProbability: number | null;
  precipitationMm: number | null;
  windKmh: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  materiality: "high" | "medium" | "low" | "waiting";
  supporterAction: string;
};

export function getMatchdayWeatherContext(fixtureId: string, fixtureDate: string): MatchdayWeatherContext {
  const weather = currentState.weather;
  const isCurrentHome = currentState.next_home_fixture_id === fixtureId;
  const validForFixture = weather?.status === "forecast" && weather?.valid_for === fixtureDate;

  if (!isCurrentHome || !validForFixture) {
    return {
      state: "waiting",
      source: weather?.source ?? "Open-Meteo",
      generatedAt: weather?.generated_at ?? null,
      precipitationProbability: null,
      precipitationMm: null,
      windKmh: null,
      temperatureMax: null,
      temperatureMin: null,
      materiality: "waiting",
      supporterAction: "Forecast enters the matchday utility when the fixture moves inside the operational forecast window."
    };
  }

  const rain = typeof weather.precipitation_probability_max === "number" ? weather.precipitation_probability_max : null;
  const wind = typeof weather.wind_speed_max === "number" ? weather.wind_speed_max : null;
  const high = (rain ?? 0) >= 60 || (wind ?? 0) >= 45;
  const medium = !high && ((rain ?? 0) >= 35 || (wind ?? 0) >= 30);

  return {
    state: "forecast",
    source: weather.source ?? "Open-Meteo",
    generatedAt: weather.generated_at ?? null,
    precipitationProbability: rain,
    precipitationMm: typeof weather.precipitation_sum === "number" ? weather.precipitation_sum : null,
    windKmh: wind,
    temperatureMax: typeof weather.temperature_max === "number" ? weather.temperature_max : null,
    temperatureMin: typeof weather.temperature_min === "number" ? weather.temperature_min : null,
    materiality: high ? "high" : medium ? "medium" : "low",
    supporterAction: high
      ? "Prioritise travel confidence, covered arrival guidance and outdoor-activation contingencies."
      : medium
        ? "Keep a visible weather note and re-check before matchday."
        : "No weather-led change to the normal acquisition or arrival plan."
  };
}
