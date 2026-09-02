"use client";

import { useLanguage } from "./LanguageProvider";

export type FrictionState = "stable" | "watch" | "high" | "waiting";

export function FrictionBadge({ state }: { state: FrictionState }) {
  const { lang } = useLanguage();
  const es = lang === "es";

  const labels: Record<FrictionState, string> = {
    stable: es ? "ESTABLE" : "STABLE",
    watch: es ? "VIGILAR" : "WATCH",
    high: es ? "FRICCIÓN ALTA" : "HIGH FRICTION",
    waiting: es ? "EN ESPERA" : "WAITING"
  };

  return <span className={`frictionBadge ${state}`}>{labels[state]}</span>;
}
