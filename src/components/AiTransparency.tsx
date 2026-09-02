"use client";

import { useLanguage } from "./LanguageProvider";

export function AiTransparency() {
  const { t, lang } = useLanguage();
  const planning = lang === "es" ? "PLANIFICACIÓN" : "PLANNING";
  const waiting = lang === "es" ? "EN ESPERA" : "WAITING";
  const weatherState = lang === "es" ? "LIVE CUANDO DISPONIBLE" : "LIVE WHEN AVAILABLE";

  const rows = [
    [t.transparency.territory, t.common.structural, t.transparency.territoryDetail],
    [t.transparency.calendar, planning, t.transparency.calendarDetail],
    [t.transparency.attention, planning, t.transparency.attentionDetail],
    [t.transparency.appeal, t.common.inferred, t.transparency.appealDetail],
    [t.transparency.weather, weatherState, t.transparency.weatherDetail],
    [t.transparency.momentum, waiting, t.transparency.momentumDetail]
  ];

  return (
    <section className="panel transparencyPanel">
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">{lang === "es" ? "ESTADOS DE EVIDENCIA" : "EVIDENCE STATES"}</div>
          <h3>{lang === "es" ? "Qué sabemos, qué planificamos y qué sigue pendiente" : "What is known, planned, inferred or still waiting"}</h3>
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
