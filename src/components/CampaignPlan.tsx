"use client";

import { useLanguage } from "./LanguageProvider";
import type { CampaignPlan as CampaignPlanData, LiveSignal } from "@/lib/models";

function stateLabel(state: string, es: boolean) {
  const labels: Record<string, { en: string; es: string }> = {
    draft: { en: "Draft", es: "Borrador" },
    briefed: { en: "Briefed", es: "Briefing listo" },
    complete: { en: "Complete", es: "Completo" },
    ready: { en: "Ready", es: "Listo" },
    planned: { en: "Planned", es: "Planificado" },
    "requires-approval": { en: "Requires approval", es: "Requiere aprobación" },
    "requires-partner": { en: "Requires partner", es: "Requiere partner" },
    "requires-instrumentation": { en: "Requires instrumentation", es: "Requiere instrumentación" },
    "requires-access": { en: "Requires access", es: "Requiere acceso" },
    "public-inferred": { en: "Public inferred", es: "Inferido públicamente" },
    "public-measurable": { en: "Public measurable", es: "Medible públicamente" },
    "pending-source": { en: "Pending source", es: "Fuente pendiente" }
  };
  return labels[state]?.[es ? "es" : "en"] ?? state.replaceAll("-", " ");
}

function displayDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

export function CampaignPlan({ data, signals, embedded = false }: { data: CampaignPlanData; signals: LiveSignal[]; embedded?: boolean }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const evidence = data.triggerSignalIds.flatMap((id) => {
    const signal = signals.find((item) => item.id === id);
    return signal ? [signal] : [];
  });
  const approvalReady = data.approvals.filter((item) => item.state === "ready").length;

  const content = (
    <>
      <div className="campaignTop">
        <div>
          <div className="eyebrow">SIGNAL → CAMPAIGN</div>
          <h2 id={`campaign-${data.id}`}>{data.title[lang]}</h2>
          <p>{data.objective[lang]}</p>
        </div>
        <div className="campaignState">
          <span>{es ? "ESTADO" : "STATUS"}</span>
          <strong>{stateLabel(data.status, es)}</strong>
          <small>{es ? "No está publicada ni tiene inversión autorizada" : "Not published and no spend is authorised"}</small>
        </div>
      </div>

      <div className="campaignWhy">
        <span>{es ? "POR QUÉ AHORA" : "WHY NOW"}</span>
        <strong>{data.whyNow[lang]}</strong>
      </div>

      <div className="campaignCore">
        <article><span>{es ? "AUDIENCIAS" : "AUDIENCES"}</span>{data.audiences.map((audience) => <div key={audience.id}><strong>{audience.label[lang]}</strong><small>{stateLabel(audience.state, es)}</small></div>)}</article>
        <article><span>{es ? "PROPUESTA" : "PROPOSITION"}</span><strong>{data.proposition[lang]}</strong><blockquote>“{data.message[lang]}”</blockquote></article>
        <article><span>{es ? "OFERTA" : "OFFER"}</span><strong>{data.offer.description[lang]}</strong><small>{stateLabel(data.offer.state, es)}</small></article>
      </div>

      <section className="campaignActivations">
        <div className="campaignSectionHead"><div><span>{es ? "ACTIVACIONES" : "ACTIVATIONS"}</span><h3>{es ? "Del playbook a la pieza" : "From playbook to asset"}</h3></div><small>{data.activations.length} {es ? "briefs coordinados" : "coordinated briefs"}</small></div>
        <div className="campaignActivationGrid">
          {data.activations.map((activation) => (
            <article key={activation.id} className={activation.state}>
              <div><span>{activation.playbookId}</span><b>{stateLabel(activation.state, es)}</b></div>
              <h4>{activation.title[lang]}</h4>
              <p>{activation.role[lang]}</p>
              <dl><dt>{es ? "Canal" : "Channel"}</dt><dd>{activation.channel}</dd><dt>Asset</dt><dd>{activation.asset[lang]}</dd><dt>UTM</dt><dd>{data.utmCampaign} / {activation.utmSource} / {activation.utmMedium} / {activation.utmContent}</dd></dl>
              <small>{es ? "IDs de atribución" : "Attribution IDs"}: {activation.trackingCampaignIds.join(" · ")}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="campaignOperations">
        <section>
          <div className="campaignSectionHead"><div><span>{es ? "CALENDARIO" : "SCHEDULE"}</span><h3>{es ? "Ventanas de ejecución" : "Execution windows"}</h3></div></div>
          <div className="campaignSchedule">{data.schedule.map((item) => <article className={item.state} key={item.window}><div><strong>{item.window}</strong><time>{displayDate(item.date, locale)}</time></div><p>{item.action[lang]}</p><small>{stateLabel(item.state, es)}</small></article>)}</div>
        </section>
        <section>
          <div className="campaignSectionHead"><div><span>{es ? "MIX RECOMENDADO" : "RECOMMENDED MIX"}</span><h3>{es ? "Distribución, no autorización" : "Allocation, not authorisation"}</h3></div></div>
          <div className="campaignBudget">{data.budgetMix.map((item) => <div key={item.channel}><span><strong>{item.channel}</strong><b>{item.share}%</b></span><i><em style={{ width: `${item.share}%` }} /></i></div>)}</div>
        </section>
      </div>

      <section className="campaignMeasurement">
        <div className="campaignSectionHead"><div><span>{es ? "MEDICIÓN" : "MEASUREMENT"}</span><h3>{es ? "Qué podremos cerrar y qué seguirá pendiente" : "What can close and what remains pending"}</h3></div></div>
        <div>{data.measurement.map((item) => <article className={item.state} key={item.id}><span>{stateLabel(item.state, es)}</span><strong>{item.label[lang]}</strong><small>{item.target[lang]}</small></article>)}</div>
      </section>

      <section className="campaignEvidence">
        <div>
          <span>{es ? "SEÑALES DE ORIGEN" : "SOURCE SIGNALS"}</span>
          {evidence.map((signal) => <a href={signal.sourceUrl} target="_blank" rel="noreferrer" key={signal.id}><strong>{signal.title[lang]}</strong><small>{signal.sourceName} · {signal.state}</small></a>)}
        </div>
        <div>
          <span>{es ? "APROBACIONES" : "APPROVALS"}</span>
          <strong className="approvalCount">{approvalReady}/{data.approvals.length} {es ? "listas" : "ready"}</strong>
          {data.approvals.map((item) => <p key={item.id}><b>{item.label[lang]}</b><small>{stateLabel(item.state, es)}</small></p>)}
        </div>
      </section>

      <div className="campaignNextApproval"><span>{es ? "SIGUIENTE APROBACIÓN" : "NEXT APPROVAL"}</span><strong>{data.nextApproval[lang]}</strong></div>
      <details className="campaignGuardrails"><summary>{es ? "Guardrails antes de activar" : "Guardrails before activation"}</summary>{data.guardrails.map((item) => <p key={item.en}>{item[lang]}</p>)}</details>
    </>
  );

  if (embedded) {
    return <details className="campaignPlan embedded"><summary><span>SIGNAL → CAMPAIGN</span><strong>{data.title[lang]}</strong><b>{stateLabel(data.status, es)}</b></summary><div className="campaignEmbeddedBody">{content}</div></details>;
  }
  return <section className="campaignPlan" aria-labelledby={`campaign-${data.id}`}>{content}</section>;
}
