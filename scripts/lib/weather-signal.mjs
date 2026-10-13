// Turns the Open-Meteo matchday forecast into the next home fixture's weather signal.
// The forecast is "forecast", never "measured" weather.

export function isAdverseWeather(weather) {
  return (weather.precipitation_probability_max ?? 0) >= 60 || (weather.wind_speed_max ?? 0) >= 45;
}

function forecastSignal(base, weather) {
  const adverse = isAdverseWeather(weather);
  return {
    ...base,
    category: "weather",
    state: "forecast",
    direction: adverse ? "negative" : "positive",
    materiality: adverse ? "high" : "low",
    observedAt: weather.generated_at,
    title: adverse
      ? { en: "Weather risk has entered the action threshold", es: "El riesgo meteorológico ha entrado en el umbral de acción" }
      : { en: "Matchday weather is currently low risk", es: "El riesgo meteorológico actual para el matchday es bajo" },
    summary: {
      en: `${weather.precipitation_probability_max}% maximum rain probability, ${weather.precipitation_sum} mm and ${weather.wind_speed_max} km/h maximum wind. Forecast, not measured weather.`,
      es: `${weather.precipitation_probability_max}% de probabilidad máxima de lluvia, ${weather.precipitation_sum} mm y viento máximo de ${weather.wind_speed_max} km/h. Es forecast, no tiempo medido.`
    },
    marketingAction: adverse
      ? { en: "Prioritise access, covered arrival and service messaging; review outdoor activations.", es: "Priorizar acceso, llegada cubierta y mensajes de servicio; revisar activaciones exteriores." }
      : { en: "Keep normal acquisition active and retain service messaging as a contingency.", es: "Mantener activa la captación normal y conservar mensajes de servicio como contingencia." },
    sourceName: "Open-Meteo",
    sourceUrl: "https://open-meteo.com/"
  };
}

/**
 * Updates the weather signal of the next home fixture. When that fixture has a forecast
 * but no weather signal yet, one is created, so every upcoming home match gets its
 * forecast as soon as it enters the forecast window. Other signals are left untouched.
 */
export function applyWeatherSignal(signals, nextHomeId, weather, updatedAt) {
  if (!nextHomeId) return signals;
  let found = false;
  const next = signals.map((signal) => {
    if (signal.category !== "weather" || signal.fixtureId !== nextHomeId) return signal;
    found = true;
    if (weather.status !== "forecast") return { ...signal, state: "waiting", observedAt: updatedAt };
    return forecastSignal(signal, weather);
  });
  if (!found && weather.status === "forecast") {
    next.push(forecastSignal({ id: `weather-${nextHomeId}`, fixtureId: nextHomeId }, weather));
  }
  return next;
}
