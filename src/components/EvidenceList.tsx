"use client";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

export function EvidenceList() {
 const {t}=useLanguage(); const s=useLiveMatch();
 const rows=[
  [t.transparency.territory,"STRUCTURAL",t.evidence.territorySource,t.evidence.territoryNote],
  [t.transparency.calendar,"PLANNING",t.evidence.calendarSource,t.evidence.calendarNote],
  [t.transparency.attention,"PLANNING",t.evidence.attentionSource,t.evidence.attentionNote],
  [t.transparency.appeal,"INFERRED",t.evidence.appealSource,t.evidence.appealNote],
  [t.transparency.weather,s.weatherStatus,t.evidence.weatherSource,t.evidence.weatherNote],
  [t.transparency.momentum,"WAITING",t.evidence.momentumSource,t.evidence.momentumNote]
 ] as const;
 return <div className="evidenceList simplifiedEvidence">{rows.map(([signal,type,source,note])=><div className="evidenceRow" key={signal}>
  <div className="evidenceSignal"><strong>{signal}</strong><SignalBadge type={type}/></div>
  <div><div className="evidenceSource">{source}</div><div className="muted">{note}</div></div>
 </div>)}</div>;
}
