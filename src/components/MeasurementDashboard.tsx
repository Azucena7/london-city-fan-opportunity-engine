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

  function stateLabel(state: string) {
    const labels: Record<string, { en: string; es: string }> = {
      "not-instrumented": { en: "not instrumented", es: "sin instrumentar" },
      "insufficient-sample": { en: "insufficient sample", es: "muestra insuficiente" },
      "threshold-met": { en: "threshold met", es: "umbral alcanzado" }
    };
    return labels[state]?.[lang] ?? state.replaceAll("-", " ");
  }

  return (
    <main className="measurementPage">
      <NavTabs />
      <section className="measurementHero">
        <div>
          <div className="eyebrow">EXPERIMENT MEASUREMENT LAYER · V1.8</div>
          <h1>{data.headline[lang]}</h1>
          <p>{data.principle[lang]}</p>
          <div className="measurementRuntime"><span>{runtime?.ingestConfigured ? (es ? "ENTREGA CONFIGURADA" : "DELIVERY CONFIGURED") : (es ? "PROVEEDOR NO CONFIGURADO" : "PROVIDER NOT CONFIGURED")}</span><strong>{runtime ? `${runtime.mode} · ${summaryState.replaceAll("-", " ")}` : (es ? "comprobando runtime" : "checking runtime")}</strong></div>
        </div>
        <div className="measurementHeroMetric"><span>{es ? "COHORTES SUFICIENTES" : "SUFFICIENT COHORTS"}</span><strong>{thresholdMet}/{data.experiments.length}</strong><small>{es ? `mínimo ${data.minimumAggregateCohort} eventos válidos` : `minimum ${data.minimumAggregateCohort} valid events`}</small></div>
      </section>

      <section className="measurementFlow">
        <div className="measurementSectionHead"><div><span>01</span><h2>{es ? "De interacción a evidencia gobernada" : "From interaction to governed evidence"}</h2></div></div>
        <div>{[
          [es ? "Evento" : "Event", es ? "Allowlist y esquema" : "Allowlist and schema"],
          [es ? "Entrega" : "Delivery", es ? "Proveedor explícito" : "Explicit provider"],
          [es ? "Calidad" : "Quality", es ? "Prueba, deduplicación y fixture" : "Test, deduplication and fixture"],
          [es ? "Agregación" : "Aggregation", `${data.minimumAggregateCohort}+ ${es ? "eventos" : "events"}`],
          [es ? "Decisión" : "Decision", es ? "Revisar, no lanzar" : "Review, not launch"]
        ].map(([title, detail], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{detail}</small></article>)}</div>
      </section>

      <section className="measurementCohorts">
        <div className="measurementSectionHead"><div><span>02</span><h2>{es ? "Cohortes por partido" : "Fixture cohorts"}</h2></div><p>{es ? "Un valor ausente es null, nunca cero. Las pruebas internas quedan fuera." : "An unavailable value is null, never zero. Internal tests remain excluded."}</p></div>
        <div className="measurementCohortGrid">
          {data.experiments.map((experiment) => {
            const cohort = cohorts.find((item) => item.fixtureId === experiment.fixtureId) ?? data.cohorts.find((item) => item.fixtureId === experiment.fixtureId)!;
            return <article key={experiment.id} className={cohort.state}><div><span>{stateLabel(cohort.state)}</span><b>{cohort.sampleSize ?? "—"}</b></div><strong>{experiment.label[lang]}</strong><p>{experiment.objective[lang]}</p><dl><div><dt>{es ? "Interés transporte" : "Transport interest"}</dt><dd>{cohort.transportInterestCount ?? "—"}</dd></div><div><dt>{es ? "Escenarios movilidad" : "Mobility scenarios"}</dt><dd>{cohort.mobilityScenarioCount ?? "—"}</dd></div></dl></article>;
          })}
        </div>
      </section>

      <section className="measurementEvents">
        <div className="measurementSectionHead"><div><span>03</span><h2>{es ? "Catálogo de eventos" : "Event catalogue"}</h2></div><p>{es ? "Cada evento rechaza cualquier propiedad no declarada." : "Every event rejects any undeclared property."}</p></div>
        <div className="measurementEventGrid">{data.events.map((event) => <article key={event.name}><span>{event.source} · {event.state}</span><strong>{event.label[lang]}</strong><code>{event.name}</code><p>{event.allowedProperties.join(" · ")}</p></article>)}</div>
      </section>

      <section className="measurementProvider">
        <div><div className="eyebrow">RUNTIME</div><h2>{es ? "Preparado para un proveedor, sin inventarlo" : "Provider-ready without pretending one exists"}</h2><p>{es ? "Las credenciales solo viven en el entorno de despliegue. El repositorio contiene nombres de variables, contratos y validación, nunca secretos." : "Credentials live only in the deployment environment. The repository contains variable names, contracts and validation—never secrets."}</p></div>
        <div className="measurementProviderGrid"><article><span>INGEST</span><strong>{runtime?.ingestConfigured ? (es ? "configurado" : "configured") : (es ? "pendiente" : "pending")}</strong><code>{data.provider.ingestEnvironmentVariable}</code></article><article><span>SUMMARY</span><strong>{runtime?.summaryConfigured ? (es ? "configurado" : "configured") : (es ? "pendiente" : "pending")}</strong><code>{data.provider.summaryEnvironmentVariable}</code></article><article><span>MODE</span><strong>{runtime?.mode ?? data.provider.defaultMode}</strong><code>{data.provider.modeEnvironmentVariable}</code></article><article><span>RETENTION CAP</span><strong>{data.provider.maximumRetentionDays} {es ? "días" : "days"}</strong><code>{data.provider.secretEnvironmentVariable}</code></article></div>
      </section>

      <section className="measurementRules">
        <div><div className="eyebrow">QUALITY RULES</div>{data.qualityRules.map((rule) => <p key={rule.id}><span>✓</span>{rule.text[lang]}</p>)}</div>
        <div><div className="eyebrow">GUARDRAILS</div>{data.guardrails.map((rule) => <p key={rule.id}><span>—</span>{rule.text[lang]}</p>)}</div>
      </section>

      <section className="measurementActions"><div><h2>{es ? "Probar las dos fuentes de señal" : "Test both signal sources"}</h2><p>{es ? "Las interacciones serán locales hasta configurar un proveedor aprobado." : "Interactions remain local until an approved provider is configured."}</p></div><div><Link href="/experience">{es ? "Abrir Experience" : "Open Experience"}</Link><Link href="/access#partner">{es ? "Abrir Mobility" : "Open Mobility"}</Link><Link href="/partners">{es ? "Abrir Partner Pack" : "Open Partner Pack"}</Link><a href="/api/contracts/experiment-measurement" target="_blank">{es ? "Ver contrato" : "View contract"} ↗</a></div></section>
    </main>
  );
}
