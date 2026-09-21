"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";
import type { ExperimentMeasurementData } from "@/lib/models";

type RuntimeStatus = {
  mode: "test" | "production";
  ingestConfigured: boolean;
  summaryConfigured: boolean;
  maximumRetentionDays: number;
  minimumAggregateCohort: number;
};

type Cohort = ExperimentMeasurementData["cohorts"][number];

export function MeasurementDashboard({ data }: { data: ExperimentMeasurementData }) {
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

      <section className="measurementCohorts">
        <div className="measurementSectionHead"><div><span>01</span><h2>{es ? "Cola de decisiones por partido" : "Fixture decision queue"}</h2></div><p>{es ? "Cada cohorte muestra qué se puede hacer ahora, no solo cuántos eventos existen." : "Each cohort shows what can be done now, not just how many events exist."}</p></div>
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
        <div className="measurementSectionHead"><div><span>02</span><h2>{es ? "Cómo una interacción se convierte en evidencia" : "How an interaction becomes evidence"}</h2></div></div>
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
          <div className="measurementSectionHead"><div><span>03</span><h2>{es ? "Catálogo de eventos" : "Event catalogue"}</h2></div><p>{es ? "Cada evento rechaza cualquier propiedad no declarada." : "Every event rejects any undeclared property."}</p></div>
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
