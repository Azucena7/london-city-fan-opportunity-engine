"use client";

import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";
import { PostMatchScorecard } from "./PostMatchScorecard";
import type { CalendarFixture, Fixture, LiveSignal, PostMatchScorecard as ScorecardData } from "@/lib/models";

type CurrentState = {
  updated_at: string;
  material_changes: number;
  weather: { status: string; reason?: string; [key: string]: string | number | null | undefined };
  attendance_momentum: { score: number; basis: string };
};

type RoadmapItem = {
  id: string;
  fixtureId: string;
  area: string;
  status: string;
  due: string;
  title: { en: string; es: string };
  reason: { en: string; es: string };
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));
}

function formatUpdated(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London"
  }).format(new Date(value));
}

export function LocalizedToday({
  fixture,
  nextMatch,
  signals,
  current,
  scorecard,
  roadmap
}: {
  fixture: Fixture;
  nextMatch: CalendarFixture | null;
  signals: LiveSignal[];
  current: CurrentState;
  scorecard: ScorecardData | null;
  roadmap: RoadmapItem[];
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const highSignals = signals.filter((signal) => signal.materiality === "high");

  return (
    <main>
      <NavTabs />

      <section className="freshnessBar" aria-label={es ? "Estado de actualización" : "Update status"}>
        <span className="freshnessDot" />
        <strong>{es ? "Actualizado" : "Updated"} {formatUpdated(current.updated_at, locale)}</strong>
        <span>{current.material_changes} {es ? "cambios materiales registrados" : "material changes recorded"}</span>
        <span>{signals.length} {es ? "señales con fuente" : "sourced signals"}</span>
      </section>

      <section className="todayHero">
        <div className="todayDecision">
          <div className="eyebrow">{es ? "DECISIÓN VIGENTE" : "CURRENT DECISION"}</div>
          <h1>{es ? "Aumentar captación con foco en repetición" : "Grow acquisition with a repeat-visit focus"}</h1>
          <p>{es
            ? "Usar el opener como cohorte, no como baseline. Brighton debe demostrar cuánta demanda vuelve y de qué territorios procede."
            : "Use the opener as a cohort, not a baseline. Brighton must show how much demand returns and which territories it comes from."}</p>
          <div className="decisionScore"><strong>{fixture.planningScore}</strong><span>{es ? "prioridad de captación" : "acquisition priority"}</span></div>
        </div>

        <div className="todayFixture">
          <div className="eyebrow">{es ? "PRÓXIMO PARTIDO EN CASA" : "NEXT HOME FIXTURE"}</div>
          <h2>London City <span>v</span> {fixture.opponent}</h2>
          <div className="fixtureMetaLine">
            <span>{formatDate(fixture.date, locale)}</span>
            <span>{fixture.kickoff}</span>
            <span>{fixture.venue}</span>
          </div>
          <blockquote>“{fixture.message}”</blockquote>
          <div className="heroBrief">
            <div><span>{es ? "Audiencia" : "Audience"}</span><strong>{fixture.targetTerritory} + compradores del opener</strong></div>
            <div><span>{es ? "Oferta" : "Offer"}</span><strong>{fixture.product}</strong></div>
            <div><span>{es ? "Canales" : "Channels"}</span><strong>{fixture.channel}</strong></div>
          </div>
        </div>
      </section>

      {nextMatch ? (
        <section className="nextMatchRail">
          <span>{es ? "Antes del próximo partido en casa" : "Before the next home fixture"}</span>
          <strong>{es ? "Siguiente partido del equipo:" : "Team's next match:"} {nextMatch.homeAway === "home" ? "London City v" : `${nextMatch.opponent} v`} {nextMatch.homeAway === "home" ? nextMatch.opponent : "London City"}</strong>
          <span>{formatDate(nextMatch.date, locale)} · {nextMatch.kickoff} · {nextMatch.venue}</span>
        </section>
      ) : null}

      <section className="todaySection">
        <div className="todaySectionHead">
          <div><div className="eyebrow">{es ? "QUÉ HA CAMBIADO" : "WHAT CHANGED"}</div><h2>{es ? "Señales que modifican la acción" : "Signals that change the action"}</h2></div>
          <span>{es ? "Solo cambios materiales ocupan la portada" : "Only material changes reach the front page"}</span>
        </div>
        <div className="signalEditorialList">
          {highSignals.map((signal) => (
            <article key={signal.id} className={`signalEditorial signal-${signal.direction}`}>
              <div className="signalEditorialMeta">
                <span>{signal.category}</span>
                <span>{signal.state}</span>
              </div>
              <h3>{signal.title[lang]}</h3>
              <p>{signal.summary[lang]}</p>
              <div className="marketingChange"><span>{es ? "CAMBIO EN MARKETING" : "MARKETING CHANGE"}</span><strong>{signal.marketingAction[lang]}</strong></div>
              <a href={signal.sourceUrl} target="_blank" rel="noreferrer">{signal.sourceName} ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="todaySection">
        <div className="todaySectionHead">
          <div><div className="eyebrow">{es ? "PLAN DE PARTIDO" : "FIXTURE PLAN"}</div><h2>{es ? "De la señal a la ejecución" : "From signal to execution"}</h2></div>
          <Link href="/calendar">{es ? "Abrir calendario completo →" : "Open full calendar →"}</Link>
        </div>
        <div className="roadmapGrid">
          {roadmap.filter((item) => item.fixtureId === "2026-09-26-bha-h").map((item) => (
            <article key={item.id}>
              <div><span>{item.area}</span><span>{item.due}</span></div>
              <h3>{item.title[lang]}</h3>
              <p>{item.reason[lang]}</p>
              <strong className="roadmapStatus">{item.status}</strong>
            </article>
          ))}
        </div>
      </section>

      {scorecard ? <PostMatchScorecard data={scorecard} /> : null}
    </main>
  );
}
