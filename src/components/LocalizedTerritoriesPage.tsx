"use client";

import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { TerritoryMap } from "./TerritoryMap";
import { useLanguage } from "./LanguageProvider";
import type { Territory } from "@/lib/models";

function score(item: Territory) { return Number(item.opportunityScore ?? item.finalOpportunity ?? item.score ?? 0); }
function name(item: Territory) { return String(item.name ?? item.lsoaName ?? item.lsoa ?? item.id ?? "Unknown"); }

export function LocalizedTerritoriesPage({ territories }: { territories: Territory[] }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const rows = [...territories].sort((a, b) => score(b) - score(a));

  return <main>
    <NavTabs />
    <section className="compactIntro">
      <div className="eyebrow">{es ? "DÓNDE ACTUAR" : "WHERE TO ACT"}</div>
      <h1>{es ? "Territorios comparables, no seis tarjetas repetidas" : "Comparable territories, not six repeated cards"}</h1>
      <p className="lede">{es ? "El mapa orienta; la tabla permite decidir. Selecciona un territorio para conectar oportunidad, acceso y el próximo partido en casa." : "The map gives orientation; the table supports the decision. Select a territory to connect opportunity, access and the next home fixture."}</p>
    </section>
    <TerritoryMap items={rows} />
    <section className="territoryDecisionTable" aria-label={es ? "Ranking de territorios" : "Territory ranking"}>
      <div className="territoryDecisionHead"><span>#</span><span>{es ? "Territorio" : "Territory"}</span><span>{es ? "Oportunidad" : "Opportunity"}</span><span>{es ? "Familias" : "Families"}</span><span>{es ? "Red femenina" : "Girls network"}</span><span>{es ? "Acceso" : "Access"}</span></div>
      {rows.map((territory, index) => <div className="territoryDecisionRow" key={name(territory)}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{name(territory)}<small>{territory.borough}</small></strong>
        <b>{score(territory)}</b>
        <span>{territory.householdsWithDependentChildren ?? "—"}</span>
        <span>{territory.girlsNetworkScore ?? "—"}/100</span>
        <span>{territory.sundayTravelMinutes ?? territory.travelMinutes ?? "—"} min · {territory.transfers ?? "—"} {es ? "transbordos" : "changes"}</span>
      </div>)}
    </section>
    <div className="territoryActions"><p>{es ? "La competencia permanece como contexto y no se descuenta dos veces del score." : "Competition remains context and is not deducted twice from the score."}</p><Link href="/access">{es ? "Analizar un trayecto →" : "Analyse a journey →"}</Link></div>
  </main>;
}
