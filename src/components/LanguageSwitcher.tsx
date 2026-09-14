"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="languageSwitcher" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === "en" ? "active" : ""}
        aria-pressed={lang === "en"}
        aria-label="English"
        onClick={() => setLang("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === "es" ? "active" : ""}
        aria-pressed={lang === "es"}
        aria-label="Español"
        onClick={() => setLang("es")}
      >
        ES
      </button>
    </div>
  );
}
