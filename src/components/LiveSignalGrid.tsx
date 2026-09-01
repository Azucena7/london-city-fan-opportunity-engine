"use client";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

export function LiveSignalGrid() {
  const { t } = useLanguage();
  const s = useLiveMatch();
  const signals = [
    { name:t.common.territory, score:s.fixture.territoryOpportunity, type:"STRUCTURAL" as const, detail:s.fixture.targetTerritory },
    { name:t.common.calendar, score:s.fixture.calendarWhitespace, type:"MEASURED" as const, detail:t.signals.calendarDetail },
    { name:t.common.attention, score:s.fixture.attentionAvailability, type:"INFERRED" as const, detail:t.signals.attentionDetail },
    { name:t.common.fixtureAppeal, score:s.fixture.fixtureAppeal, type:"INFERRED" as const, detail:t.signals.appealDetail },
    { name:t.common.weather, score:s.weatherSuitability ?? "—", type:s.weatherStatus, detail:t.signals.weatherDetail },
    { name:t.common.momentum, score:s.attendanceMomentum ?? "—", type:"WAITING" as const, detail:t.signals.momentumDetail }
  ];
  return <div className="liveSignalGrid">{signals.map(x => <article className="liveSignalCard" key={x.name}>
    <div className="liveSignalTop"><span>{x.name}</span><SignalBadge type={x.type}/></div>
    <div className="liveSignalScore">{x.score}</div><div className="muted">{x.detail}</div>
  </article>)}</div>;
}
