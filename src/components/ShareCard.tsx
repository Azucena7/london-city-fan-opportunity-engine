"use client";

import { useLanguage } from "./LanguageProvider";

export function ShareCard() {
  const { t } = useLanguage();

  return (
    <section className="shareCard">
      <div className="shareEyebrow">{t.story.shareEyebrow}</div>
      <div className="shareQuote">{t.story.shareQuote}</div>
      <div className="shareFooter">
        <span>Fan Opportunity Engine</span>
        <span>Women’s football × practical AI</span>
      </div>
    </section>
  );
}
