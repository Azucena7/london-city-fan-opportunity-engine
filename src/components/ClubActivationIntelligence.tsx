"use client";

import { useLanguage } from "./LanguageProvider";
import type { ActivationAlignment, ClubActivationDataset } from "@/lib/models";

const channelLabel = {
  website: { en: "Website", es: "Web" },
  ticketing: { en: "Ticketing", es: "Ticketing" },
  instagram: { en: "Instagram", es: "Instagram" },
  news: { en: "Newsroom", es: "Noticias" },
  matchday: { en: "Matchday", es: "Matchday" },
  partner: { en: "Partner", es: "Partner" }
};

const statusLabel: Record<ActivationAlignment["status"], { en: string; es: string }> = {
  deployed: { en: "Deployed", es: "Desplegada" },
  "partially-observed": { en: "Partially observed", es: "Observada parcialmente" },
  "not-publicly-observed": { en: "Not publicly observed", es: "No observada públicamente" },
  "cannot-verify": { en: "Cannot verify", es: "No verificable" }
};

export function ClubActivationIntelligence({ data }: { data: ClubActivationDataset }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const key = es ? "es" : "en";
  const current = data.observations.filter((item) => item.fixtureId === data.fixtureId);
  const comparison = data.observations.filter((item) => item.fixtureId === data.comparisonFixtureId);
  const covered = data.coverage.filter((item) => item.state === "covered").length;
  const stages = new Set(current.map((item) => item.funnelStage)).size;

  return (
    <section className="activationIntelligence" aria-labelledby="activation-title">
      <div className="activationHeader">
        <div>
          <div className="eyebrow">{es ? "INTELIGENCIA DE ACTIVACIONES" : "CLUB ACTIVATION INTELLIGENCE"}</div>
          <h3 id="activation-title">{es ? "Qué está haciendo el club — y qué parece perseguir" : "What the club is doing — and what it appears to pursue"}</h3>
          <p>{es
            ? "Evidencia pública de Brighton comparada con el opener. Las hipótesis interpretan señales; no sustituyen datos internos."
            : "Public Brighton evidence compared with the opener. Hypotheses interpret signals; they do not replace internal data."}</p>
        </div>
        <div className="activationKpis">
          <div><strong>{current.length}</strong><span>{es ? "acciones Brighton" : "Brighton actions"}</span></div>
          <div><strong>{stages}</strong><span>{es ? "etapas del funnel" : "funnel stages"}</span></div>
          <div><strong>{covered}/{data.coverage.length}</strong><span>{es ? "canales cubiertos" : "channels covered"}</span></div>
        </div>
      </div>

      <div className="coverageStrip" aria-label={es ? "Cobertura de fuentes" : "Source coverage"}>
        {data.coverage.map((item) => (
          <span className={`coverageState ${item.state}`} title={item.note[key]} key={item.channel}>
            <i aria-hidden="true" />{channelLabel[item.channel][key]} · {item.state === "covered" ? (es ? "cubierto" : "covered") : item.state === "partial" ? (es ? "parcial" : "partial") : (es ? "no disponible" : "unavailable")}
          </span>
        ))}
      </div>

      <div className="activationColumns">
        <div>
          <div className="activationSectionTitle"><strong>{es ? "Brighton · evidencia observada" : "Brighton · observed evidence"}</strong><span>{es ? "comparada con Manchester United" : "compared with Manchester United"}</span></div>
          <div className="activationTimeline">
            {current.map((item) => (
              <article key={item.id}>
                <div className="activationWhen"><strong>{item.window}</strong><span>{channelLabel[item.channel][key]}</span></div>
                <div>
                  <h4>{item.title[key]}</h4>
                  <p>{item.messageAngle[key]}</p>
                  <div className="activationMeta"><span>{item.product[key]}</span><span>{item.audience[key]}</span></div>
                </div>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">{es ? "Evidencia ↗" : "Evidence ↗"}</a>
              </article>
            ))}
          </div>
          <details className="comparisonEvidence">
            <summary>{es ? `Ver ${comparison.length} activaciones del opener usadas como comparación` : `View ${comparison.length} opener activations used for comparison`}</summary>
            {comparison.map((item) => (
              <div key={item.id}><strong>{item.window} · {item.title[key]}</strong><span>{item.messageAngle[key]}</span><a href={item.sourceUrl} target="_blank" rel="noreferrer">↗</a></div>
            ))}
          </details>
        </div>

        <aside className="strategyPanel">
          <div className="activationSectionTitle"><strong>{es ? "Hipótesis de estrategia" : "Strategy hypotheses"}</strong><span>{es ? "basadas en evidencia pública" : "based on public evidence"}</span></div>
          {data.hypotheses.map((item) => (
            <article key={item.id}>
              <div><span className={`confidence ${item.confidence}`}>{es ? "confianza" : "confidence"} · {item.confidence}</span><small>{item.evidenceIds.length} {es ? "evidencias" : "evidence points"}</small></div>
              <h4>{item.title[key]}</h4>
              <p>{item.rationale[key]}</p>
            </article>
          ))}
        </aside>
      </div>

      <div className="alignmentPanel">
        <div className="activationSectionTitle"><strong>{es ? "Engine frente a ejecución pública" : "Engine versus public execution"}</strong><span>{es ? "ausencia pública no significa ausencia real" : "public absence does not mean actual absence"}</span></div>
        <div className="alignmentRows">
          {data.alignment.map((item) => (
            <article key={item.id}>
              <span className={`alignmentStatus ${item.status}`}>{statusLabel[item.status][key]}</span>
              <div><small>{es ? "RECOMENDACIÓN" : "RECOMMENDATION"}</small><strong>{item.recommendation[key]}</strong></div>
              <div><small>{es ? "OBSERVADO" : "OBSERVED"}</small><p>{item.observed[key]}</p></div>
            </article>
          ))}
        </div>
      </div>

      <p className="activationMethod">{es
        ? `Snapshot público comprobado el ${new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(data.checkedAt))}. No incluye email, inversión publicitaria, segmentación CRM ni conversión privada.`
        : `Public snapshot checked ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(data.checkedAt))}. It excludes email, paid-media spend, CRM segmentation and private conversion.`}</p>
    </section>
  );
}
