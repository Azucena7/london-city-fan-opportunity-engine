"use client";

import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

export function ThisWeekHero() {
  const { lang } = useLanguage();
  const state = useLiveMatch();
  const es = lang === "es";
  const live = state.liveScore !== null;

  const displayDate = new Intl.DateTimeFormat(es ? "es-ES" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${state.fixture.date}T12:00:00`));

  return (
    <section className="thisWeekHero decisionFirstHero block15ThisWeekHero">
      <div className="decisionLockup">
        <div className="eyebrow">{es ? "ACCIÓN RECOMENDADA" : "RECOMMENDED ACTION"}</div>
        <h1 className="thisWeekTitle">{state.decision}</h1>
        <div className="activeScoreLine">
          <strong>{state.activeScore}</strong>
          <span>
            {live
              ? es
                ? "score de semana de partido"
                : "matchweek score"
              : es
              ? "score de planificación"
              : "planning score"}
          </span>
        </div>
        <p className="decisionModeNote">
          {live
            ? es
              ? "La capa dinámica está resuelta y puede modificar la acción."
              : "The dynamic layer is resolved and can modify the action."
            : es
            ? "Recomendación de planificación. Las señales de semana de partido todavía pueden modificarla."
            : "Planning recommendation. Matchweek signals can still modify it."}
        </p>
      </div>

      <div className="fixtureDecisionContext">
        <div className="eyebrow">{es ? "PRÓXIMO PARTIDO EN CASA" : "NEXT HOME FIXTURE"}</div>
        <h2>London City v {state.fixture.opponent}</h2>
        <div className="fixtureMetaLine">
          <span>{displayDate}</span>
          <span>{state.fixture.kickoff ?? "TBC"}</span>
          <span>{state.fixture.venue ?? state.fixture.stadium ?? "Hayes Lane"}</span>
        </div>
        <blockquote>“{state.fixture.message}”</blockquote>
      </div>

      <div className="actionBrief">
        <div>
          <span>{es ? "Territorio objetivo" : "Target territory"}</span>
          <strong>{state.fixture.targetTerritory}</strong>
        </div>
        <div>
          <span>{es ? "Producto" : "Product"}</span>
          <strong>{state.fixture.product}</strong>
        </div>
        <div>
          <span>{es ? "Canal" : "Channel"}</span>
          <strong>{state.fixture.channel}</strong>
        </div>
      </div>
    </section>
  );
}
