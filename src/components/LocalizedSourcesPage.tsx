"use client";

import { NavTabs } from "./NavTabs";
import { SourceHealthCenter } from "./SourceHealthCenter";
import { useLanguage } from "./LanguageProvider";
import type { SourceHealthData } from "@/lib/sourceHealth";

export function LocalizedSourcesPage({ data }: { data: SourceHealthData }) {
  const { lang } = useLanguage();
  const es = lang === "es";

  return (
    <main>
      <NavTabs />
      <section className="compactIntro sourceIntro">
        <div className="eyebrow">{es ? "DATOS Y FUENTES" : "DATA & SOURCES"}</div>
        <h1>{es ? "¿Qué decisiones podemos confiar hoy?" : "Which decisions can we trust today?"}</h1>
        <p className="lede">{es
          ? "La salud de una API no es el resultado. Lo importante es saber si una decisión está soportada, matizada, bloqueada o requiere acceso del club."
          : "API health is not the outcome. What matters is whether a decision is supported, qualified, blocked or waiting for club access."}</p>
      </section>
      <SourceHealthCenter data={data} />
    </main>
  );
}
