"use client";
import { useLanguage } from "./LanguageProvider";
import type { Territory } from "@/lib/models";
function score(t:Territory){return Number(t.opportunityScore ?? t.finalOpportunity ?? t.score ?? 0)}
function name(t:Territory){return String(t.name ?? t.lsoaName ?? t.lsoa ?? t.id ?? 'Unknown')}
export function TerritoryCards({items}:{items:Territory[]}){const {lang}=useLanguage(); const es=lang==='es'; const ranked=[...items].sort((a,b)=>score(b)-score(a)).slice(0,8);
 return <div className="territoryCards">{ranked.map((t,i)=><article className="territoryCard" key={`${name(t)}-${i}`}><div className="territoryCardTop"><span className="eyebrow">#{String(i+1).padStart(2,'0')}</span><span className="territoryBigScore">{score(t)}</span></div><h3>{name(t)}</h3><p className="muted">{String(t.borough ?? t.area ?? (es?'Territorio prioritario de South London':'Priority South London territory'))}</p><div className="territoryMeta"><div><span>{es?'Familias':'Families'}</span><strong>{String(t.familyScore ?? '—')}</strong></div><div><span>{es?'Red femenina':'Girls network'}</span><strong>{String(t.girlsNetworkScore ?? '—')}</strong></div><div><span>{es?'Viaje':'Travel'}</span><strong>{t.travelMinutes?`${t.travelMinutes} min`:'—'}</strong></div><div><span>{es?'Competencia':'Competition'}</span><strong>{String(t.competitionPressure ?? '—')}</strong></div></div><div className="strategyLine">{String(t.strategy ?? t.play ?? 'ATTACK / TEST')}</div></article>)}</div>;
}
