"use client";

import { SignalBadge } from "./SignalBadge";
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
    <section className="thisWeekHero decisionFirstHero">
      <div className="decisionLockup">
        <div className="eyebrow">{es ? "RECOMENDACIÓN" : "RECOMMENDED ACTION"}</div>
        <h1 className="thisWeekTitle">{state.decision}</h1>
        <div className="activeScoreLine">
          <strong>{state.activeScore}</strong>
          <span>{live ? (es ? "score matchweek" : "matchweek score") : (es ? "score de planificación" : "planning score")}</span>
        </div>
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
        <div><span>{es ? "Objetivo" : "Target"}</span><strong>{state.fixture.targetTerritory}</strong></div>
        <div><span>{es ? "Producto" : "Product"}</span><strong>{state.fixture.product}</strong></div>
        <div><span>{es ? "Canal" : "Channel"}</span><strong>{state.fixture.channel}</strong></div>
      </div>

      <div className="readinessStrip">
        <div>
          <span>{es ? "Planificación" : "Planning"}</span>
          <strong>{es ? "4/4 lista" : "4/4 ready"}</strong>
          <SignalBadge type="PLANNING" />
        </div>
        <div>
          <span>Weather</span>
          <strong>{state.weatherStatus === "LIVE" ? (es ? "Disponible" : "Available") : (es ? "Pendiente" : "Waiting")}</strong>
          <SignalBadge type={state.weatherStatus} />
        </div>
        <div>
          <span>{es ? "Momentum de asistencia" : "Attendance momentum"}</span>
          <strong>{es ? "Pendiente" : "Waiting"}</strong>
          <SignalBadge type="WAITING" />
        </div>
      </div>
    </section>
  );
}
