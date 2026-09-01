"use client";

import { NavTabs } from "@/components/NavTabs";
import { StorySteps } from "@/components/StorySteps";
import { ShareCard } from "@/components/ShareCard";
import { TerritoryMap } from "@/components/TerritoryMap";
import { useLanguage } from "@/components/LanguageProvider";

export function LocalizedStoryPage({ territories }: { territories: any[] }) {
  const { t } = useLanguage();

  return (
    <main>
      <section className="subHero storyHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">{t.pages.storyEyebrow}</div>
        <h1 className="pageTitle">{t.pages.storyTitle}</h1>
        <p className="lede">{t.pages.storyLede}</p>
      </section>

      <StorySteps />
      <TerritoryMap items={territories} />
      <ShareCard />

      <footer>
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">{t.common.publicPrototype}</div>
      </footer>
    </main>
  );
}
