"use client";

import { useLanguage } from "./LanguageProvider";

export function SignalBadge({
  type
}: {
  type: "MEASURED" | "INFERRED" | "LIVE" | "WAITING" | "STRUCTURAL";
}) {
  const { t } = useLanguage();
  const cls = type.toLowerCase();

  const labelMap = {
    MEASURED: t.common.measured,
    INFERRED: t.common.inferred,
    LIVE: t.common.live,
    WAITING: t.common.waiting,
    STRUCTURAL: t.common.structural
  };

  return <span className={`signalBadge ${cls}`}>{labelMap[type]}</span>;
}
