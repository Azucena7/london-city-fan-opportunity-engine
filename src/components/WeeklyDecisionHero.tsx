"use client";

import { useLanguage } from "./LanguageProvider";

export function WeeklyDecisionHero({
  opponent,
  date,
  score,
  decision,
  territory,
  product,
  channel,
  message
}: {
  opponent: string;
  date: string;
  score: number;
  decision: string;
  territory: string;
  product: string;
  channel: string;
  message: string;
}) {
  const { t } = useLanguage();

  return (
    <section className="weeklyHero">
      <div className="weeklyHeroLeft">
        <div className="eyebrow">{t.weekly.eyebrow}</div>
        <div className="weeklyScore">{score}</div>
        <div className="weeklyDecision">{decision}</div>
      </div>

      <div className="weeklyHeroMain">
        <span className="muted">{date}</span>
        <h2>London City v {opponent}</h2>
        <blockquote>“{message || t.weekly.messageFallback}”</blockquote>
      </div>

      <div className="weeklyHeroSide">
        <div><span>{t.common.target}</span><strong>{territory}</strong></div>
        <div><span>{t.common.product}</span><strong>{product}</strong></div>
        <div><span>{t.common.channel}</span><strong>{channel}</strong></div>
      </div>
    </section>
  );
}
