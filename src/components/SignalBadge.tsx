"use client";

import { useLanguage } from "./LanguageProvider";

export function SignalBadge({
  type
}: {
  type: "MEASURED" | "PLANNING" | "DYNAMIC" | "INFERRED" | "LIVE" | "WAITING" | "STRUCTURAL";
}) {
  const { t, lang } = useLanguage();
  const cls = type.toLowerCase();

  const labelMap = {
    MEASURED: t.common.measured,
    PLANNING: lang === "es" ? "PLANIFICACIÓN" : "PLANNING",
    DYNAMIC: lang === "es" ? "DINÁMICO" : "DYNAMIC",
    INFERRED: t.common.inferred,
    LIVE: t.common.live,
    WAITING: t.common.waiting,
    STRUCTURAL: t.common.structural
  };

  return <span className={`signalBadge ${cls}`}>{labelMap[type]}</span>;
}
