"use client";

import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";
import type { CalendarFixture, DecisionValidationData, LocalizedText } from "@/lib/models";
import type { ProductOpportunity } from "@/lib/productOpportunity";

export function LondonCityCase({ calendar, reviewedAt, validation, actions, opportunity }: {
  calendar: CalendarFixture[];
  reviewedAt: string;
  validation: DecisionValidationData;
  actions: Array<{ id: string; fixtureId: string; due: string; area: string; title: LocalizedText }>;
  opportunity: ProductOpportunity | null;
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const date = (value: string) => new Date(value + "T12:00:00Z").toLocaleDateString(locale, { day: "numeric", month: "long", timeZone: "Europe/London" });
  const reference = reviewedAt.slice(0, 10);
  const recent = calendar.filter((f) => f.status === "final").sort((a,b) => b.date.localeCompare(a.date)).slice(0,3);
  const next = calendar.filter((f) => f.status === "scheduled" && f.date >= reference).sort((a,b) => a.date.localeCompare(b.date))[0];
  const currentActions = actions.filter((a) => a.fixtureId === opportunity?.fixtureId);
  const historical = validation.cases[0];
  return <main>
    <NavTabs />
    <header className="caseOverviewHero">
      <span className="eyebrow">{es ? "CASO LONDON CITY · PROTOTIPO INDEPENDIENTE" : "LONDON CITY CASE · INDEPENDENT PROTOTYPE"}</span>
      <h1>{es ? "Qué sabemos y qué toca hacer ahora." : "What we know. What happens next."}</h1>
      <p>{es ? "Una propuesta comercial apoyada en fuentes públicas. Todavía sin ejecución del club ni impacto comercial medido." : "A commercial proposal supported by public sources. Club execution and measured commercial impact are still pending."}</p>
      <p className="caseReviewDate">{es ? "Revisión manual de evidencia:" : "Manual evidence review:"} <time dateTime={reviewedAt}>{date(reference)} 2026</time> · {es ? "Horarios de Londres" : "London local times"}</p>
    </header>
    <section className="caseOverviewGrid" aria-label={es ? "Estado del caso" : "Case status"}>
      <article><span>{es ? "ÚLTIMO RESULTADO" : "LATEST RESULT"}</span><h2>{recent[0]?.opponent}</h2><strong>{recent[0]?.result ? `${recent[0].result.for}–${recent[0].result.against}` : "—"}</strong><p>{recent[0] ? date(recent[0].date) : "—"} · {es ? "marcador a favor de London City" : "score from London City's perspective"}</p></article>
      <article><span>{es ? "SIGUIENTE PARTIDO" : "NEXT MATCH"}</span><h2>{next?.opponent ?? "—"}</h2><strong>{next ? `${date(next.date)} · ${next.kickoff}` : "—"}</strong><p>{next?.venue} · {next?.homeAway === "home" ? (es ? "en casa" : "home") : (es ? "fuera de casa" : "away")}</p></article>
      <article><span>{es ? "PRÓXIMO EN CASA" : "NEXT HOME MATCH"}</span><h2>{opportunity?.fixture.opponent ?? "—"}</h2><strong>{opportunity ? `${date(opportunity.fixture.date)} · ${opportunity.fixture.kickoff}` : "—"}</strong><p>{opportunity?.fixture.venue}</p></article>
    </section>
    <section className="caseOverviewPanel">
      <span className="eyebrow">{es ? "OPORTUNIDAD ACTUAL · BORRADOR" : "CURRENT OPPORTUNITY · DRAFT"}</span>
      <h2>{es ? `${opportunity?.fixture.opponent}: una razón para volver a Bromley.` : `${opportunity?.fixture.opponent}: a reason to return to Bromley.`}</h2>
      <p>{es ? "El club ya anuncia Oktoberfest y una zona familiar sin alcohol. La propuesta del motor es probar mensajes diferenciados para familias y aficionados que repiten, usando la oferta oficial." : "The club is promoting Oktoberfest and an alcohol-free family area. The engine proposes testing separate messages for families and returning supporters using the official offer."}</p>
      <p><strong>{es ? "Pendiente:" : "Pending:"}</strong> {es ? "responsable del club, audiencia con consentimiento y medición de compras. No hay campaña activada ni presupuesto aprobado." : "club owner, consented audience and purchase measurement. No campaign is activated and no budget is approved."}</p>
      <div className="caseOverviewLinks"><Link href="/opportunity">{es ? "Ver propuesta y bloqueos →" : "View proposal and blockers →"}</Link><a href="https://www.londoncitylionesses.com/everton-h-2627" target="_blank" rel="noreferrer">{es ? "Oferta oficial ↗" : "Official offer ↗"}</a></div>
    </section>
    <section className="caseOverviewPanel">
      <h2>{es ? "Tres pasos para avanzar" : "Three steps to move forward"}</h2>
      <div className="caseOverviewGrid">{currentActions.map((a) => <article key={a.id}><span>{date(a.due)} · {a.area}</span><h3>{a.title[lang]}</h3><p>{es ? "Propuesto · responsable del club pendiente" : "Proposed · club owner pending"}</p></article>)}</div>
    </section>
    <section className="caseOverviewPanel">
      <span className="eyebrow">{es ? "BRIGHTON · CASO HISTÓRICO" : "BRIGHTON · HISTORICAL CASE"}</span>
      <h2>{es ? "La hipótesis coincidió con un anuncio posterior del club." : "The hypothesis aligned with a later club announcement."}</h2>
      <p>{historical.observedAction[lang]}</p><p>{historical.caveat[lang]}</p>
      <p>{es ? "El partido ya pasó. La ejecución del watchalong, su asistencia y su efecto en ventas siguen pendientes de evidencia." : "The fixture has passed. Watchalong delivery, attendance and sales effects still need evidence."}</p>
      <div className="caseOverviewLinks"><Link href={`/results?fixture=${historical.fixtureId}`}>{es ? "Consultar resultados de Brighton →" : "Review Brighton results →"}</Link><a href={historical.observedSource.url} target="_blank" rel="noreferrer">{es ? "Anuncio oficial ↗" : "Official announcement ↗"}</a></div>
    </section>
    <section className="caseOverviewPanel">
      <h2>{es ? "Lo que falta para demostrar valor" : "What is missing to prove value"}</h2>
      <ul><li>{es ? "Asistencia y ventas de partidos posteriores al estreno." : "Attendance and ticket sales after the opener."}</li><li>{es ? "Compradores con consentimiento y repetición entre partidos." : "Consented buyers and repeat attendance across fixtures."}</li><li>{es ? "Campaña vinculada a compra, acceso y costes reales." : "Campaign links to purchase, scans and actual costs."}</li><li>{es ? "Comparación válida para evaluar impacto adicional." : "A credible comparison to assess incremental impact."}</li></ul>
      <div className="caseOverviewLinks"><Link href="/measurement">{es ? "Ver estado de medición →" : "View measurement status →"}</Link><Link href="/sources">{es ? "Consultar fuentes →" : "Inspect sources →"}</Link><Link href="/today">{es ? "Abrir seguimiento operativo →" : "Open operational tracking →"}</Link></div>
    </section>
  </main>;
}
