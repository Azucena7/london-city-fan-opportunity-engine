"use client";

import Link from "next/link";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";
import { useLanguage } from "./LanguageProvider";
import ed from "./editorial.module.css";
import styles from "./LondonCityLive.module.css";
import type { CalendarFixture, DecisionValidationData, LocalizedText } from "@/lib/models";
import type { ProductOpportunity } from "@/lib/productOpportunity";

// London City Live, on the shared editorial system: the hero board, then one field of colour
// per question (what the engine reads now, the current case, the proof timeline, the journal).
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
  const date = (value: string) => new Date(value + "T12:00:00Z").toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London"
  });
  const reference = reviewedAt.slice(0, 10);
  const latestResult = calendar.filter((item) => item.status === "final").sort((a, b) => b.date.localeCompare(a.date))[0];
  const currentActions = actions.filter((item) => item.fixtureId === opportunity?.fixtureId).slice(0, 3);
  const historical = validation.cases[0];

  return (
    <main className={ed.surface} data-editorial>
      <MarketingNav variant="board" />

      <section className={`${ed.board} ${styles.board}`} aria-labelledby="live-title">
        <div className={`${ed.titleTile} ${styles.titleTile}`}>
          <ul className={ed.tileMeta} aria-label={es ? "Encuadre" : "Framing"}>
            <li>{es ? "Demo pública · London City" : "Public demo · London City"}</li>
            <li>{es ? "Independiente, no cliente" : "Independent, not a customer"}</li>
          </ul>
          <h1 id="live-title">{es ? "Señal, decisión y evidencia, en público." : "Signal, decision and evidence, in public."}</h1>
        </div>
        <div className={`${ed.leadTile} ${styles.leadTile}`}>
          <p>
            {es
              ? "Seguimos un contexto real de club con fuentes públicas: qué detecta el motor, qué recomienda y qué evidencia aparece después. La coincidencia no implica que el club haya visto o utilizado este producto."
              : "We follow a real club context using public sources: what the engine detects, what it recommends and what evidence appears afterwards. Alignment never implies the club saw or used this product."}
          </p>
          <Link className={ed.lightButton} href="/live/london-city/everton">{es ? "Leer el caso actual" : "Read the current case"}</Link>
        </div>
        <div className={`${ed.accentTile} ${styles.reviewTile}`}>
          <p>
            <span>{es ? "Última revisión de evidencia" : "Latest evidence review"}</span>
            <strong>{date(reference)}</strong>
          </p>
          <small>{latestResult ? `${es ? "Último resultado" : "Latest result"} · ${latestResult.opponent} ${latestResult.result ? `${latestResult.result.for}–${latestResult.result.against}` : ""}` : (es ? "Caso independiente · horarios de Londres" : "Independent case · London local times")}</small>
        </div>
      </section>

      <section className={styles.read} aria-labelledby="read-title">
        <header className={styles.readHead}>
          <p>{es ? "Ahora" : "Now"}{opportunity ? ` · ${date(opportunity.fixture.date)} · ${opportunity.fixture.kickoff}` : ""}</p>
          <h2 id="read-title">{opportunity ? `London City v ${opportunity.fixture.opponent}` : (es ? "Siguiente caso en preparación" : "Next case in preparation")}</h2>
        </header>
        <div className={styles.readRows}>
          <article>
            <h3>{es ? "Qué vio el motor" : "What the engine saw"}</h3>
            <div>
              <strong>{opportunity?.opportunity ?? (es ? "Sin oportunidad activa." : "No active opportunity.")}</strong>
              {opportunity?.whyNow ? <p>{opportunity.whyNow}</p> : null}
            </div>
          </article>
          <article>
            <h3>{es ? "Qué recomendó" : "What it recommended"}</h3>
            <div>
              <strong>{opportunity?.recommendedAction ?? (es ? "Sin recomendación activa." : "No active recommendation.")}</strong>
              {opportunity?.nextAction.label ? <p>{opportunity.nextAction.label}</p> : null}
              {opportunity ? <Link className={ed.textLink} href={`/app/matches/${opportunity.fixtureId}`}>{es ? "Abrir esta demo en el workspace ↗" : "Open this demo in the workspace ↗"}</Link> : null}
            </div>
          </article>
          <article>
            <h3>{es ? "Qué sabemos de verdad" : "What we actually know"}</h3>
            <div>
              <strong>{opportunity?.confidence.label ?? "—"} {es ? "confianza" : "confidence"}</strong>
              <p>{opportunity?.primaryBlocker ?? (es ? "Sin bloqueador declarado." : "No declared blocker.")}</p>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.current} aria-label={es ? "Caso actual" : "Current case"}>
        <article className={styles.caseField}>
          <p className={styles.fieldLabel}>{es ? "Caso actual" : "Current case"}</p>
          <h2>{es ? "Everton: probar una razón para volver a Bromley." : "Everton: test a reason to return to Bromley."}</h2>
          <p>
            {es
              ? "London City ha publicado una propuesta de Oktoberfest y una zona familiar sin alcohol. El motor plantea comprobar si ese contexto puede ayudar a generar repetición, con mensajes diferenciados y sin asumir demanda que todavía no está medida."
              : "London City has published an Oktoberfest proposition and an alcohol-free family area. The engine proposes testing whether that context can support repeat attendance, with separate messages and without assuming demand that has not been measured."}
          </p>
          {currentActions.length ? (
            <ul className={styles.caseActions}>
              {currentActions.map((item) => (
                <li key={item.id}>
                  <span>{date(item.due)} · {item.area}</span>
                  <strong>{item.title[lang]}</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className={styles.statusField}>
          <p className={styles.fieldLabel}>{es ? "Estado" : "Status"}</p>
          <h2>{opportunity?.decisionState ?? "HOLD"}</h2>
          <p>
            {es
              ? "No hay campaña activada ni presupuesto aprobado desde esta demo independiente. El caso muestra una recomendación y los gaps de evidencia necesarios para convertirla en una decisión de club."
              : "No campaign is activated and no budget is approved from this independent demo. The case shows a recommendation and the evidence gaps required to turn it into a club decision."}
          </p>
          <div className={styles.statusLinks}>
            <Link className={ed.inkButton} href="/live/london-city/everton">{es ? "Leer el caso actual" : "Read the current case"}</Link>
            <a className={ed.textLink} href="https://www.londoncitylionesses.com/everton-h-2627" target="_blank" rel="noreferrer">{es ? "Ver la oferta oficial ↗" : "See the official offer ↗"}</a>
          </div>
        </article>
      </section>

      <section className={styles.proof} aria-labelledby="proof-title">
        <h2 id="proof-title">{es ? "Qué dijo AVELA, qué publicó el club y qué sigue sin demostrarse." : "What AVELA said, what the club published, and what still remains unproven."}</h2>
        <ol className={styles.proofSteps} aria-label="Evidence timeline">
          <li data-tone="engine">
            <span>AVELA</span>
            <strong>{historical.hypothesisGeneratedAt ? date(historical.hypothesisGeneratedAt.slice(0, 10)) : "—"}</strong>
            <p>{historical.hypothesis[lang]}</p>
          </li>
          <li data-tone="club">
            <span>{es ? "Anuncio público" : "Public club action"}</span>
            <strong>{historical.observedAt ? date(historical.observedAt) : "—"}</strong>
            <p>{historical.observedAction[lang]}</p>
          </li>
          <li data-tone="read">
            <span>{es ? "Lectura" : "Interpretation"}</span>
            <strong>{es ? "Coincidencia relevante, no causalidad" : "Relevant alignment, not causality"}</strong>
            <p>{historical.caveat[lang]}</p>
          </li>
          <li data-tone="now">
            <span>{es ? "Siguiente prueba" : "Next test"}</span>
            <strong>Everton · 18 Oct</strong>
            <p>{es ? "Probar repetición usando el contexto público de Oktoberfest y la zona familiar, sin asumir demanda ni impacto." : "Test repeat attendance using the public Oktoberfest and family-area context, without assuming demand or impact."}</p>
          </li>
        </ol>
      </section>

      <section className={styles.journal} aria-labelledby="journal-title">
        <div className={styles.journalIntro}>
          <p className={styles.fieldLabel}>{es ? "Archivo del caso" : "Case journal"}</p>
          <h2 id="journal-title">{es ? "Hipótesis anteriores y lo que apareció después." : "Earlier hypotheses and what appeared afterwards."}</h2>
          <p>
            {es
              ? "Registramos tanto coincidencias como diferencias. El objetivo es comprobar si el motor detecta oportunidades relevantes antes de acciones públicas comparables."
              : "We record both alignment and divergence. The goal is to test whether the engine surfaces relevant opportunities before comparable public actions."}
          </p>
        </div>
        <div className={styles.journalEntries}>
          <article className={styles.entry}>
            <time dateTime={historical.hypothesisGeneratedAt}>{date(historical.hypothesisGeneratedAt.slice(0, 10))}</time>
            <h3>{historical.title[lang]}</h3>
            <p>{historical.hypothesis[lang]}</p>
            <Link className={ed.textLink} href="/live/london-city/brighton">{es ? "Ver caso ↗" : "Open case ↗"}</Link>
          </article>
          <aside className={styles.principle}>
            <p className={styles.fieldLabel}>{es ? "Regla de evidencia" : "Evidence rule"}</p>
            <strong>{validation.principle[lang]}</strong>
          </aside>
        </div>
      </section>

      <section className={styles.close} aria-label={es ? "Siguiente paso" : "Next step"}>
        <div className={ed.actions}>
          <Link className={ed.coralButton} href="/for-clubs">{es ? "Ver propuesta para clubes" : "See the club proposition"}</Link>
          <Link className={ed.textLink} href="/">{es ? "Volver al producto" : "Back to product"}</Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
