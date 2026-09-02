"use client";

import { useEffect, useState } from "react";
import { NavTabs } from "./NavTabs";
import { TerritoryCards } from "./TerritoryCards";
import { FixtureTable } from "./FixtureTable";
import { useLanguage } from "./LanguageProvider";
import type { Fixture, Territory } from "@/lib/models";

type View = "territories" | "fixtures";

export function LocalizedOpportunitiesPage({ territories, fixtures }: { territories: Territory[]; fixtures: Fixture[] }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [view, setView] = useState<View>("territories");

  useEffect(() => {
    if (window.location.hash === "#fixtures") setView("fixtures");
    if (window.location.hash === "#territories") setView("territories");
  }, []);

  function select(next: View) {
    setView(next);
    window.history.replaceState(null, "", `/opportunities#${next}`);
  }

  return <main>
    <NavTabs/>
    <section className="compactIntro">
      <div className="eyebrow">{es ? "OPORTUNIDADES" : "OPPORTUNITIES"}</div>
      <h1>{es ? "¿Dónde y cuándo merece la pena actuar?" : "Where and when should London City act?"}</h1>
      <p className="lede">{es ? "WHERE prioriza territorios. WHEN prioriza partidos. Juntos convierten demanda potencial en una decisión de inversión." : "WHERE prioritises territories. WHEN prioritises fixtures. Together they turn potential demand into an investment decision."}</p>
    </section>

    <div className="viewTabs" role="tablist" aria-label={es ? "Vista de oportunidades" : "Opportunity view"}>
      <button className={view === "territories" ? "active" : ""} onClick={() => select("territories")}>{es ? "Territorios" : "Territories"}</button>
      <button className={view === "fixtures" ? "active" : ""} onClick={() => select("fixtures")}>{es ? "Partidos" : "Fixtures"}</button>
    </div>

    {view === "territories" ? <>
      <section className="frameworkStrip">
        <div><span>WHERE</span><strong>{es ? "Family 35% · Girls network 35% · Access 30%" : "Family 35% · Girls network 35% · Access 30%"}</strong></div>
        <p>{es ? "Competition Pressure e IDACI son contexto: 0% de peso directo." : "Competition Pressure and IDACI remain context: 0% direct weight."}</p>
      </section>
      <TerritoryCards items={territories}/>
      <section className="insightNote"><div className="eyebrow">{es ? "UNIDAD DE CAPTACIÓN" : "ACQUISITION UNIT"}</div><h3>{es ? "A veces el cliente no es una familia. Es una organización." : "Sometimes the acquisition unit is an organisation, not one household."}</h3><p>{es ? "Un nodo grassroots puede conectar a decenas de jugadoras, familias y espectadores relacionados." : "One grassroots node can connect dozens of girls, families and related spectators."}</p></section>
    </> : <>
      <section className="frameworkStrip">
        <div><span>WHEN</span><strong>35% Territory · 25% Calendar · 20% Attention · 20% Appeal</strong></div>
        <p>{es ? "No todos los partidos merecen la misma intensidad de captación." : "Not every fixture deserves the same acquisition intensity."}</p>
      </section>
      <section className="panel widePanel"><div className="sectionHeader"><div><div className="eyebrow">2026/27</div><h3>{es ? "Calendario de decisión" : "Decision calendar"}</h3></div><span className="muted">{es ? "Capa de planificación" : "Planning layer"}</span></div><FixtureTable items={fixtures}/></section>
      <section className="insightNote"><div className="eyebrow">{es ? "PRINCIPIO" : "PRINCIPLE"}</div><h3>{es ? "Un rival premium todavía puede ser una mala ventana de captación." : "A premium opponent can still be a poor acquisition window."}</h3></section>
    </>}
  </main>;
}
