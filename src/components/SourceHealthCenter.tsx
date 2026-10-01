"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { decisionReliabilityCounts, decisionReliabilityState, sourceHealthCounts, type DecisionReliabilityState, type SourceHealthData, type SourceHealthState } from "@/lib/sourceHealth";

const stateLabels: Record<SourceHealthState, { en: string; es: string }> = {
  operational: { en: "Operational", es: "Operativa" },
  degraded: { en: "Degraded", es: "Degradada" },
  blocked: { en: "Blocked", es: "Bloqueada" },
  "not-configured": { en: "Not configured", es: "Sin configurar" },
  "requires-access": { en: "Requires club access", es: "Requiere acceso del club" }
};

const reliabilityLabels: Record<DecisionReliabilityState, { en: string; es: string }> = {
  reliable: { en: "Decision-ready", es: "Lista para decidir" },
  qualified: { en: "Use with qualification", es: "Usar con matices" },
  blocked: { en: "Blocked by evidence", es: "Bloqueada por evidencia" },
  "access-limited": { en: "Club access required", es: "Requiere acceso del club" }
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
  const decisionCounts = decisionReliabilityCounts(data);
  const locale = es ? "es-ES" : "en-GB";
  const visibleSources = compact ? data.sources.filter((source) => source.state !== "requires-access") : data.sources;

  return (
    <section className={`sourceHealthCenter${compact ? " compact" : ""}`} aria-labelledby="source-health-title">
      <div className="sourceHealthHead">
        <div>
          <div className="eyebrow">{es ? "CONTROL DE CONFIANZA" : "CONFIDENCE CONTROL"}</div>
          <h2 id="source-health-title">{es ? "De salud técnica a confianza de decisión" : "From technical health to decision confidence"}</h2>
          <p>{es
            ? "Primero mostramos qué decisiones soporta la evidencia actual. Después, el registro explica qué fuente funciona, cuál limita y qué acción la desbloquea."
            : "First, show which decisions the current evidence supports. Then use the register to explain which source works, which limits the decision and what unlocks it."}</p>
        </div>
        <div className="sourceHealthTotals" aria-label={es ? "Resumen de fuentes" : "Source summary"}>
          <div><strong>{counts.operational}</strong><span>{es ? "operativas" : "operational"}</span></div>
          <div><strong>{counts.degraded}</strong><span>{es ? "degradada" : "degraded"}</span></div>
          <div><strong>{counts.action}</strong><span>{es ? "requieren acción" : "need action"}</span></div>
        </div>
      </div>

      {!compact ? (
        <section className="decisionReliability" aria-labelledby="decision-reliability-title">
          <div className="decisionReliabilityHead">
            <div>
              <div className="eyebrow">{es ? "FIABILIDAD DE DECISIÓN" : "DECISION RELIABILITY"}</div>
              <h3 id="decision-reliability-title">{es ? "Qué puede decidir el club con la evidencia disponible hoy" : "What the club can decide with the evidence available today"}</h3>
              <p>{es ? "El estado de una fuente solo importa en la medida en que cambia una decisión. Esta capa traduce salud técnica a riesgo operativo." : "A source state only matters when it changes a decision. This layer translates technical health into operational risk."}</p>
            </div>
            <div className="decisionReliabilityTotals">
              <div><strong>{decisionCounts.reliable}</strong><span>{es ? "listas" : "ready"}</span></div>
              <div><strong>{decisionCounts.qualified}</strong><span>{es ? "con matices" : "qualified"}</span></div>
              <div><strong>{decisionCounts.blocked + decisionCounts["access-limited"]}</strong><span>{es ? "limitadas" : "limited"}</span></div>
            </div>
          </div>

          <div className="decisionReliabilityGrid">
            {data.decisions.map((decision) => {
              const state = decisionReliabilityState(data, decision);
              const requiredSources = decision.requiredSourceIds.map((id) => data.sources.find((source) => source.id === id)).filter(Boolean);
              const supportingSources = decision.supportingSourceIds.map((id) => data.sources.find((source) => source.id === id)).filter(Boolean);
              const limitingSources = [...requiredSources, ...supportingSources].filter((source) => source && source.state !== "operational");
              return <article key={decision.id} className={`reliability-${state}`}>
                <div><span>{reliabilityLabels[state][lang]}</span><Link href={decision.route}>{es ? "Abrir decisión" : "Open decision"} →</Link></div>
                <h4>{decision.label[lang]}</h4>
                <p>{decision.question[lang]}</p>
                <dl>
                  <div><dt>{es ? "Fuentes críticas" : "Critical sources"}</dt><dd>{requiredSources.length}</dd></div>
                  <div><dt>{es ? "Limitantes" : "Limiting"}</dt><dd>{limitingSources.length}</dd></div>
                </dl>
                {limitingSources.length ? <div className="decisionReliabilityLimits">{limitingSources.map((source) => <span key={source!.id}>{source!.label[lang]} · {stateLabels[source!.state][lang]}</span>)}</div> : <div className="decisionReliabilityLimits clear"><span>{es ? "Sin bloqueos de fuente declarados" : "No declared source blockers"}</span></div>}
                <small>{decision.nextAction[lang]}</small>
              </article>;
            })}
          </div>
        </section>
      ) : null}

      {!compact ? <div className="sourceRegisterHeading"><div><span>02</span><h3>{es ? "Registro técnico de fuentes" : "Technical source register"}</h3></div><p>{es ? "Detalle para diagnosticar disponibilidad, método y siguiente acción." : "Detail for diagnosing availability, method and next action."}</p></div> : null}

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
