"use client";

import { useLanguage } from "./LanguageProvider";

export function AiTransparency() {
  const { t } = useLanguage();

  const rows = [
    [t.transparency.territory, t.common.structural, t.transparency.territoryDetail],
    [t.transparency.calendar, t.common.structural, t.transparency.calendarDetail],
    [t.transparency.attention, t.common.measured, t.transparency.attentionDetail],
    [t.transparency.weather, t.common.live, t.transparency.weatherDetail],
    [t.transparency.momentum, t.common.live, t.transparency.momentumDetail],
    [t.transparency.appeal, t.common.inferred, t.transparency.appealDetail]
  ];

  return (
    <section className="panel">
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">{t.transparency.eyebrow}</div>
          <h3>{t.transparency.title}</h3>
        </div>
      </div>

      <div className="transparencyTable">
        {rows.map(([signal, type, detail]) => (
          <div className="transparencyRow" key={signal}>
            <strong>{signal}</strong>
            <span className="signalType">{type}</span>
            <p>{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
