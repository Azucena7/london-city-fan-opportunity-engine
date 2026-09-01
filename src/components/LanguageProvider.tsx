"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { dictionary, Lang } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof dictionary.en;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("lcl-language");
    if (saved === "en" || saved === "es") {
      setLangState(saved);
      document.documentElement.lang = saved;
      return;
    }

    const browser = navigator.language?.toLowerCase();
    if (browser?.startsWith("es")) {
      setLangState("es");
      document.documentElement.lang = "es";
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem("lcl-language", next);
    document.documentElement.lang = next;
  }

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: dictionary[lang]
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
