"use client";

import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";

export function EvidenceList() {
  const { t } = useLanguage();

  const evidence = [
    {
      signal: t.transparency.territory,
      type: "STRUCTURAL" as const,
      value: "95 / 100",
      source: t.evidence.territorySource,
      note: t.evidence.territoryNote
    },
    {
      signal: t.transparency.calendar,
      type: "MEASURED" as const,
      value: "95 / 100",
      source: t.evidence.calendarSource,
      note: t.evidence.calendarNote
    },
    {
      signal: t.transparency.attention,
      type: "INFERRED" as const,
      value: "38 / 100",
      source: t.evidence.attentionSource,
      note: t.evidence.attentionNote
    },
    {
      signal: t.transparency.weather,
      type: "WAITING" as const,
      value: "—",
      source: t.evidence.weatherSource,
      note: t.evidence.weatherNote
    },
    {
      signal: t.transparency.momentum,
      type: "WAITING" as const,
      value: "—",
      source: t.evidence.momentumSource,
      note: t.evidence.momentumNote
    },
    {
      signal: t.transparency.appeal,
      type: "INFERRED" as const,
      value: "78 / 100",
      source: t.evidence.appealSource,
      note: t.evidence.appealNote
    }
  ];

  return (
    <div className="evidenceList">
      {evidence.map((e) => (
        <div className="evidenceRow" key={e.signal}>
          <div className="evidenceSignal">
            <strong>{e.signal}</strong>
            <SignalBadge type={e.type} />
          </div>
          <div className="evidenceValue">{e.value}</div>
          <div>
            <div className="evidenceSource">{e.source}</div>
            <div className="muted">{e.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
