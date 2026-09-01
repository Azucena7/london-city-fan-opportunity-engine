export type TravelComparable = {
  duration: number;
  changes: number;
  walkingMinutes: number;
  disruptions: string[];
};

export type TravelDeltaResult = {
  durationDelta: number;
  scoreDelta: number;
  severity: "stable" | "watch" | "high";
  direction: "better" | "same" | "worse";
};

export function travelDelta(
  normal: TravelComparable,
  matchday: TravelComparable,
  normalScore: number,
  matchdayScore: number
): TravelDeltaResult {
  const durationDelta = matchday.duration - normal.duration;
  const scoreDelta = matchdayScore - normalScore;

  const direction =
    durationDelta <= -5 || scoreDelta >= 6
      ? "better"
      : durationDelta >= 5 || scoreDelta <= -6
      ? "worse"
      : "same";

  const severity =
    durationDelta >= 15 || scoreDelta <= -15
      ? "high"
      : durationDelta >= 8 || scoreDelta <= -8
      ? "watch"
      : "stable";

  return {
    durationDelta,
    scoreDelta,
    severity,
    direction
  };
}

export function engineResponse(
  result: TravelDeltaResult,
  lang: "en" | "es"
) {
  if (lang === "es") {
    if (result.severity === "high") {
      return {
        label: "AJUSTAR",
        title: "La fricción de viaje aumenta de forma material.",
        text:
          "No aumentes presión de captación basándote solo en este journey. Prioriza información de viaje, rutas alternativas y mensajes de planificación. Solo desplaza presupuesto territorial si el patrón se repite en una muestra suficiente."
      };
    }

    if (result.severity === "watch") {
      return {
        label: "VIGILAR",
        title: "El viaje empeora, pero todavía no justifica mover presupuesto.",
        text:
          "Mantén la campaña y añade messaging de acceso. Vuelve a comprobar incidencias y tiempos dentro de las 72 horas previas al partido."
      };
    }

    if (result.direction === "better") {
      return {
        label: "SIN RESTRICCIÓN",
        title: "La fricción prevista mejora frente al viaje actual.",
        text:
          "Travel no introduce una razón para reducir captación. Mantén la recomendación del engine y monitoriza cambios cercanos al matchday."
      };
    }

    return {
      label: "SIN CAMBIO",
      title: "El viaje previsto es estable.",
      text:
        "Travel no modifica la recomendación actual. Mantén la estrategia y vuelve a comprobar el journey cerca del partido."
    };
  }

  if (result.severity === "high") {
    return {
      label: "ADJUST",
      title: "Travel friction is materially higher for matchday.",
      text:
        "Do not increase acquisition pressure based on this journey alone. Prioritise travel guidance, alternative routes and planning messages. Only shift territory budget if the pattern repeats across a meaningful sample."
    };
  }

  if (result.severity === "watch") {
    return {
      label: "WATCH",
      title: "The journey is worse, but not enough to move budget yet.",
      text:
        "Keep the campaign active and add access messaging. Re-check disruption and journey time inside the final 72 hours."
    };
  }

  if (result.direction === "better") {
    return {
      label: "NO CONSTRAINT",
      title: "Expected matchday friction is lower than the current journey.",
      text:
        "Travel does not create a reason to reduce acquisition. Keep the engine recommendation and monitor changes closer to matchday."
    };
  }

  return {
    label: "NO CHANGE",
    title: "Expected travel friction is stable.",
    text:
      "Travel does not change the current recommendation. Keep the strategy and re-check the journey closer to the fixture."
  };
}
