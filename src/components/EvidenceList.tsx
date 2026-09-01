"use client";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

export function EvidenceList() {
 const {t}=useLanguage(); const s=useLiveMatch();
 const rows=[
  [t.transparency.territory,"STRUCTURAL",`${s.fixture.territoryOpportunity} / 100`,t.evidence.territorySource,t.evidence.territoryNote],
  [t.transparency.calendar,"MEASURED",`${s.fixture.calendarWhitespace} / 100`,t.evidence.calendarSource,t.evidence.calendarNote],
  [t.transparency.attention,"INFERRED",`${s.fixture.attentionAvailability} / 100`,t.evidence.attentionSource,t.evidence.attentionNote],
  [t.transparency.weather,s.weatherStatus,s.weatherSuitability===null?"—":`${s.weatherSuitability} / 100`,t.evidence.weatherSource,t.evidence.weatherNote],
  [t.transparency.momentum,"WAITING","—",t.evidence.momentumSource,t.evidence.momentumNote],
  [t.transparency.appeal,"INFERRED",`${s.fixture.fixtureAppeal} / 100`,t.evidence.appealSource,t.evidence.appealNote]
 ] as const;
 return <div className="evidenceList">{rows.map(([signal,type,value,source,note])=><div className="evidenceRow" key={signal}>
  <div className="evidenceSignal"><strong>{signal}</strong><SignalBadge type={type}/></div>
  <div className="evidenceValue">{value}</div><div><div className="evidenceSource">{source}</div><div className="muted">{note}</div></div>
 </div>)}</div>;
}
