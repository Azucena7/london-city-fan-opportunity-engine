"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="languageSwitcher" aria-label="Language">
      <button
        type="button"
        className={lang === "en" ? "active" : ""}
        onClick={() => setLang("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === "es" ? "active" : ""}
        onClick={() => setLang("es")}
      >
        ES
      </button>
    </div>
  );
}
