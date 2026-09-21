"use client";

import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { TerritoryMap } from "./TerritoryMap";
import { useLanguage } from "./LanguageProvider";
import type { Territory } from "@/lib/models";

function score(item: Territory) { return Number(item.opportunityScore ?? item.finalOpportunity ?? item.score ?? 0); }
function name(item: Territory) { return String(item.name ?? item.lsoaName ?? item.lsoa ?? item.id ?? "Unknown"); }
function travel(item: Territory) { return Number(item.sundayTravelMinutes ?? item.travelMinutes ?? 0); }

function action(item: Territory, es: boolean) {
  if (score(item) >= 90 && travel(item) <= 25) return es ? "Validar y captar" : "Validate & acquire";
  if (score(item) >= 88) return es ? "Validar acceso" : "Validate access";
  return es ? "Prueba selectiva" : "Selective test";
}

export function LocalizedTerritoriesPage({ territories }: { territories: Territory[] }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const rows = [...territories].sort((a, b) => score(b) - score(a));
  const acquisitionReady = rows.filter((item) => score(item) >= 90 && travel(item) <= 25);
  const highestFamily = [...rows].sort((a, b) => Number(b.householdsWithDependentChildren ?? 0) - Number(a.householdsWithDependentChildren ?? 0))[0];

  return <main>
    <NavTabs />
    <section className="compactIntro territoryFlowIntro">
      <div>
        <div className="eyebrow">{es ? "DÓNDE ACTUAR" : "WHERE TO ACT"}</div>
        <h1>{es ? "Prioriza el territorio; valida el acceso antes de escalar" : "Prioritise the territory; validate access before scaling"}</h1>
        <p className="lede">{es ? "La oportunidad identifica dónde captar. La validación de acceso determina si mantener inversión, reforzar información de viaje o proteger la demanda existente." : "Opportunity identifies where to acquire. Access validation decides whether to maintain investment, strengthen travel guidance or protect existing demand."}</p>
      </div>
      <div className="territoryDecisionRule">
        <span>{es ? "REGLA OPERATIVA" : "OPERATING RULE"}</span>
        <strong>{es ? "Oportunidad × acceso × partido" : "Opportunity × access × fixture"}</strong>
        <p>{es ? "El score prioriza. El trayecto valida. El calendario activa." : "The score prioritises. The journey validates. The calendar activates."}</p>
      </div>
    </section>

    <section className="territorySummary" aria-label={es ? "Resumen territorial" : "Territory summary"}>
      <div><strong>{rows.length}</strong><span>{es ? "territorios comparados" : "territories compared"}</span></div>
      <div><strong>{acquisitionReady.length}</strong><span>{es ? "listos para validar captación" : "ready to validate acquisition"}</span></div>
      <div><strong>{highestFamily ? `${name(highestFamily)} · ${highestFamily.householdsWithDependentChildren}` : "—"}</strong><span>{es ? "mayor volumen de familias" : "highest family volume"}</span></div>
    </section>

    <TerritoryMap items={rows} />
    <section className="territoryDecisionTable" aria-label={es ? "Ranking de territorios" : "Territory ranking"}>
      <div className="territoryDecisionHead"><span>#</span><span>{es ? "Territorio" : "Territory"}</span><span>{es ? "Oportunidad" : "Opportunity"}</span><span>{es ? "Acceso base" : "Baseline access"}</span><span>{es ? "Red femenina" : "Girls network"}</span><span>{es ? "Siguiente decisión" : "Next decision"}</span></div>
      {rows.map((territory, index) => <Link className="territoryDecisionRow" href={`/access?territory=${encodeURIComponent(name(territory))}#territory`} aria-label={`${name(territory)} · ${action(territory, es)}`} key={name(territory)}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{name(territory)}<small>{territory.borough}</small></strong>
        <b>{score(territory)}</b>
        <span>{territory.sundayTravelMinutes ?? territory.travelMinutes ?? "—"} min · {territory.transfers ?? "—"} {es ? "transbordos" : "changes"}</span>
        <span>{territory.girlsNetworkScore ?? "—"}/100</span>
        <span className="territoryNextAction">{action(territory, es)} →</span>
      </Link>)}
    </section>
    <div className="territoryActions"><p>{es ? "La competencia permanece como contexto y no se descuenta dos veces del score. Ningún territorio se escala solo por una ruta individual." : "Competition remains context and is not deducted twice from the score. No territory is scaled from one individual route."}</p><Link href="/access#territory">{es ? "Abrir validación de acceso →" : "Open access validation →"}</Link></div>
  </main>;
}
