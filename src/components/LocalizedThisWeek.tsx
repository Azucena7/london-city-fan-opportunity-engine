"use client";
import { NavTabs } from "./NavTabs";
import { ThisWeekHero } from "./ThisWeekHero";
import { LiveSignalGrid } from "./LiveSignalGrid";
import { EvidenceList } from "./EvidenceList";
import { WeatherLiveCard } from "./WeatherLiveCard";
import { NextFixtureContext } from "./NextFixtureContext";
import { useLanguage } from "./LanguageProvider";
import { LiveMatchProvider } from "./LiveMatchProvider";
import type { Fixture } from "@/lib/models";

export function LocalizedThisWeek({ fixture }: { fixture: Fixture }) {
 const {t,lang}=useLanguage();
 const displayDate=new Intl.DateTimeFormat(lang==='es'?'es-ES':'en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(`${fixture.date}T12:00:00`));
 return <LiveMatchProvider fixture={fixture}><main>
  <section className="subHero"><div className="brand">LCL / FAN OPPORTUNITY LAB</div><NavTabs/><div className="eyebrow">{t.thisWeek.operatingView}</div><h1 className="pageTitle">{t.thisWeek.title}</h1><p className="lede">{t.thisWeek.lede}</p></section>
  <NextFixtureContext opponent={fixture.opponent} date={`${displayDate} · ${fixture.kickoff ?? 'TBC'}`} venue={fixture.venue ?? fixture.stadium ?? 'Hayes Lane'}/>
  <ThisWeekHero/><WeatherLiveCard/>
  <section className="panel widePanel"><div className="sectionHeader"><div><div className="eyebrow">{t.thisWeek.signalState}</div><h3>{t.thisWeek.readiness}</h3></div></div><LiveSignalGrid/></section>
  <section className="panel widePanel"><div className="sectionHeader"><div><div className="eyebrow">{t.thisWeek.evidence}</div><h3>{t.thisWeek.why}</h3></div></div><EvidenceList/></section>
  <section className="method"><div className="eyebrow">{t.thisWeek.rule}</div><h3>{t.thisWeek.ruleTitle}</h3><p className="muted">{t.thisWeek.ruleText}</p></section>
 </main></LiveMatchProvider>;
}
