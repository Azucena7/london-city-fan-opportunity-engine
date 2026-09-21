"use client";

import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";
import { ExecutiveOverview } from "./ExecutiveOverview";
import type { CalendarFixture, Fixture, LiveSignal } from "@/lib/models";
import type { DecisionValidationData, ExperimentMeasurementData, PilotReadinessData, SearchDemandData } from "@/lib/models";
import type { SourceHealthData } from "@/lib/sourceHealth";

type CurrentState = {
  updated_at: string;
  material_changes: number;
  public_signal_changes?: number;
  next_home_fixture_id?: string;
  public_signal_refresh?: { state: string };
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
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London", timeZoneName: "short"
  }).format(new Date(value));
}

function formatShortDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" })
    .format(new Date(`${value}T12:00:00`));
}

function decisionLabel(value: Fixture["decision"], es: boolean) {
  const labels = {
    "ATTACK HARD": { en: "Accelerate acquisition", es: "Acelerar captación" },
    ATTACK: { en: "Active acquisition", es: "Captación activa" },
    "TEST / SELECTIVE": { en: "Selective test", es: "Prueba selectiva" },
    "DEFEND CORE": { en: "Protect the core", es: "Proteger la base" }
  };
  return labels[value][es ? "es" : "en"];
}

function actionStateLabel(state: string, overdue: boolean, es: boolean) {
  if (overdue) return es ? "Vencida" : "Overdue";
  if (state === "next") return es ? "Siguiente" : "Next";
  if (state === "planned") return es ? "Planificada" : "Planned";
  if (state === "complete") return es ? "Completa" : "Complete";
  return state.replaceAll("-", " ");
}

export function LocalizedToday({
  fixture,
  nextMatch,
  signals,
  current,
  roadmap,
  readiness,
  search,
  measurement,
  validation,
  sources
}: {
  fixture: Fixture;
  nextMatch: CalendarFixture | null;
  signals: LiveSignal[];
  current: CurrentState;
  roadmap: RoadmapItem[];
  readiness: PilotReadinessData;
  search: SearchDemandData;
  measurement: ExperimentMeasurementData;
  validation: DecisionValidationData;
  sources: SourceHealthData;
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const currentFixtureId = current.next_home_fixture_id ?? "2026-09-26-bha-h";
  const highSignals = signals
    .filter((signal) => signal.materiality === "high")
    .sort((a, b) => {
      const fixtureDifference = Number(b.fixtureId === currentFixtureId) - Number(a.fixtureId === currentFixtureId);
      return fixtureDifference || Date.parse(b.observedAt) - Date.parse(a.observedAt);
    });
  const visibleSignals = highSignals.slice(0, 3);
  const olderSignals = highSignals.slice(3);
  const fixtureActions = roadmap
    .filter((item) => item.fixtureId === currentFixtureId)
    .sort((a, b) => a.due.localeCompare(b.due));
  const visibleActions = fixtureActions.slice(0, 3);
  const laterActions = fixtureActions.slice(3);
  const refreshDate = current.updated_at.slice(0, 10);
  const realityCheck = validation.cases.find((item) => item.fixtureId === currentFixtureId);
  const alignedDimensions = realityCheck?.dimensions.filter((item) => item.state === "aligned").length ?? 0;
  const partialDimensions = realityCheck?.dimensions.filter((item) => item.state === "partial").length ?? 0;
  const scoreFactors = [
    { label: es ? "Territorio" : "Territory", value: fixture.territoryOpportunity, weight: 35 },
    { label: es ? "Calendario" : "Calendar", value: fixture.calendarWhitespace, weight: 25 },
    { label: es ? "Atención disponible" : "Attention available", value: fixture.attentionAvailability, weight: 20 },
    { label: es ? "Atractivo del partido" : "Fixture appeal", value: fixture.fixtureAppeal, weight: 20 }
  ];

  return (
    <main>
      <NavTabs />

      <section className="freshnessBar" aria-label={es ? "Estado de actualización" : "Update status"} aria-live="polite">
        <span className="freshnessDot" />
        <strong>{es ? "Última actualización" : "Last refresh"}: {formatUpdated(current.updated_at, locale)}</strong>
        <span>{current.material_changes} {es ? "cambios materiales desde la actualización" : "material changes since refresh"}</span>
        <span>{current.public_signal_changes ?? 0} {es ? "señales públicas actualizadas" : "public signals updated"}</span>
        <span>{signals.length} {es ? "señales con fuente" : "sourced signals"}</span>
      </section>

      <section className="todayHero">
        <div className="todayDecision">
          <div className="eyebrow">{es ? "DECISIÓN VIGENTE" : "CURRENT DECISION"}</div>
          <h1>{es ? "Aumentar captación con foco en repetición" : "Grow acquisition with a repeat-visit focus"}</h1>
          <p>{es
            ? "Usar el opener como cohorte, no como baseline. Brighton debe demostrar cuánta demanda vuelve y de qué territorios procede."
            : "Use the opener as a cohort, not a baseline. Brighton must show how much demand returns and which territories it comes from."}</p>
          <div className="decisionScore">
            <strong>{fixture.planningScore}<small>/100</small></strong>
            <span><b>{decisionLabel(fixture.decision, es)}</b>{es ? "Prioridad de planificación" : "Planning priority"}</span>
          </div>
          <details className="scoreExplanation">
            <summary>{es ? `Por qué ${fixture.planningScore}: ATTACK empieza en 72` : `Why ${fixture.planningScore}: ATTACK starts at 72`}</summary>
            <div>
              {scoreFactors.map((factor) => <span key={factor.label}><b>{factor.value}</b>{factor.label}<small>{factor.weight}%</small></span>)}
            </div>
            <Link href="/method">{es ? "Ver método de scoring →" : "View scoring method →"}</Link>
          </details>
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
            <div><span>{es ? "Audiencia" : "Audience"}</span><strong>{fixture.targetTerritory} + {es ? "compradores del opener" : "opener buyers"}</strong></div>
            <div><span>{es ? "Oferta" : "Offer"}</span><strong>{fixture.product}</strong></div>
            <div><span>{es ? "Canales" : "Channels"}</span><strong>{fixture.channel}</strong></div>
          </div>
          <Link className="fixturePlanLink" href="/calendar">{es ? "Abrir plan del partido →" : "Open fixture plan →"}</Link>
        </div>
      </section>

      {nextMatch ? (
        <section className="nextMatchRail">
          <span>{es ? "Antes del próximo partido en casa" : "Before the next home fixture"}</span>
          <strong>{es ? "Siguiente partido del equipo:" : "Team's next match:"} {nextMatch.homeAway === "home" ? "London City v" : `${nextMatch.opponent} v`} {nextMatch.homeAway === "home" ? nextMatch.opponent : "London City"}</strong>
          <span>{formatDate(nextMatch.date, locale)} · {nextMatch.kickoff} · {nextMatch.venue}</span>
        </section>
      ) : null}

      {realityCheck ? (
        <section className="todayRealityCheck" aria-labelledby="today-reality-title">
          <div className="todayRealityIntro">
            <div className="eyebrow">{es ? "REALITY CHECK" : "REALITY CHECK"}</div>
            <h2 id="today-reality-title">{es ? "Una hipótesis del engine ya tiene una acción pública comparable." : "An engine hypothesis now has a comparable public club action."}</h2>
            <p>{es ? "Esto mide relevancia de la hipótesis, no influencia sobre el club." : "This tests the relevance of the hypothesis—not influence on the club."}</p>
          </div>

          <div className="todayRealityFlow">
            <article>
              <span>{es ? "15 SEP · HIPÓTESIS" : "15 SEP · HYPOTHESIS"}</span>
              <strong>{realityCheck.hypothesis[lang]}</strong>
            </article>
            <b aria-hidden="true">→</b>
            <article className="observed">
              <span>{es ? "18 SEP · OBSERVADO" : "18 SEP · OBSERVED"}</span>
              <strong>{realityCheck.observedAction[lang]}</strong>
            </article>
          </div>

          <div className="todayRealityStatus">
            <div><strong>{alignedDimensions}</strong><span>{es ? "alineadas" : "aligned"}</span></div>
            <div><strong>{partialDimensions}</strong><span>{es ? "parcial" : "partial"}</span></div>
            <div><strong>0</strong><span>{es ? "causalidad afirmada" : "causation claimed"}</span></div>
            <Link href="/measurement#decision-validation-title">{es ? "Abrir validación completa →" : "Open full validation →"}</Link>
          </div>
        </section>
      ) : null}

      <section className="todaySection priorityActions" aria-labelledby="priority-actions-title">
        <div className="todaySectionHead">
          <div><div className="eyebrow">{es ? "HACER AHORA" : "DO NEXT"}</div><h2 id="priority-actions-title">{es ? "Tres acciones antes del próximo partido" : "Three actions before the next home fixture"}</h2></div>
          <Link href="/calendar">{es ? "Abrir planificación completa →" : "Open full fixture plan →"}</Link>
        </div>
        <div className="priorityActionGrid">
          {visibleActions.map((item, index) => {
            const overdue = item.due < refreshDate && item.status !== "complete";
            return <article className={overdue ? "overdue" : item.status} key={item.id}>
              <div><span>{String(index + 1).padStart(2, "0")}</span><b>{actionStateLabel(item.status, overdue, es)}</b></div>
              <h3>{item.title[lang]}</h3>
              <p>{item.reason[lang]}</p>
              <dl><div><dt>{es ? "Área responsable" : "Responsible area"}</dt><dd>{item.area}</dd></div><div><dt>{es ? "Fecha" : "Due"}</dt><dd>{formatShortDate(item.due, locale)}</dd></div></dl>
            </article>;
          })}
        </div>
        {laterActions.length ? <details className="progressiveDisclosure"><summary>{es ? `Ver ${laterActions.length} acción posterior` : `View ${laterActions.length} later action`}</summary>{laterActions.map((item) => <div key={item.id}><strong>{item.title[lang]}</strong><span>{item.area} · {formatShortDate(item.due, locale)}</span></div>)}</details> : null}
      </section>

      <section className="todaySection">
        <div className="todaySectionHead">
          <div><div className="eyebrow">{es ? "QUÉ HA CAMBIADO" : "WHAT CHANGED"}</div><h2>{es ? "Tres señales que modifican la acción" : "Three signals that change the action"}</h2></div>
          <span>{es ? "Primero el próximo partido; después, la observación más reciente" : "Next fixture first, then most recently observed"}</span>
        </div>
        <div className="signalEditorialList">
          {visibleSignals.map((signal) => (
            <article key={signal.id} className={`signalEditorial signal-${signal.direction}`}>
              <div className="signalEditorialMeta">
                <span>{signal.category}</span>
                <span>{signal.state}</span>
                <time dateTime={signal.observedAt}>{formatShortDate(signal.observedAt.slice(0, 10), locale)}</time>
              </div>
              <h3>{signal.title[lang]}</h3>
              <p>{signal.summary[lang]}</p>
              <div className="marketingChange"><span>{es ? "CAMBIO EN MARKETING" : "MARKETING CHANGE"}</span><strong>{signal.marketingAction[lang]}</strong></div>
              <a href={signal.sourceUrl} target="_blank" rel="noreferrer">{signal.sourceName} ↗</a>
            </article>
          ))}
        </div>
        {olderSignals.length ? <details className="progressiveDisclosure signalArchive"><summary>{es ? `Ver ${olderSignals.length} señales materiales anteriores` : `View ${olderSignals.length} earlier material signals`}</summary>{olderSignals.map((signal) => <article key={signal.id}><div><strong>{signal.title[lang]}</strong><span>{formatShortDate(signal.observedAt.slice(0, 10), locale)} · {signal.state}</span></div><p>{signal.marketingAction[lang]}</p><a href={signal.sourceUrl} target="_blank" rel="noreferrer">{signal.sourceName} ↗</a></article>)}</details> : null}
      </section>

      <ExecutiveOverview readiness={readiness} search={search} measurement={measurement} sources={sources} />
    </main>
  );
}
