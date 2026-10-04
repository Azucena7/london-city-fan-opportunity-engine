"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { Lang } from "@/lib/i18n";


type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLang = "en"
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const saved = window.localStorage.getItem("avela-language") ?? window.localStorage.getItem("lcl-language");

    if (saved === "en" || saved === "es") {
      setLangState(saved);
      window.localStorage.setItem("avela-language", saved);
      window.localStorage.removeItem("lcl-language");
      document.documentElement.lang = saved;
      document.cookie = `avela-language=${saved}; path=/; max-age=31536000; samesite=lax`;
      document.cookie = "lcl-language=; path=/; max-age=0; samesite=lax";
      return;
    }

    const browser = navigator.language?.toLowerCase();

    if (browser?.startsWith("es")) {
      setLangState("es");
      document.documentElement.lang = "es";
      window.localStorage.setItem("avela-language", "es");
      document.cookie = "avela-language=es; path=/; max-age=31536000; samesite=lax";
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem("avela-language", next);
    document.cookie = `avela-language=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return ctx;
}
