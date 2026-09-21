"use client";

import { useMemo, useState } from "react";
import { NavTabs } from "./NavTabs";
import { DemandHistory } from "./DemandHistory";
import { LeagueAttendanceBenchmark } from "./LeagueAttendanceBenchmark";
import { AudienceReach } from "./AudienceReach";
import { CrmTicketingReadiness } from "./CrmTicketingReadiness";
import { PostMatchScorecard } from "./PostMatchScorecard";
import { CampaignPlan } from "./CampaignPlan";
import { ClubActivationIntelligence } from "./ClubActivationIntelligence";
import { SearchDemandObservatory } from "./SearchDemandObservatory";
import { EventLandscape } from "./EventLandscape";
import { useLanguage } from "./LanguageProvider";
import type { AttendanceHistory, AudienceReachData, CalendarFixture, CampaignPlan as CampaignData, ClubActivationDataset, CrmTicketingDemo, CrmTicketingReadiness as CrmReadinessData, DecisionValidationData, EventLandscapeData, Fixture, LeagueAttendanceBenchmark as BenchmarkData, LiveSignal, PostMatchScorecard as ScorecardData, SearchDemandData } from "@/lib/models";

type Scope = "upcoming" | "home" | "away" | "results";
type RoadmapItem = {
  id: string;
  fixtureId: string;
  area: string;
  status: string;
  due: string;
  title: { en: string; es: string };
  reason: { en: string; es: string };
};

function displayDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));
}

function shortDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" })
    .format(new Date(`${value}T12:00:00`));
}

function decisionLabel(decision: Fixture["decision"], es: boolean) {
  const labels = {
    "ATTACK HARD": { en: "Accelerate", es: "Acelerar" },
    ATTACK: { en: "Acquire", es: "Captar" },
    "TEST / SELECTIVE": { en: "Test selectively", es: "Probar selectivamente" },
    "DEFEND CORE": { en: "Protect core", es: "Proteger la base" }
  };
  return labels[decision][es ? "es" : "en"];
}

export function LocalizedCalendarPage({ calendar, plans, history, benchmark, audience, eventLandscape, searchDemand, crmReadiness, crmDemo, scorecards, campaigns, signals, activations, roadmap, updatedAt, validation }: { calendar: CalendarFixture[]; plans: Fixture[]; history: AttendanceHistory; benchmark: BenchmarkData; audience: AudienceReachData; eventLandscape: EventLandscapeData; searchDemand: SearchDemandData; crmReadiness: CrmReadinessData; crmDemo: CrmTicketingDemo; scorecards: ScorecardData[]; campaigns: CampaignData[]; signals: LiveSignal[]; activations: ClubActivationDataset; roadmap: RoadmapItem[]; updatedAt: string; validation: DecisionValidationData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const [scope, setScope] = useState<Scope>("upcoming");
  const referenceDate = updatedAt.slice(0, 10);
  const planByKey = useMemo(() => new Map(plans.map((plan) => [`${plan.date}-${plan.opponent}`, plan])), [plans]);
  const scorecardByFixture = useMemo(() => new Map(scorecards.map((scorecard) => [scorecard.fixtureId, scorecard])), [scorecards]);
  const campaignByFixture = useMemo(() => new Map(campaigns.map((campaign) => [campaign.fixtureId, campaign])), [campaigns]);
  const nextHome = calendar.find((fixture) => fixture.status === "scheduled" && fixture.homeAway === "home" && fixture.date >= referenceDate) ?? null;
  const upcomingHome = calendar.filter((fixture) => fixture.status === "scheduled" && fixture.homeAway === "home" && fixture.date >= referenceDate);
  const priorityHome = upcomingHome.filter((fixture) => {
    const plan = planByKey.get(`${fixture.date}-${fixture.opponent}`);
    return plan?.decision === "ATTACK" || plan?.decision === "ATTACK HARD";
  });
  const unresolved = calendar.reduce((total, fixture) => total + (fixture.sourceDiscrepancies?.filter((item) => item.state === "unresolved").length ?? 0), 0);
  const rows = calendar.filter((fixture) => {
    if (scope === "upcoming") return fixture.status === "scheduled" && fixture.date >= referenceDate;
    if (scope === "home") return fixture.status === "scheduled" && fixture.homeAway === "home" && fixture.date >= referenceDate;
    if (scope === "away") return fixture.status === "scheduled" && fixture.homeAway === "away" && fixture.date >= referenceDate;
    if (scope === "results") return fixture.status !== "scheduled";
    return false;
  });

  const filters: Array<[Scope, string, number]> = [
    ["upcoming", es ? "Próximos" : "Upcoming", calendar.filter((fixture) => fixture.status === "scheduled" && fixture.date >= referenceDate).length],
    ["home", es ? "Plan de casa" : "Home plan", upcomingHome.length],
    ["away", es ? "Fuera" : "Away", calendar.filter((fixture) => fixture.status === "scheduled" && fixture.homeAway === "away" && fixture.date >= referenceDate).length],
    ["results", es ? "Resultados" : "Results", calendar.filter((fixture) => fixture.status !== "scheduled").length]
  ];

  return (
    <main>
      <NavTabs />
      <section className="compactIntro calendarIntro fixtureFirstIntro">
        <div>
          <div className="eyebrow">2026/27 · {es ? "PLANIFICACIÓN POR PARTIDO" : "FIXTURE-LED PLANNING"}</div>
          <h1>{es ? "Del calendario a una decisión operativa por partido" : "Turn every fixture into an operating decision"}</h1>
          <p className="lede">{es
            ? "Prioriza los partidos de casa, abre el plan de ejecución y conserva resultados y aprendizaje en la misma línea temporal."
            : "Prioritise home fixtures, open the execution plan and keep results and learning in the same timeline."}</p>
        </div>
        {nextHome ? <a className="nextFixtureJump" href={`#${nextHome.id}`}>
          <span>{es ? "PRÓXIMO PARTIDO EN CASA" : "NEXT HOME FIXTURE"}</span>
          <strong>{nextHome.opponent}</strong>
          <small>{displayDate(nextHome.date, locale)} · {nextHome.kickoff ?? "TBC"}</small>
          <b>{es ? "Abrir plan ↓" : "Open plan ↓"}</b>
        </a> : null}
      </section>

      <section className="calendarCommandBar" aria-label={es ? "Resumen de planificación" : "Planning summary"}>
        <div><strong>{upcomingHome.length}</strong><span>{es ? "partidos de casa por planificar" : "home fixtures to plan"}</span></div>
        <div><strong>{priorityHome.length}</strong><span>{es ? "ventanas de captación activa" : "active acquisition windows"}</span></div>
        <div className={unresolved ? "needsAttention" : ""}><strong>{unresolved}</strong><span>{es ? "discrepancias por resolver" : "source discrepancies to resolve"}</span></div>
        <div><strong>{roadmap.filter((item) => item.due >= referenceDate).length}</strong><span>{es ? "acciones operativas abiertas" : "open operating actions"}</span></div>
      </section>

      <div className="calendarToolbar">
        <div><div className="eyebrow">{es ? "TEMPORADA" : "SEASON"}</div><h2>{es ? "Partidos y planes" : "Fixtures and plans"}</h2></div>
        <div className="calendarFilters" role="group" aria-label={es ? "Filtrar calendario" : "Filter calendar"}>
          {filters.map(([value, label, count]) => <button key={value} type="button" aria-pressed={scope === value} className={scope === value ? "active" : ""} onClick={() => setScope(value)}>{label}<span>{count}</span></button>)}
        </div>
      </div>

      <section className="seasonTimeline fixtureFirstTimeline" aria-label={es ? "Partidos de la temporada" : "Season fixtures"}>
        {rows.map((fixture) => {
          const plan = planByKey.get(`${fixture.date}-${fixture.opponent}`);
          const scorecard = scorecardByFixture.get(fixture.id);
          const campaign = campaignByFixture.get(fixture.id);
          const fixtureActions = roadmap.filter((item) => item.fixtureId === fixture.id).sort((a, b) => a.due.localeCompare(b.due));
          const fixtureSignals = signals.filter((signal) => signal.fixtureId === fixture.id && signal.materiality === "high");
          const validationCase = validation.cases.find((item) => item.fixtureId === fixture.id);
          const isResult = fixture.status !== "scheduled";
          const isNextHome = fixture.id === nextHome?.id;
          return (
            <details className={`seasonFixture ${fixture.homeAway} ${isResult ? "isResult" : ""} ${isNextHome ? "isNextHome" : ""}`} id={fixture.id} key={fixture.id} open={isNextHome && scope !== "results"}>
              <summary>
                <div className="timelineDate"><strong>{displayDate(fixture.date, locale)}</strong><span>{fixture.kickoff ?? "TBC"}</span></div>
                <div className="timelineOpponent"><span>{isNextHome ? (es ? "SIGUIENTE DECISIÓN" : "NEXT DECISION") : fixture.homeAway === "home" ? (es ? "CASA" : "HOME") : (es ? "FUERA" : "AWAY")}</span><strong>{fixture.homeAway === "home" ? `London City v ${fixture.opponent}` : `${fixture.opponent} v London City`}</strong><small>{fixture.competition} · {fixture.venue}</small></div>
                <div className="fixtureStatusSummary">
                  {fixture.result ? <><strong>{fixture.result.for}–{fixture.result.against}</strong><span>{es ? "Final" : "Final"}</span></> : plan ? <><strong>{plan.planningScore}<small>/100</small></strong><span>{decisionLabel(plan.decision, es)}</span></> : <><strong>—</strong><span>{es ? "Servicio" : "Service"}</span></>}
                </div>
                <div className="fixtureReadiness"><strong>{fixtureActions.length}</strong><span>{es ? "acciones" : "actions"}</span><strong>{fixtureSignals.length}</strong><span>{es ? "señales" : "signals"}</span></div>
              </summary>

              <div className="fixtureOperatingPlan">
                {isResult ? (
                  <><article><span>{es ? "RESULTADO" : "RESULT"}</span><strong>{fixture.result ? `${fixture.result.for}–${fixture.result.against}` : (es ? "Pendiente de verificar" : "Pending verification")}</strong></article><article><span>{es ? "ASISTENCIA" : "ATTENDANCE"}</span><strong>{fixture.attendance ? fixture.attendance.toLocaleString(locale) : (es ? "Pendiente" : "Pending")}</strong></article><article className="operatingWide"><span>{es ? "SIGUIENTE APRENDIZAJE" : "NEXT LEARNING"}</span><strong>{es ? "Cerrar T+1, T+3 y T+7; medir repetición a 30, 60 y 90 días." : "Close T+1, T+3 and T+7; measure repeat at 30, 60 and 90 days."}</strong></article></>
                ) : plan ? (
                  <><article><span>{es ? "DECISIÓN" : "DECISION"}</span><strong>{decisionLabel(plan.decision, es)}</strong><small>{plan.planningScore}/100</small></article><article><span>{es ? "TERRITORIO" : "TERRITORY"}</span><strong>{plan.targetTerritory}</strong><small>{plan.territoryOpportunity}/100 {es ? "oportunidad" : "opportunity"}</small></article><article><span>{es ? "OFERTA" : "OFFER"}</span><strong>{plan.product}</strong></article><article><span>{es ? "CANALES" : "CHANNELS"}</span><strong>{plan.channel}</strong></article><article className="operatingWide"><span>{es ? "MENSAJE" : "MESSAGE"}</span><strong>“{plan.message}”</strong></article></>
                ) : (
                  <><article><span>{es ? "MODO" : "MODE"}</span><strong>{es ? "Servicio al aficionado" : "Supporter service"}</strong></article><article className="operatingWide"><span>{es ? "CONTROL" : "CONTROL"}</span><strong>{es ? "Confirmar horario, acceso, desplazamiento y comunicación de partido." : "Confirm timing, access, travel and fixture communications."}</strong></article></>
                )}
              </div>

              {fixtureActions.length ? <section className="fixtureActionList" aria-label={es ? "Acciones del partido" : "Fixture actions"}>
                <div className="fixtureSectionHead"><strong>{es ? "Acciones operativas" : "Operating actions"}</strong><span>{fixtureActions.length} {es ? "asignadas" : "assigned"}</span></div>
                {fixtureActions.map((item) => {
                  const overdue = item.due < referenceDate && item.status !== "complete";
                  return <article className={overdue ? "overdue" : ""} key={item.id}><span>{item.area}</span><strong>{item.title[lang]}</strong><time dateTime={item.due}>{overdue ? (es ? "Vencida · " : "Overdue · ") : ""}{shortDate(item.due, locale)}</time></article>;
                })}
              </section> : null}

              {fixtureSignals.length ? <section className="fixtureSignalStrip" aria-label={es ? "Señales materiales" : "Material signals"}>{fixtureSignals.map((signal) => <article key={signal.id}><span>{signal.category} · {signal.state}</span><strong>{signal.title[lang]}</strong><p>{signal.marketingAction[lang]}</p><a href={signal.sourceUrl} target="_blank" rel="noreferrer">{signal.sourceName} ↗</a></article>)}</section> : null}
              {validationCase?.liveValidation ? <section className="fixtureValidationLifecycle">
                <div className="fixtureSectionHead"><strong>{es ? "Validación en vivo" : "Live validation"}</strong><span>{validationCase.liveValidation.state.replaceAll("-", " ")}</span></div>
                <div>{validationCase.liveValidation.phases.map((phase) => <article className={phase.state} key={phase.id}><span>{phase.state === "complete" ? "✓" : phase.state === "active" ? "●" : "○"}</span><strong>{phase.label[lang]}</strong><small>{shortDate(phase.date, locale)}</small></article>)}</div>
              </section> : null}
              {campaign ? <CampaignPlan data={campaign} signals={signals} embedded /> : null}
              {scorecard ? <details className="fixtureDeepDive"><summary>{es ? "Abrir scorecard postpartido" : "Open post-match scorecard"}</summary><PostMatchScorecard data={scorecard} embedded /></details> : null}
              {fixture.sourceDiscrepancies?.map((item) => <div className="sourceDiscrepancy" role="status" key={`${fixture.id}-${item.field}`}><div><span>{es ? "DISCREPANCIA DE FUENTE" : "SOURCE DISCREPANCY"}</span><strong>{es ? "El horario público no coincide entre fuentes oficiales" : "The public kick-off time differs across official sources"}</strong></div><div className="sourceValues">{item.values.map((value) => <a href={value.sourceUrl} target="_blank" rel="noreferrer" key={`${value.sourceName}-${value.value}`}><strong>{value.value}</strong><span>{value.sourceName} ↗</span></a>)}</div><p>{es ? "Sin resolver. Confirmar antes de publicar campañas o rutas." : "Unresolved. Confirm before publishing campaigns or journeys."}</p></div>)}
              {fixture.id === activations.fixtureId ? <details className="fixtureDeepDive"><summary>{es ? "Abrir inteligencia de activación" : "Open activation intelligence"}</summary><ClubActivationIntelligence data={activations} /></details> : null}
            </details>
          );
        })}
      </section>

      <section className="calendarCadence" aria-label={es ? "Cadencia por partido" : "Fixture cadence"}><div><strong>T−42/22</strong><span>{es ? "objetivo y presupuesto" : "objective and budget"}</span></div><div><strong>T−21/8</strong><span>{es ? "captación y comunidad" : "acquisition and community"}</span></div><div><strong>T−7/1</strong><span>{es ? "tiempo, atención y servicio" : "weather, attention and service"}</span></div><div><strong>T+1/7</strong><span>{es ? "resultado y aprendizaje" : "result and learning"}</span></div><div><strong>T+30/90</strong><span>{es ? "retención" : "retention"}</span></div></section>

      <details className="calendarEvidence">
        <summary><div><span>{es ? "CONTEXTO DE PLANIFICACIÓN" : "PLANNING CONTEXT"}</span><strong>{es ? "Abrir demanda, benchmark, audiencia y preparación de datos" : "Open demand, benchmark, audience and data readiness"}</strong></div><b>{es ? "6 módulos" : "6 modules"}</b></summary>
        <div className="calendarEvidenceBody"><DemandHistory data={history} /><LeagueAttendanceBenchmark data={benchmark} /><AudienceReach data={audience} /><EventLandscape data={eventLandscape} calendar={calendar} /><SearchDemandObservatory data={searchDemand} /><CrmTicketingReadiness data={crmReadiness} demo={crmDemo} /></div>
      </details>

      <p className="sourceNote">{es ? "Fuente del calendario:" : "Calendar source:"} <a href="https://www.londoncitylionesses.com/fixtures" target="_blank" rel="noreferrer">London City Lionesses ↗</a>. {es ? "Snapshot comprobado el 14 de septiembre de 2026; los cambios futuros deben conservar historial." : "Snapshot checked on 14 September 2026; future changes must preserve history."}</p>
    </main>
  );
}
