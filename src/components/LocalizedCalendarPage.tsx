"use client";

import { useMemo, useState } from "react";
import { NavTabs } from "./NavTabs";
import { DemandHistory } from "./DemandHistory";
import { useLanguage } from "./LanguageProvider";
import type { AttendanceHistory, CalendarFixture, Fixture } from "@/lib/models";

type Scope = "all" | "home" | "away" | "results";

function displayDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));
}

export function LocalizedCalendarPage({ calendar, plans, history }: { calendar: CalendarFixture[]; plans: Fixture[]; history: AttendanceHistory }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const [scope, setScope] = useState<Scope>("all");
  const planByKey = useMemo(() => new Map(plans.map((plan) => [`${plan.date}-${plan.opponent}`, plan])), [plans]);
  const rows = calendar.filter((fixture) => {
    if (scope === "home") return fixture.homeAway === "home";
    if (scope === "away") return fixture.homeAway === "away";
    if (scope === "results") return fixture.status !== "scheduled";
    return true;
  });

  const filters: Array<[Scope, string]> = [
    ["all", es ? "Todos" : "All"], ["home", es ? "Casa" : "Home"],
    ["away", es ? "Fuera" : "Away"], ["results", es ? "Resultados" : "Results"]
  ];

  return (
    <main>
      <NavTabs />
      <section className="compactIntro calendarIntro">
        <div className="eyebrow">2026/27 · {es ? "CALENDARIO VIVO" : "LIVE CALENDAR"}</div>
        <h1>{es ? "Cada partido tiene un plan y un aprendizaje" : "Every fixture has a plan and a learning loop"}</h1>
        <p className="lede">{es
          ? "Partidos oficiales, resultados, señales, trabajo de marketing y análisis postpartido en una única línea temporal."
          : "Official fixtures, results, signals, marketing work and post-match analysis in one timeline."}</p>
      </section>

      <DemandHistory data={history} />

      <div className="calendarFilters" role="group" aria-label={es ? "Filtrar calendario" : "Filter calendar"}>
        {filters.map(([value, label]) => <button key={value} type="button" aria-pressed={scope === value} className={scope === value ? "active" : ""} onClick={() => setScope(value)}>{label}</button>)}
      </div>

      <section className="seasonTimeline" aria-label={es ? "Partidos de la temporada" : "Season fixtures"}>
        {rows.map((fixture) => {
          const plan = planByKey.get(`${fixture.date}-${fixture.opponent}`);
          const isResult = fixture.status !== "scheduled";
          return (
            <details className={`seasonFixture ${fixture.homeAway} ${isResult ? "isResult" : ""}`} key={fixture.id}>
              <summary>
                <div className="timelineDate"><strong>{displayDate(fixture.date, locale)}</strong><span>{fixture.kickoff ?? "TBC"}</span></div>
                <div className="timelineOpponent"><span>{fixture.homeAway === "home" ? (es ? "CASA" : "HOME") : (es ? "FUERA" : "AWAY")}</span><strong>{fixture.homeAway === "home" ? `London City v ${fixture.opponent}` : `${fixture.opponent} v London City`}</strong><small>{fixture.competition} · {fixture.venue}</small></div>
                <div className="timelineOutcome">
                  {fixture.result ? <strong>{fixture.result.for}–{fixture.result.against}</strong> : plan ? <strong>{plan.planningScore}</strong> : <strong>—</strong>}
                  <span>{fixture.result ? (es ? "final" : "final") : plan ? (es ? "prioridad" : "priority") : (es ? "seguimiento" : "monitor")}</span>
                </div>
              </summary>
              <div className="fixtureDossier">
                {isResult ? (
                  <>
                    <div><span>{es ? "RESULTADO" : "RESULT"}</span><strong>{fixture.result ? `${fixture.result.for}–${fixture.result.against}` : (es ? "Pendiente de verificar" : "Pending verification")}</strong></div>
                    <div><span>{es ? "ASISTENCIA" : "ATTENDANCE"}</span><strong>{fixture.attendance ? fixture.attendance.toLocaleString(locale) : (es ? "Pendiente" : "Pending")}</strong></div>
                    <div className="dossierWide"><span>{es ? "TRABAJO POSTPARTIDO" : "POST-MATCH WORK"}</span><strong>{es ? "Cerrar T+1, T+3 y T+7; después medir repetición a 30, 60 y 90 días." : "Close T+1, T+3 and T+7; then measure repeat at 30, 60 and 90 days."}</strong></div>
                  </>
                ) : (
                  <>
                    <div><span>{es ? "VENTANA" : "WINDOW"}</span><strong>{fixture.homeAway === "home" ? (es ? "Captación y experiencia" : "Acquisition and experience") : (es ? "Servicio al aficionado" : "Supporter service")}</strong></div>
                    <div><span>{es ? "ACCIÓN" : "ACTION"}</span><strong>{plan?.decision ?? (es ? "Seguimiento" : "Monitor")}</strong></div>
                    <div className="dossierWide"><span>{es ? "PLAN" : "PLAN"}</span><strong>{plan ? `${plan.product} · ${plan.channel}` : (es ? "Actualizar horarios, acceso, contenido y resultado." : "Update timing, access, content and result.")}</strong></div>
                  </>
                )}
              </div>
            </details>
          );
        })}
      </section>

      <section className="calendarCadence">
        <div><strong>T−42/22</strong><span>{es ? "objetivo y presupuesto" : "objective and budget"}</span></div>
        <div><strong>T−21/8</strong><span>{es ? "captación y comunidad" : "acquisition and community"}</span></div>
        <div><strong>T−7/1</strong><span>{es ? "tiempo, atención y servicio" : "weather, attention and service"}</span></div>
        <div><strong>T+1/7</strong><span>{es ? "resultado y aprendizaje" : "result and learning"}</span></div>
        <div><strong>T+30/90</strong><span>{es ? "retención" : "retention"}</span></div>
      </section>

      <p className="sourceNote">{es ? "Fuente del calendario:" : "Calendar source:"} <a href="https://www.londoncitylionesses.com/fixtures" target="_blank" rel="noreferrer">London City Lionesses ↗</a>. {es ? "Snapshot comprobado el 14 de septiembre de 2026; los cambios futuros deben conservar historial." : "Snapshot checked on 14 September 2026; future changes must preserve history."}</p>
    </main>
  );
}
