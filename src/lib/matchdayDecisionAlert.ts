import { getMatchdayWeatherContext } from "@/lib/matchdayWeatherContext";
import { mobilityProviderReadiness } from "@/lib/mobilityProviderReadiness";

export type MatchdayAttentionLevel = "inform" | "review" | "act";

export function getMatchdayAttention(fixtureId: string, fixtureDate: string) {
  const weather = getMatchdayWeatherContext(fixtureId, fixtureDate);
  const degraded = mobilityProviderReadiness.filter((item) => item.state === "degraded");
  const live = mobilityProviderReadiness.filter((item) => item.state === "live");

  if (weather.materiality === "high") {
    return {
      level: "act" as const,
      label: "Matchday access risk",
      title: "Weather has crossed the action threshold.",
      detail: weather.supporterAction,
      source: weather.source ?? "Open-Meteo",
      reason: "Supporter arrival or outdoor activation may need a same-day change."
    };
  }

  if (degraded.length) {
    return {
      level: "review" as const,
      label: "Matchday travel coverage",
      title: degraded.length + " mobility provider layer" + (degraded.length === 1 ? " is" : "s are") + " degraded.",
      detail: "Review the affected travel source before publishing supporter guidance.",
      source: degraded.map((item) => item.provider).join(" · "),
      reason: "The decision can continue, but published guidance should be checked first."
    };
  }

  if (weather.materiality === "medium") {
    return {
      level: "inform" as const,
      label: "Matchday watch",
      title: "Weather is worth monitoring but has not crossed the action threshold.",
      detail: weather.supporterAction,
      source: weather.source ?? "Open-Meteo",
      reason: "Keep visible context without escalating leadership attention."
    };
  }

  if (live.length) {
    return {
      level: "inform" as const,
      label: "Matchday travel live",
      title: live.length + " mobility provider layer" + (live.length === 1 ? " is" : "s are") + " live.",
      detail: "No material disruption currently changes the decision.",
      source: live.map((item) => item.provider).join(" · "),
      reason: "Useful context, not a leadership alert."
    };
  }

  return null;
}

export function getMaterialMatchdayAlert(fixtureId: string, fixtureDate: string) {
  const attention = getMatchdayAttention(fixtureId, fixtureDate);
  if (!attention || attention.level === "inform") return null;
  return {
    state: attention.level,
    label: attention.label,
    title: attention.title,
    detail: attention.detail,
    source: attention.source
  };
}
