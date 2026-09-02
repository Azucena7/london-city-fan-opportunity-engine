import origins from "../../data/territory_travel_origins.json";

export type TerritoryTravelOrigin = {
  label: string;
  query: string;
};

export type TerritoryTravelSeed = {
  territory_id: string;
  territory_name: string;
  borough: string;
  origins: TerritoryTravelOrigin[];
};

export const territoryTravelSeeds = origins as TerritoryTravelSeed[];

export function territoryAction(input: {
  medianDurationDelta: number;
  medianScoreDelta: number;
  highShare: number;
  watchShare: number;
}, lang: "en" | "es") {
  const high =
    input.medianDurationDelta >= 15 ||
    input.medianScoreDelta <= -15 ||
    input.highShare >= 0.5;

  const watch =
    input.medianDurationDelta >= 8 ||
    input.medianScoreDelta <= -8 ||
    input.watchShare + input.highShare >= 0.5;

  if (lang === "es") {
    if (high) {
      return {
        code: "PROTECT",
        title: "Protege la demanda; no escales captación marginal.",
        text:
          "La fricción de acceso es suficientemente alta como para justificar información específica de viaje y una revisión de la inversión incremental. No abandones el territorio: protege CRM, fútbol base y audiencias ya comprometidas."
      };
    }

    if (watch) {
      return {
        code: "ACCESS MESSAGE",
        title: "Mantén captación, pero refuerza la información de acceso.",
        text:
          "El territorio sigue siendo atractivo, aunque el día de partido añade fricción. Refuerza rutas, hora recomendada de salida y alternativas antes de reducir presupuesto."
      };
    }

    return {
      code: "MAINTAIN",
      title: "El acceso no limita la recomendación territorial.",
      text:
        "La fricción agregada es estable. Mantén la estrategia de captación y vuelve a comprobar el territorio dentro de las 72 horas previas al partido."
    };
  }

  if (high) {
    return {
      code: "PROTECT",
      title: "Protect demand; do not scale marginal acquisition.",
      text:
        "Travel friction is high enough to justify specific access messaging and a review of incremental spend. Do not abandon the territory: protect CRM, grassroots and already-engaged audiences."
    };
  }

  if (watch) {
    return {
      code: "ACCESS MESSAGE",
      title: "Keep acquisition active, but add travel guidance.",
      text:
        "The territory remains attractive, but matchday adds friction. Strengthen route guidance, recommended departure time and alternatives before reducing budget."
    };
  }

  return {
    code: "MAINTAIN",
    title: "Travel does not constrain the territory recommendation.",
    text:
      "Aggregate friction is stable. Keep the acquisition strategy and re-check the territory inside the final 72 hours."
  };
}
