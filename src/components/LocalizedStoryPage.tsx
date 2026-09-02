"use client";

import { NavTabs } from "@/components/NavTabs";
import { StorySteps } from "@/components/StorySteps";
import { ShareCard } from "@/components/ShareCard";
import { TerritoryMap } from "@/components/TerritoryMap";
import { useLanguage } from "@/components/LanguageProvider";

export function LocalizedStoryPage({ territories }: { territories: any[] }) {
  const { t, lang } = useLanguage();
  const es = lang === "es";

  return (
    <main>
      <NavTabs />
      <section className="storyHero editorialHero">
        <div className="eyebrow">{es ? "CASE STUDY" : "CASE STUDY"}</div>
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
