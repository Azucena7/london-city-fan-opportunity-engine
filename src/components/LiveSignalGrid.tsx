"use client";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

export function LiveSignalGrid() {
  const { t, lang } = useLanguage();
  const s = useLiveMatch();
  const es = lang === "es";
  const signals = [
    { name:t.common.territory, score:s.fixture.territoryOpportunity, type:"STRUCTURAL" as const, detail:s.fixture.targetTerritory },
    { name:t.common.calendar, score:s.fixture.calendarWhitespace, type:"PLANNING" as const, detail:es ? "Hueco de calendario" : "Calendar whitespace" },
    { name:t.common.attention, score:s.fixture.attentionAvailability, type:"PLANNING" as const, detail:es ? "Disponibilidad de atención" : "Attention availability" },
    { name:t.common.fixtureAppeal, score:s.fixture.fixtureAppeal, type:"INFERRED" as const, detail:es ? "Prior experto" : "Expert prior" },
    { name:t.common.weather, score:s.weatherSuitability ?? "—", type:s.weatherStatus, detail:s.weatherStatus === "LIVE" ? (es ? "Forecast disponible" : "Forecast available") : (es ? "Fuera de ventana fiable" : "Outside reliable forecast window") },
    { name:t.common.momentum, score:s.attendanceMomentum ?? "—", type:"WAITING" as const, detail:es ? "Requiere ventas / scans verificados" : "Requires verified sales / scans" }
  ];
  return <div className="liveSignalGrid decisionInputGrid">{signals.map(x => <article className="liveSignalCard" key={x.name}>
    <div className="liveSignalTop"><span>{x.name}</span><SignalBadge type={x.type}/></div>
    <div className="liveSignalScore">{x.score}</div><div className="muted">{x.detail}</div>
  </article>)}</div>;
}
