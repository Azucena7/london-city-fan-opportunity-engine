// One definition of when a matchday forecast matters, shared by the brief, the Morning Read,
// prepared moves and the fan matchday page. scripts/lib/weather-signal.mjs mirrors HIGH for the
// daily refresh; tests/weather-thresholds.test.mjs keeps the two in step.

export const WEATHER_THRESHOLDS = {
  high: { rainProbability: 60, windKmh: 45 },
  medium: { rainProbability: 35, windKmh: 30 }
} as const;

export type WeatherLevel = "high" | "medium" | "low";

/** High changes the plan (wet-weather message, covered arrival); medium is worth a visible note. */
export function weatherLevel(rainProbability: number | null | undefined, windKmh?: number | null): WeatherLevel {
  const rain = rainProbability ?? 0;
  const wind = windKmh ?? 0;
  if (rain >= WEATHER_THRESHOLDS.high.rainProbability || wind >= WEATHER_THRESHOLDS.high.windKmh) return "high";
  if (rain >= WEATHER_THRESHOLDS.medium.rainProbability || wind >= WEATHER_THRESHOLDS.medium.windKmh) return "medium";
  return "low";
}
