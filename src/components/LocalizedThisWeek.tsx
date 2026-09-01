"use client";

import { NavTabs } from "@/components/NavTabs";
import { ThisWeekHero } from "@/components/ThisWeekHero";
import { LiveSignalGrid } from "@/components/LiveSignalGrid";
import { EvidenceList } from "@/components/EvidenceList";
import { WeatherLiveCard } from "@/components/WeatherLiveCard";
import { NextFixtureContext } from "@/components/NextFixtureContext";
import { useLanguage } from "@/components/LanguageProvider";

export function LocalizedThisWeek({
  opponent,
  displayDate,
  venue,
  targetDate
}: {
  opponent: string;
  displayDate?: string;
  venue?: string;
  targetDate?: string;
}) {
  const { t } = useLanguage();

  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">{t.thisWeek.operatingView}</div>
        <h1 className="pageTitle">{t.thisWeek.title}</h1>
        <p className="lede">{t.thisWeek.lede}</p>
      </section>

      <NextFixtureContext
        opponent={opponent}
        date={displayDate}
        venue={venue}
      />

      <ThisWeekHero />

      <WeatherLiveCard targetDate={targetDate} />

      <section className="panel widePanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">{t.thisWeek.signalState}</div>
            <h3>{t.thisWeek.readiness}</h3>
          </div>
        </div>
        <LiveSignalGrid />
      </section>

      <section className="panel widePanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">{t.thisWeek.evidence}</div>
            <h3>{t.thisWeek.why}</h3>
          </div>
        </div>
        <EvidenceList />
      </section>

      <section className="method">
        <div className="eyebrow">{t.thisWeek.rule}</div>
        <h3>{t.thisWeek.ruleTitle}</h3>
        <p className="muted">{t.thisWeek.ruleText}</p>
      </section>
    </main>
  );
}
