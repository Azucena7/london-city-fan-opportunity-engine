"use client";

import { useLanguage } from "./LanguageProvider";

export function NextFixtureContext({
  opponent,
  date,
  venue
}: {
  opponent: string;
  date?: string;
  venue?: string;
}) {
  const { t } = useLanguage();

  return (
    <section className="nextFixtureContext">
      <div>
        <div className="eyebrow">{t.thisWeek.nextHome}</div>
        <h2>{opponent}</h2>
      </div>

      <div className="nextFixtureMeta">
        <div>
          <span>{t.common.date}</span>
          <strong>{date ?? t.common.unknown}</strong>
        </div>
        <div>
          <span>{t.common.venue}</span>
          <strong>{venue ?? "Hayes Lane"}</strong>
        </div>
        <div>
          <span>{t.common.selection}</span>
          <strong>{t.common.automatic}</strong>
        </div>
      </div>
    </section>
  );
}
