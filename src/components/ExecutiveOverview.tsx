"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import type { ExperimentMeasurementData, PilotReadinessData, SearchDemandData } from "@/lib/models";
import { sourceHealthCounts, type SourceHealthData } from "@/lib/sourceHealth";

export function ExecutiveOverview({
  readiness,
  search,
  measurement,
  sources
}: {
  readiness: PilotReadinessData;
  search: SearchDemandData;
  measurement: ExperimentMeasurementData;
  sources: SourceHealthData;
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const checklist = readiness.checklist.reduce((result, item) => {
    result[item.state] += 1;
    return result;
  }, { ready: 0, waiting: 0, blocked: 0 });
  const sourceCounts = sourceHealthCounts(sources);

  const cards = [
    {
      label: es ? "Decisión de piloto" : "Pilot decision",
      value: readiness.decision.state.toUpperCase(),
      detail: es ? `${checklist.blocked} bloqueos · ${checklist.ready} listos` : `${checklist.blocked} blockers · ${checklist.ready} ready`,
      href: "/partners#pilot-readiness",
      action: es ? "Revisar gates" : "Review gates",
      tone: checklist.blocked ? "blocked" : "ready"
    },
    {
      label: es ? "Demanda de búsqueda" : "Search demand",
      value: search.status.replaceAll("-", " ").toUpperCase(),
      detail: es ? "UK y España · sin estimaciones inventadas" : "UK and Spain · no invented estimates",
      href: "/experience#search-demand",
      action: es ? "Revisar demanda" : "Review demand",
      tone: search.status === "baseline-ready" ? "ready" : "waiting"
    },
    {
      label: es ? "Medición" : "Measurement",
      value: measurement.status.replaceAll("-", " ").toUpperCase(),
      detail: es ? `${measurement.events.length} eventos definidos · proveedor pendiente` : `${measurement.events.length} events defined · provider pending`,
      href: "/measurement",
      action: es ? "Abrir medición" : "Open measurement",
      tone: measurement.status === "provider-not-configured" ? "waiting" : "ready"
    },
    {
      label: es ? "Fuentes públicas" : "Public sources",
      value: `${sourceCounts.operational}/${sources.sources.length}`,
      detail: es ? `${sourceCounts.action} requieren acceso o resolución` : `${sourceCounts.action} need access or resolution`,
      href: "/sources",
      action: es ? "Ver salud" : "View health",
      tone: sourceCounts.action ? "waiting" : "ready"
    }
  ];

  return (
    <section className="executiveOverview" aria-labelledby="executive-overview-title">
      <div className="todaySectionHead">
        <div><div className="eyebrow">{es ? "CONTROL EJECUTIVO" : "EXECUTIVE CONTROL"}</div><h2 id="executive-overview-title">{es ? "Lo que puede avanzar hoy" : "What can move today"}</h2></div>
        <span>{es ? "Estados de evidencia y decisión, no resultados comerciales." : "Evidence and decision states, not commercial outcomes."}</span>
      </div>
      <div className="executiveGrid">
        {cards.map((card) => (
          <article key={card.href} className={`executiveCard ${card.tone}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
            <Link href={card.href}>{card.action} →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
