"use client";

import { NavTabs } from "@/components/NavTabs";
import { JourneyPlanner } from "@/components/JourneyPlanner";
import { useLanguage } from "@/components/LanguageProvider";

export function LocalizedTravelPage({
  matchDate
}: {
  matchDate?: string;
}) {
  const { t } = useLanguage();

  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">{t.travel.eyebrow}</div>
        <h1 className="pageTitle">{t.travel.title}</h1>
        <p className="lede">{t.travel.lede}</p>
      </section>

      <JourneyPlanner matchDate={matchDate} />

      <section className="method">
        <div className="eyebrow">{t.travel.why}</div>
        <h3>{t.travel.whyTitle}</h3>
        <p className="muted">{t.travel.whyText}</p>
      </section>
    </main>
  );
}
