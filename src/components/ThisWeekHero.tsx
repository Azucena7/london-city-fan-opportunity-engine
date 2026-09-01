"use client";

import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";

export function ThisWeekHero() {
  const { t } = useLanguage();

  return (
    <section className="thisWeekHero">
      <div>
        <div className="eyebrow">{t.thisWeek.operatingView}</div>
        <h1 className="thisWeekTitle">{t.thisWeek.noLive}</h1>
        <p className="lede">{t.thisWeek.noLiveText}</p>
      </div>

      <div className="thisWeekState">
        <div className="stateNumber">2 / 6</div>
        <div className="stateLabel">{t.thisWeek.liveInputs}</div>
        <div className="stateBadges">
          <SignalBadge type="STRUCTURAL" />
          <SignalBadge type="MEASURED" />
          <SignalBadge type="INFERRED" />
          <SignalBadge type="WAITING" />
        </div>
      </div>
    </section>
  );
}
