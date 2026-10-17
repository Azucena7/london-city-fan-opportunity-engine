import { forecastForFixture } from "@/lib/fixtureForecast";
import { weatherLevel } from "@/lib/weatherThresholds";

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
  const weather = forecastForFixture(fixtureId, fixtureDate);

  if (!weather) {
    return {
      state: "waiting",
      source: "Open-Meteo",
      generatedAt: null,
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
  const level = weatherLevel(rain, wind);
  const high = level === "high";
  const medium = level === "medium";

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
