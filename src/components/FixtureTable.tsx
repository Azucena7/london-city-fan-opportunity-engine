"use client";
import { useLanguage } from "./LanguageProvider";
import type { Fixture } from "@/lib/models";
export function FixtureTable({items}:{items:Fixture[]}){
 const {t}=useLanguage(); const rows=[...items].sort((a,b)=>a.date.localeCompare(b.date));
 return <div className="fixtureTable"><div className="fixtureHead"><span>{t.common.opponent}</span><span>{t.common.territory}</span><span>{t.common.calendar}</span><span>{t.common.attention}</span><span>{t.common.score}</span><span>{t.common.decision}</span></div>
 {rows.map(f=><div className="fixtureRow" key={`${f.date}-${f.opponent}`}><div><strong>{f.opponent}</strong><small>{f.date} · {f.kickoff ?? 'TBC'}</small></div><div>{f.targetTerritory}</div><div>{f.calendarWhitespace}</div><div>{f.attentionPressure}</div><div className="scoreCell">{f.planningScore}</div><div><span className="decisionPill">{f.decision}</span></div></div>)}</div>;
}
