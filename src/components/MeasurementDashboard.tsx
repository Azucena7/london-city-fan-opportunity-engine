"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";
import type { DecisionValidationData, ExperimentMeasurementData } from "@/lib/models";

type RuntimeStatus = {
  mode: "test" | "production";
  ingestConfigured: boolean;
  summaryConfigured: boolean;
  maximumRetentionDays: number;
  minimumAggregateCohort: number;
};

type Cohort = ExperimentMeasurementData["cohorts"][number];

export function MeasurementDashboard({ data, validation }: { data: ExperimentMeasurementData; validation: DecisionValidationData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [summaryState, setSummaryState] = useState("loading");
  const [cohorts, setCohorts] = useState<Cohort[]>(data.cohorts);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/measurement/status", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/measurement/summary", { cache: "no-store" }).then((response) => response.json())
    ]).then(([statusResult, summaryResult]) => {
      if (!active) return;
      setRuntime(statusResult as RuntimeStatus);
      setSummaryState(String(summaryResult.state ?? "source-unavailable"));
      if (Array.isArray(summaryResult.cohorts)) setCohorts(summaryResult.cohorts as Cohort[]);
    }).catch(() => {
      if (active) setSummaryState("source-unavailable");
    });
    return () => { active = false; };
  }, []);

  const thresholdMet = useMemo(() => cohorts.filter((item) => item.state === "threshold-met").length, [cohorts]);
  const insufficient = useMemo(() => cohorts.filter((item) => item.state === "insufficient-sample").length, [cohorts]);
  const notInstrumented = useMemo(() => cohorts.filter((item) => item.state === "not-instrumented").length, [cohorts]);
  const providerReady = Boolean(runtime?.ingestConfigured && runtime?.summaryConfigured);
  const validationCase = validation.cases[0];
  const alignedDimensions = validationCase?.dimensions.filter((item) => item.state === "aligned").length ?? 0;
  const partialDimensions = validationCase?.dimensions.filter((item) => item.state === "partial").length ?? 0;

  function validationDate(value: string) {
    return new Intl.DateTimeFormat(es ? "es-ES" : "en-GB", { day: "numeric", month: "short", year: "numeric" })
      .format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
  }

  function alignmentLabel(state: DecisionValidationData["cases"][number]["alignment"]) {
    if (state === "aligned") return es ? "Alineación observada" : "Observed alignment";
    if (state === "partial") return es ? "Alineación parcial" : "Partial alignment";
    if (state === "divergent") return es ? "Divergencia" : "Divergent";
    return es ? "No observable" : "Not observable";
  }

  function stateLabel(state: string) {
    const labels: Record<string, { en: string; es: string }> = {
      "not-instrumented": { en: "not instrumented", es: "sin instrumentar" },
      "insufficient-sample": { en: "insufficient sample", es: "muestra insuficiente" },
      "threshold-met": { en: "threshold met", es: "umbral alcanzado" }
    };
    return labels[state]?.[lang] ?? state.replaceAll("-", " ");
  }

  function decisionLabel(state: string) {
    if (state === "threshold-met") return es ? "Revisar la hipótesis" : "Review hypothesis";
    if (state === "insufficient-sample") return es ? "Seguir midiendo" : "Keep measuring";
    return es ? "Instrumentar antes de decidir" : "Instrument before deciding";
  }

  return (
    <main className="measurementPage">
      <NavTabs />
      <section className="measurementHero">
        <div>
          <div className="eyebrow">{es ? "CONTROL DE EVIDENCIA" : "EVIDENCE CONTROL ROOM"}</div>
          <h1>{es ? "¿Tenemos evidencia suficiente para tomar la siguiente decisión?" : "Do we have enough evidence to make the next decision?"}</h1>
          <p>{es ? "La medición no es un panel técnico: es el punto de control que separa una señal interesante de una decisión defendible." : "Measurement is not a technical dashboard: it is the control point separating an interesting signal from a defensible decision."}</p>
          <div className="measurementRuntime"><span>{providerReady ? (es ? "RUNTIME PREPARADO" : "RUNTIME READY") : (es ? "RUNTIME INCOMPLETO" : "RUNTIME INCOMPLETE")}</span><strong>{runtime ? `${runtime.mode} · ${summaryState.replaceAll("-", " ")}` : (es ? "comprobando runtime" : "checking runtime")}</strong></div>
        </div>
        <div className="measurementHeroMetric"><span>{es ? "COHORTES DECIDIBLES" : "DECISION-READY COHORTS"}</span><strong>{thresholdMet}/{data.experiments.length}</strong><small>{es ? `mínimo ${data.minimumAggregateCohort} eventos válidos` : `minimum ${data.minimumAggregateCohort} valid events`}</small></div>
      </section>

      <section className="measurementControlStrip" aria-label={es ? "Estado de decisión" : "Decision status"}>
        <article><span>{es ? "LISTAS PARA REVISIÓN" : "READY TO REVIEW"}</span><strong>{thresholdMet}</strong><small>{es ? "cohortes con umbral" : "cohorts above threshold"}</small></article>
        <article><span>{es ? "SEGUIR MIDIENDO" : "KEEP MEASURING"}</span><strong>{insufficient}</strong><small>{es ? "muestra insuficiente" : "insufficient sample"}</small></article>
        <article><span>{es ? "BLOQUEADAS" : "BLOCKED"}</span><strong>{notInstrumented}</strong><small>{es ? "sin instrumentación" : "not instrumented"}</small></article>
        <article className={providerReady ? "ready" : "waiting"}><span>{es ? "PROVEEDOR" : "PROVIDER"}</span><strong>{providerReady ? (es ? "listo" : "ready") : (es ? "pendiente" : "pending")}</strong><small>{es ? "ingest + summary" : "ingest + summary"}</small></article>
      </section>

      {validationCase ? (
        <section className="decisionValidation" aria-labelledby="decision-validation-title">
          <div className="measurementSectionHead">
            <div><span>01</span><h2 id="decision-validation-title">{es ? "Hipótesis del engine vs realidad observable" : "Engine hypothesis vs observable reality"}</h2></div>
            <p>{validation.principle[lang]}</p>
          </div>

          <div className="decisionValidationHeadline">
            <div>
              <div className="eyebrow">{es ? "REALITY CHECK" : "REALITY CHECK"}</div>
              <h3>{es ? "¿Apareció después en el mercado una oportunidad que el engine ya había identificado?" : "Did an opportunity the engine surfaced later appear in market action?"}</h3>
              <p>{validationCase.title[lang]}</p>
            </div>
            <div className="decisionValidationState">
              <span>{alignmentLabel(validationCase.alignment)}</span>
              <strong>{alignedDimensions} {es ? "alineadas" : "aligned"} · {partialDimensions} {es ? "parcial" : "partial"}</strong>
              <small>{es ? "sobre elementos observables, no causalidad" : "across observable elements, not causation"}</small>
            </div>
          </div>

          <div className="decisionValidationTimeline">
            <article className="engine">
              <div><span>{es ? "HIPÓTESIS DEL ENGINE" : "ENGINE HYPOTHESIS"}</span><time>{validationDate(validationCase.hypothesisGeneratedAt)}</time></div>
              <strong>{validationCase.hypothesis[lang]}</strong>
              <small>{validationCase.hypothesisSource.name}</small>
            </article>
            <div className="decisionValidationArrow" aria-hidden="true">→</div>
            <article className="observed">
              <div><span>{es ? "ACCIÓN OBSERVADA" : "OBSERVED CLUB ACTION"}</span><time>{validationDate(validationCase.observedAt)}</time></div>
              <strong>{validationCase.observedAction[lang]}</strong>
              <a href={validationCase.observedSource.url} target="_blank" rel="noreferrer">{validationCase.observedSource.name} ↗</a>
            </article>
          </div>

          {validationCase.liveValidation ? (
            <div className="liveValidation">
              <div className="liveValidationHead"><span>{es ? "BRIGHTON LIVE VALIDATION" : "BRIGHTON LIVE VALIDATION"}</span><strong>{validationCase.liveValidation.state.replaceAll("-", " ")}</strong><small>{validationCase.liveValidation.principle[lang]}</small></div>
              <div className="liveValidationPhases">
                {validationCase.liveValidation.phases.map((phase) => <article key={phase.id} className={phase.state}>
                  <div><span>{phase.state}</span><time>{validationDate(phase.date)}</time></div>
                  <strong>{phase.label[lang]}</strong>
                  <small>{phase.observed[lang]}</small>
                </article>)}
              </div>
              <div className="liveValidationChecklist">
                {validationCase.liveValidation.postMatchChecklist.map((item) => <span className={item.state} key={item.id}>{
                  item.state === "complete" ? "✓" : item.state === "requires-club-access" ? "🔒" : "○"
                } {item.label[lang]}</span>)}
              </div>
            </div>
          ) : null}

          <div className="decisionValidationDimensions">
            {validationCase.dimensions.map((dimension) => (
              <article key={dimension.id} className={dimension.state}>
                <span>{dimension.state === "aligned" ? "✓" : dimension.state === "partial" ? "≈" : dimension.state === "divergent" ? "↯" : "—"} {dimension.state.replaceAll("-", " ")}</span>
                <strong>{dimension.label[lang]}</strong>
                <small>{dimension.note[lang]}</small>
              </article>
            ))}
          </div>

          <div className="decisionValidationCaveat">
            <div><span>{es ? "LÍMITE DE INTERPRETACIÓN" : "INTERPRETATION LIMIT"}</span><strong>{validationCase.caveat[lang]}</strong></div>
            <div><span>{es ? "QUÉ APRENDEMOS" : "WHAT WE LEARN NEXT"}</span><strong>{validationCase.learning[lang]}</strong></div>
          </div>
        </section>
      ) : null}

      <section className="measurementCohorts">
        <div className="measurementSectionHead"><div><span>02</span><h2>{es ? "Cola de decisiones por partido" : "Fixture decision queue"}</h2></div><p>{es ? "Cada cohorte muestra qué se puede hacer ahora, no solo cuántos eventos existen." : "Each cohort shows what can be done now, not just how many events exist."}</p></div>
        <div className="measurementCohortGrid">
          {data.experiments.map((experiment) => {
            const cohort = cohorts.find((item) => item.fixtureId === experiment.fixtureId) ?? data.cohorts.find((item) => item.fixtureId === experiment.fixtureId)!;
            return <article key={experiment.id} className={cohort.state}>
              <div><span>{stateLabel(cohort.state)}</span><b>{cohort.sampleSize ?? "—"}</b></div>
              <strong>{experiment.label[lang]}</strong>
              <p>{experiment.objective[lang]}</p>
              <div className="measurementDecision"><span>{es ? "SIGUIENTE DECISIÓN" : "NEXT DECISION"}</span><b>{decisionLabel(cohort.state)}</b></div>
              <dl><div><dt>{es ? "Interés transporte" : "Transport interest"}</dt><dd>{cohort.transportInterestCount ?? "—"}</dd></div><div><dt>{es ? "Escenarios movilidad" : "Mobility scenarios"}</dt><dd>{cohort.mobilityScenarioCount ?? "—"}</dd></div></dl>
            </article>;
          })}
        </div>
      </section>

      <section className="measurementFlow">
        <div className="measurementSectionHead"><div><span>03</span><h2>{es ? "Cómo una interacción se convierte en evidencia" : "How an interaction becomes evidence"}</h2></div></div>
        <div>{[
          [es ? "Evento" : "Event", es ? "Allowlist y esquema" : "Allowlist and schema"],
          [es ? "Entrega" : "Delivery", es ? "Proveedor explícito" : "Explicit provider"],
          [es ? "Calidad" : "Quality", es ? "Prueba, deduplicación y fixture" : "Test, deduplication and fixture"],
          [es ? "Agregación" : "Aggregation", `${data.minimumAggregateCohort}+ ${es ? "eventos" : "events"}`],
          [es ? "Decisión" : "Decision", es ? "Revisar, no lanzar automáticamente" : "Review, never auto-launch"]
        ].map(([title, detail], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{detail}</small></article>)}</div>
      </section>

      <details className="measurementTechnical">
        <summary>{es ? "Ver detalle técnico de instrumentación" : "View technical instrumentation detail"}</summary>
        <section className="measurementEvents">
          <div className="measurementSectionHead"><div><span>04</span><h2>{es ? "Catálogo de eventos" : "Event catalogue"}</h2></div><p>{es ? "Cada evento rechaza cualquier propiedad no declarada." : "Every event rejects any undeclared property."}</p></div>
          <div className="measurementEventGrid">{data.events.map((event) => <article key={event.name}><span>{event.source} · {event.state}</span><strong>{event.label[lang]}</strong><code>{event.name}</code><p>{event.allowedProperties.join(" · ")}</p></article>)}</div>
        </section>

        <section className="measurementProvider">
          <div><div className="eyebrow">RUNTIME</div><h2>{es ? "Preparado para un proveedor, sin inventarlo" : "Provider-ready without pretending one exists"}</h2><p>{es ? "Las credenciales solo viven en el entorno de despliegue. El repositorio contiene nombres de variables, contratos y validación, nunca secretos." : "Credentials live only in the deployment environment. The repository contains variable names, contracts and validation—never secrets."}</p></div>
          <div className="measurementProviderGrid"><article><span>INGEST</span><strong>{runtime?.ingestConfigured ? (es ? "configurado" : "configured") : (es ? "pendiente" : "pending")}</strong><code>{data.provider.ingestEnvironmentVariable}</code></article><article><span>SUMMARY</span><strong>{runtime?.summaryConfigured ? (es ? "configurado" : "configured") : (es ? "pendiente" : "pending")}</strong><code>{data.provider.summaryEnvironmentVariable}</code></article><article><span>MODE</span><strong>{runtime?.mode ?? data.provider.defaultMode}</strong><code>{data.provider.modeEnvironmentVariable}</code></article><article><span>RETENTION CAP</span><strong>{data.provider.maximumRetentionDays} {es ? "días" : "days"}</strong><code>{data.provider.secretEnvironmentVariable}</code></article></div>
        </section>
      </details>

      <section className="measurementRules">
        <div><div className="eyebrow">QUALITY RULES</div>{data.qualityRules.map((rule) => <p key={rule.id}><span>✓</span>{rule.text[lang]}</p>)}</div>
        <div><div className="eyebrow">GUARDRAILS</div>{data.guardrails.map((rule) => <p key={rule.id}><span>—</span>{rule.text[lang]}</p>)}</div>
      </section>

      <section className="measurementActions"><div><h2>{es ? "Volver a las superficies que generan la señal" : "Return to the surfaces generating the signal"}</h2><p>{es ? "La medición informa la decisión; no sustituye el juicio del equipo." : "Measurement informs the decision; it does not replace team judgement."}</p></div><div><Link href="/experience">{es ? "Experiencia del aficionado" : "Fan Experience"}</Link><Link href="/access#partner">{es ? "Acceso al partido" : "Matchday Access"}</Link><Link href="/partners">{es ? "Partnerships" : "Partnerships"}</Link><a href="/api/contracts/experiment-measurement" target="_blank">{es ? "Contrato técnico" : "Technical contract"} ↗</a></div></section>
    </main>
  );
}
