"use client";

import { useLanguage } from "./LanguageProvider";
import type { PostMatchEvidenceState, PostMatchScorecard as ScorecardData } from "@/lib/models";

function evidenceLabel(state: PostMatchEvidenceState, es: boolean) {
  const labels: Record<PostMatchEvidenceState, { en: string; es: string }> = {
    "public-measured": { en: "Public measured", es: "Público medido" },
    "public-reported": { en: "Public reported", es: "Público reportado" },
    "synthetic-demo": { en: "Synthetic demo", es: "Demo sintética" },
    "requires-access": { en: "Requires access", es: "Requiere acceso" },
    "waiting": { en: "Waiting", es: "En espera" }
  };
  return labels[state][es ? "es" : "en"];
}

export function PostMatchScorecard({ data, embedded = false }: { data: ScorecardData; embedded?: boolean }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const isDemo = data.mode === "synthetic-demo";

  return (
    <section className={`postMatchScorecard ${embedded ? "embedded" : ""} ${isDemo ? "demo" : "public"}`} aria-labelledby={`scorecard-${data.fixtureId}`}>
      <div className="scorecardTop">
        <div>
          <div className="eyebrow">{es ? "SCORECARD POSTPARTIDO" : "POST-MATCH SCORECARD"}</div>
          <h3 id={`scorecard-${data.fixtureId}`}>{data.headline[lang]}</h3>
          <p>{data.interpretation[lang]}</p>
        </div>
        <div className="scorecardMode">
          <span>{es ? "ESTADO DE DATOS" : "DATA STATE"}</span>
          <strong>{isDemo ? (es ? "Ensayo sintético" : "Synthetic rehearsal") : (es ? "Observación pública" : "Public observation")}</strong>
          {isDemo ? <small>{es ? "No son resultados del club" : "Not club results"}</small> : null}
        </div>
      </div>

      <div className="scorecardMetrics">
        {data.metrics.map((metric) => (
          <article className={metric.state} key={metric.id}>
            <span>{evidenceLabel(metric.state, es)}</span>
            <strong>{metric.value}</strong>
            <small>{metric.label[lang]}</small>
          </article>
        ))}
      </div>

      <div className="scorecardWindows">
        {data.windows.map((window) => (
          <article className={window.status} key={window.id}>
            <div><strong>{window.id}</strong><span>{window.status}</span></div>
            <p>{window.objective[lang]}</p>
          </article>
        ))}
      </div>

      <div className="scorecardAction">
        <span>{es ? "SIGUIENTE ACCIÓN" : "NEXT ACTION"}</span>
        <strong>{data.nextAction[lang]}</strong>
      </div>

      <details>
        <summary>{es ? "Campos todavía no cerrados" : "Fields not yet closed"}</summary>
        <p>{data.dataGaps.join(" · ")}</p>
      </details>
    </section>
  );
}
