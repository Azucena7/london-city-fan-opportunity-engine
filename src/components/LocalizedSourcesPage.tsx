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
        <div className="eyebrow">{es ? "OPERACIONES DE DATOS PÚBLICOS" : "PUBLIC DATA OPERATIONS"}</div>
        <h1>{es ? "Salud de fuentes, sin falsa certeza." : "Source health, without false certainty."}</h1>
        <p className="lede">{es
          ? "Un registro operativo de disponibilidad, frescura, método, límites y siguiente acción para cada fuente del Engine."
          : "An operational register of availability, freshness, method, limits and next action for every Engine source."}</p>
      </section>
      <SourceHealthCenter data={data} />
    </main>
  );
}
