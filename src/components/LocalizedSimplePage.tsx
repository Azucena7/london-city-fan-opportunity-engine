"use client";

import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";

export function LocalizedSimplePage({
  page,
  children
}: {
  page: "fixtures" | "territories" | "signals";
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  const labels = {
    fixtures: {
      eyebrow: t.pages.fixturesEyebrow,
      title: t.pages.fixturesTitle
    },
    territories: {
      eyebrow: t.pages.territoriesEyebrow,
      title: t.pages.territoriesTitle
    },
    signals: {
      eyebrow: t.pages.signalsEyebrow,
      title: t.pages.signalsTitle
    }
  }[page];

  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">{labels.eyebrow}</div>
        <h1 className="pageTitle">{labels.title}</h1>
      </section>
      {children}
    </main>
  );
}
