"use client";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

export function ThisWeekHero() {
  const { t, lang } = useLanguage();
  const state = useLiveMatch();
  const live = state.liveScore !== null;
  return (
    <section className="thisWeekHero">
      <div>
        <div className="eyebrow">{live ? (lang === "es" ? "DECISIÓN LIVE" : "LIVE DECISION") : t.thisWeek.operatingView}</div>
        <h1 className="thisWeekTitle">{state.decision}</h1>
        <p className="lede">
          {live
            ? (lang === "es" ? `Score live ${state.liveScore}. Las seis señales están activas.` : `Live score ${state.liveScore}. All six signals are active.`)
            : (lang === "es" ? `Score de planificación ${state.planningScore}. Attendance momentum sigue pendiente.` : `Planning score ${state.planningScore}. Attendance momentum is still waiting.`)}
        </p>
      </div>
      <div className="thisWeekState">
        <div className="stateNumber">{state.readiness} / {state.totalSignals}</div>
        <div className="stateLabel">{t.thisWeek.liveInputs}</div>
        <div className="stateBadges">
          <SignalBadge type="STRUCTURAL" /><SignalBadge type="MEASURED" />
          <SignalBadge type="INFERRED" /><SignalBadge type={state.weatherStatus} />
        </div>
      </div>
    </section>
  );
}
