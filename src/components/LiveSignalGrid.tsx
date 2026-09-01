"use client";

import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";

export function LiveSignalGrid() {
  const { t } = useLanguage();

  const signals = [
    {
      name: t.common.territory,
      score: "95",
      type: "STRUCTURAL" as const,
      detail: t.signals.territoryDetail
    },
    {
      name: t.common.calendar,
      score: "95",
      type: "MEASURED" as const,
      detail: t.signals.calendarDetail
    },
    {
      name: t.common.attention,
      score: "62",
      type: "INFERRED" as const,
      detail: t.signals.attentionDetail
    },
    {
      name: t.common.fixtureAppeal,
      score: "78",
      type: "INFERRED" as const,
      detail: t.signals.appealDetail
    },
    {
      name: t.common.weather,
      score: "—",
      type: "WAITING" as const,
      detail: t.signals.weatherDetail
    },
    {
      name: t.common.momentum,
      score: "—",
      type: "WAITING" as const,
      detail: t.signals.momentumDetail
    }
  ];

  return (
    <div className="liveSignalGrid">
      {signals.map((s) => (
        <article className="liveSignalCard" key={s.name}>
          <div className="liveSignalTop">
            <span>{s.name}</span>
            <SignalBadge type={s.type} />
          </div>
          <div className="liveSignalScore">{s.score}</div>
          <div className="muted">{s.detail}</div>
        </article>
      ))}
    </div>
  );
}
