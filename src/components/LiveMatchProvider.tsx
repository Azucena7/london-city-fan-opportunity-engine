"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Fixture, LiveMatchState } from "@/lib/models";
import { decisionFromScore, liveScore } from "@/lib/scoring";
import { weatherSuitability } from "@/lib/weather";

type ContextValue = LiveMatchState & { weatherStatus: "LIVE" | "WAITING" };
const Context = createContext<ContextValue | null>(null);

export function LiveMatchProvider({ fixture, children }: { fixture: Fixture; children: React.ReactNode }) {
  const [weather, setWeather] = useState<number | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<"LIVE" | "WAITING">("WAITING");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const attendanceMomentum: number | null = null;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/weather")
      .then(r => r.json())
      .then(data => {
        if (cancelled || data?.status !== "live") return;
        const index = data?.daily?.time?.indexOf(fixture.date) ?? -1;
        if (index < 0) return;
        const score = weatherSuitability({
          precipitationProbability: data.daily.precipitation_probability_max?.[index],
          precipitationSum: data.daily.precipitation_sum?.[index],
          maxTemp: data.daily.temperature_2m_max?.[index],
          minTemp: data.daily.temperature_2m_min?.[index],
          windSpeed: data.daily.wind_speed_10m_max?.[index]
        });
        setWeather(score);
        setWeatherStatus("LIVE");
        setUpdatedAt(data.generated_at ?? new Date().toISOString());
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [fixture.date]);

  const value = useMemo<ContextValue>(() => {
    const score = weather !== null && attendanceMomentum !== null
      ? liveScore({
          territory: fixture.territoryOpportunity,
          calendar: fixture.calendarWhitespace,
          attentionAvailability: fixture.attentionAvailability,
          fixtureAppeal: fixture.fixtureAppeal,
          weather,
          attendanceMomentum
        })
      : null;
    const activeScore = score ?? fixture.planningScore;
    const readiness = 4 + (weather !== null ? 1 : 0) + (attendanceMomentum !== null ? 1 : 0);
    return {
      fixture,
      weatherSuitability: weather,
      attendanceMomentum,
      planningScore: fixture.planningScore,
      liveScore: score,
      activeScore,
      decision: decisionFromScore(activeScore),
      readiness,
      totalSignals: 6,
      updatedAt,
      weatherStatus
    };
  }, [fixture, weather, attendanceMomentum, updatedAt, weatherStatus]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLiveMatch() {
  const value = useContext(Context);
  if (!value) throw new Error("useLiveMatch must be used inside LiveMatchProvider");
  return value;
}
