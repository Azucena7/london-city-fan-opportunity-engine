export function weatherLabel(code?: number) {
  if (code === 0) return "Clear";
  if ([1,2,3].includes(code ?? -1)) return "Cloudy";
  if ([45,48].includes(code ?? -1)) return "Fog";
  if ([51,53,55,56,57].includes(code ?? -1)) return "Drizzle";
  if ([61,63,65,66,67,80,81,82].includes(code ?? -1)) return "Rain";
  if ([71,73,75,77,85,86].includes(code ?? -1)) return "Snow";
  if ([95,96,99].includes(code ?? -1)) return "Thunderstorm";
  return "Mixed";
}

export function weatherSuitability(input: {
  precipitationProbability?: number;
  precipitationSum?: number;
  maxTemp?: number;
  minTemp?: number;
  windSpeed?: number;
}) {
  let score = 100;

  const rainProb = input.precipitationProbability ?? 0;
  const rain = input.precipitationSum ?? 0;
  const wind = input.windSpeed ?? 0;
  const max = input.maxTemp ?? 18;
  const min = input.minTemp ?? 10;

  score -= rainProb * 0.32;
  score -= Math.min(20, rain * 2.5);
  if (wind > 25) score -= Math.min(15, (wind - 25) * 0.8);
  if (max < 8) score -= 10;
  if (max > 28) score -= 7;
  if (min < 3) score -= 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}
