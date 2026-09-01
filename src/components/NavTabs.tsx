"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function NavTabs() {
  const { t } = useLanguage();

  const links = [
    ["/", t.nav.overview],
    ["/this-week", t.nav.thisWeek],
    ["/travel", t.nav.travel],
    ["/fixtures", t.nav.fixtures],
    ["/territories", t.nav.territories],
    ["/signals", t.nav.signals],
    ["/story", t.nav.story]
  ];

  return (
    <div className="navTabsRow">
      <nav className="tabs">
        {links.map(([href, label]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </nav>
      <LanguageSwitcher />
    </div>
  );
}
