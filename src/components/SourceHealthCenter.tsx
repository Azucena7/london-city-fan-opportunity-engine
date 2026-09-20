"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { sourceHealthCounts, type SourceHealthData, type SourceHealthState } from "@/lib/sourceHealth";

const stateLabels: Record<SourceHealthState, { en: string; es: string }> = {
  operational: { en: "Operational", es: "Operativa" },
  degraded: { en: "Degraded", es: "Degradada" },
  blocked: { en: "Blocked", es: "Bloqueada" },
  "not-configured": { en: "Not configured", es: "Sin configurar" },
  "requires-access": { en: "Requires club access", es: "Requiere acceso del club" }
};

function formatTimestamp(value: string | null, locale: string, empty: string) {
  if (!value) return empty;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London"
  }).format(new Date(value));
}

export function SourceHealthCenter({ data, compact = false }: { data: SourceHealthData; compact?: boolean }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const counts = sourceHealthCounts(data);
  const locale = es ? "es-ES" : "en-GB";
  const visibleSources = compact ? data.sources.filter((source) => source.state !== "requires-access") : data.sources;

  return (
    <section className={`sourceHealthCenter${compact ? " compact" : ""}`} aria-labelledby="source-health-title">
      <div className="sourceHealthHead">
        <div>
          <div className="eyebrow">{es ? "SALUD DE FUENTES" : "SOURCE HEALTH"}</div>
          <h2 id="source-health-title">{es ? "Qué sabemos y qué necesita acción" : "What we know and what needs action"}</h2>
          <p>{es
            ? "Disponibilidad real, método de acceso y siguiente requisito. Un bloqueo nunca se presenta como demanda cero."
            : "Real availability, access method and next requirement. A blocked source is never presented as zero demand."}</p>
        </div>
        <div className="sourceHealthTotals" aria-label={es ? "Resumen de fuentes" : "Source summary"}>
          <div><strong>{counts.operational}</strong><span>{es ? "operativas" : "operational"}</span></div>
          <div><strong>{counts.degraded}</strong><span>{es ? "degradada" : "degraded"}</span></div>
          <div><strong>{counts.action}</strong><span>{es ? "requieren acción" : "need action"}</span></div>
        </div>
      </div>

      <div className="sourceHealthList">
        {visibleSources.map((source) => (
          <article key={source.id} className={`sourceHealthItem state-${source.state}`}>
            <div className="sourceHealthIdentity">
              <span className="sourceState"><i aria-hidden="true" />{stateLabels[source.state][lang]}</span>
              <strong>{source.label[lang]}</strong>
              <small>{source.category.replaceAll("-", " ")}</small>
            </div>
            <div className="sourceHealthMethod">
              <span>{es ? "Método" : "Method"}</span>
              <strong>{source.method.replaceAll("-", " ")}</strong>
              <small>{source.cadence.replaceAll("-", " ")}</small>
            </div>
            <p>{source.note[lang]}</p>
            <div className="sourceHealthUpdate">
              <span>{es ? "Último éxito" : "Last success"}</span>
              <strong>{formatTimestamp(source.lastSuccessfulAt, locale, es ? "Sin dato" : "No data")}</strong>
              {source.ownerAction ? <small>{source.ownerAction[lang]}</small> : null}
            </div>
          </article>
        ))}
      </div>

      {compact ? <Link className="sourceHealthLink" href="/sources">{es ? "Abrir registro completo de fuentes →" : "Open the full source register →"}</Link> : (
        <div className="sourceHealthBoundary">
          <strong>{es ? "Frontera de datos" : "Data boundary"}</strong>
          <p>{es
            ? "Este registro describe únicamente fuentes públicas, configuración del prototipo y contratos preparados. No implica acceso a CRM, ticketing ni analítica privada del club."
            : "This register covers public sources, prototype configuration and prepared contracts only. It does not imply access to club CRM, ticketing or private analytics."}</p>
        </div>
      )}
    </section>
  );
}
