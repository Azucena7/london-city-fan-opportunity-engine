import { getMatchdayWeatherContext } from "@/lib/matchdayWeatherContext";
import { mobilityProviderReadiness } from "@/lib/mobilityProviderReadiness";

export function getMaterialMatchdayAlert(fixtureId: string, fixtureDate: string) {
  const weather = getMatchdayWeatherContext(fixtureId, fixtureDate);
  const degraded = mobilityProviderReadiness.filter((item) => item.state === "degraded");

  if (weather.materiality === "high") {
    return {
      state: "act" as const,
      label: "Matchday access risk",
      title: "Weather has crossed the action threshold.",
      detail: weather.supporterAction,
      source: weather.source ?? "Open-Meteo"
    };
  }

  if (degraded.length) {
    return {
      state: "review" as const,
      label: "Matchday travel coverage",
      title: degraded.length + " mobility provider layer" + (degraded.length === 1 ? " is" : "s are") + " degraded.",
      detail: "Review the affected travel source before publishing supporter guidance.",
      source: degraded.map((item) => item.provider).join(" · ")
    };
  }

  return null;
}
