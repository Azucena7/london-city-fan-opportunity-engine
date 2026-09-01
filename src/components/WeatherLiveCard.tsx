"use client";

import { useEffect, useMemo, useState } from "react";
import { SignalBadge } from "./SignalBadge";
import { weatherLabel, weatherSuitability } from "@/lib/weather";
import { useLanguage } from "./LanguageProvider";

type WeatherPayload = {
  status: string;
  venue?: string;
  generated_at?: string;
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
    wind_speed_10m_max?: number[];
  };
};

export function WeatherLiveCard({ targetDate }: { targetDate?: string }) {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ status: "unavailable" }))
      .finally(() => setLoading(false));
  }, []);

  const day = useMemo(() => {
    if (!targetDate || !data?.daily?.time?.length) return null;
    const index = data.daily.time.indexOf(targetDate);
    if (index < 0) return null;

    return {
      date: data.daily.time[index],
      code: data.daily.weather_code?.[index],
      max: data.daily.temperature_2m_max?.[index],
      min: data.daily.temperature_2m_min?.[index],
      precipProb: data.daily.precipitation_probability_max?.[index],
      precip: data.daily.precipitation_sum?.[index],
      wind: data.daily.wind_speed_10m_max?.[index]
    };
  }, [data, targetDate]);

  if (!targetDate) {
    return (
      <article className="weatherCard">
        <div className="liveSignalTop">
          <span>{t.common.weather}</span>
          <SignalBadge type="WAITING" />
        </div>
        <div className="weatherHeadline">{t.weather.noDate}</div>
        <div className="muted">{t.weather.noDateText}</div>
      </article>
    );
  }

  if (loading) {
    return (
      <article className="weatherCard">
        <div className="liveSignalTop">
          <span>{t.common.weather}</span>
          <SignalBadge type="WAITING" />
        </div>
        <div className="weatherHeadline">{t.weather.loading}</div>
      </article>
    );
  }

  if (!day || data?.status !== "live") {
    return (
      <article className="weatherCard">
        <div className="liveSignalTop">
          <span>{t.common.weather}</span>
          <SignalBadge type="WAITING" />
        </div>
        <div className="weatherHeadline">{t.weather.outside}</div>
        <div className="muted">{t.weather.outsideText}</div>
      </article>
    );
  }

  const suitability = weatherSuitability({
    precipitationProbability: day.precipProb,
    precipitationSum: day.precip,
    maxTemp: day.max,
    minTemp: day.min,
    windSpeed: day.wind
  });

  return (
    <article className="weatherCard liveWeather">
      <div className="liveSignalTop">
        <span>{t.common.weather} · Hayes Lane</span>
        <SignalBadge type="LIVE" />
      </div>

      <div className="weatherGrid">
        <div>
          <div className="weatherScore">{suitability}</div>
          <div className="muted">{t.weather.suitability}</div>
        </div>

        <div>
          <div className="weatherHeadline">{weatherLabel(day.code)}</div>
          <div className="weatherFacts">
            <span>{day.max ?? "—"}° max</span>
            <span>{day.min ?? "—"}° min</span>
            <span>{day.precipProb ?? "—"}% rain</span>
            <span>{day.wind ?? "—"} km/h wind</span>
          </div>
        </div>
      </div>

      <div className="weatherMeta">
        <span>{day.date}</span>
        <span>
          {t.weather.refreshed} ·{" "}
          {data.generated_at
            ? new Date(data.generated_at).toLocaleString(lang === "es" ? "es-ES" : "en-GB")
            : t.common.live}
        </span>
      </div>
    </article>
  );
}
