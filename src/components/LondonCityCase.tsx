"use client";

import Link from "next/link";
import { MarketingNav } from "./MarketingNav";
import { useLanguage } from "./LanguageProvider";
import styles from "./LondonCityLive.module.css";
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
    <main className={styles.shell}>
      <MarketingNav />
      <div className={styles.content}>
        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>{es ? "LONDON CITY LIVE · CASO PÚBLICO" : "LONDON CITY LIVE · PUBLIC CASE"}</span>
            <h1>{es ? "Lo que vio el motor antes del partido. Lo que ocurrió después." : "What the engine saw before the match. What happened next."}</h1>
            <p>
              {es
                ? "Seguimos un contexto real de club con fuentes públicas: qué detecta el motor, qué recomienda y qué evidencia aparece después. La coincidencia no implica que el club haya visto o utilizado este producto."
                : "We follow a real club context using public sources: what the engine detects, what it recommends and what evidence appears afterwards. Alignment never implies the club saw or used this product."}
            </p>
          </div>
          <aside className={styles.review}>
            <span>{es ? "Última revisión de evidencia" : "Latest evidence review"}</span>
            <strong>{date(reference)}</strong>
            <small>{latestResult ? `${es ? "Último resultado" : "Latest result"} · ${latestResult.opponent} ${latestResult.result ? `${latestResult.result.for}–${latestResult.result.against}` : ""}` : (es ? "Caso independiente · horarios de Londres" : "Independent case · London local times")}</small>
          </aside>
        </header>

        <section className={styles.current}>
          <div className={styles.currentHead}>
            <div>
              <span className={styles.eyebrow}>{es ? "AHORA" : "NOW"}</span>
              <h2>{opportunity ? `London City v ${opportunity.fixture.opponent}` : (es ? "Siguiente caso en preparación" : "Next case in preparation")}</h2>
            </div>
            <span>{opportunity ? `${date(opportunity.fixture.date)} · ${opportunity.fixture.kickoff}` : ""}</span>
          </div>

          <div className={styles.storyGrid}>
            <article>
              <span>{es ? "01 · QUÉ VIO EL MOTOR" : "01 · WHAT THE ENGINE SAW"}</span>
              <h3>{opportunity?.opportunity ?? (es ? "Sin oportunidad activa." : "No active opportunity.")}</h3>
              <p>{opportunity?.whyNow ?? ""}</p>
            </article>
            <article>
              <span>{es ? "02 · QUÉ RECOMENDÓ" : "02 · WHAT IT RECOMMENDED"}</span>
              <h3>{opportunity?.recommendedAction ?? (es ? "Sin recomendación activa." : "No active recommendation.")}</h3>
              <p>{opportunity?.nextAction.label ?? ""}</p>
              {opportunity ? <Link href={`/app/matches/${opportunity.fixtureId}`}>{es ? "Ver el plan operativo →" : "See the operational plan →"}</Link> : null}
            </article>
            <article>
              <span>{es ? "03 · QUÉ SABEMOS DE VERDAD" : "03 · WHAT WE ACTUALLY KNOW"}</span>
              <h3>{opportunity?.confidence.label ?? "—"} {es ? "confianza" : "confidence"}</h3>
              <p>{opportunity?.primaryBlocker ?? (es ? "Sin bloqueador declarado." : "No declared blocker.")}</p>
            </article>
          </div>
        </section>

        <section className={styles.now}>
          <article>
            <span className={styles.eyebrow}>{es ? "CASO ACTUAL" : "CURRENT CASE"}</span>
            <h2>{es ? "Everton: probar una razón para volver a Bromley." : "Everton: test a reason to return to Bromley."}</h2>
            <p>
              {es
                ? "London City ha publicado una propuesta de Oktoberfest y una zona familiar sin alcohol. El motor plantea comprobar si ese contexto puede ayudar a generar repetición, con mensajes diferenciados y sin asumir demanda que todavía no está medida."
                : "London City has published an Oktoberfest proposition and an alcohol-free family area. The engine proposes testing whether that context can support repeat attendance, with separate messages and without assuming demand that has not been measured."}
            </p>
            <div className={styles.actions}>
              {currentActions.map((item) => (
                <div key={item.id}>
                  <span>{date(item.due)} · {item.area}</span>
                  <strong>{item.title[lang]}</strong>
                </div>
              ))}
            </div>
          </article>

          <article>
            <span className={styles.eyebrow}>{es ? "ESTADO" : "STATUS"}</span>
            <h2>{opportunity?.decisionState ?? "HOLD"}</h2>
            <p>
              {es
                ? "No hay campaña activada ni presupuesto aprobado desde este prototipo. El caso muestra una recomendación y los gaps de evidencia necesarios para convertirla en una decisión de club."
                : "No campaign is activated and no budget is approved from this prototype. The case shows a recommendation and the evidence gaps required to turn it into a club decision."}
            </p>
            <div className={styles.actions}>
              <div><Link href="/live/london-city/everton">{es ? "Leer el caso actual →" : "Read the current case →"}</Link></div>
              <div><a href="https://www.londoncitylionesses.com/everton-h-2627" target="_blank" rel="noreferrer">{es ? "Ver la oferta oficial ↗" : "See the official offer ↗"}</a></div>
            </div>
          </article>
        </section>

        <section className={styles.history}>
          <div className={styles.historyHead}>
            <span className={styles.eyebrow}>{es ? "ARCHIVO DEL CASO" : "CASE JOURNAL"}</span>
            <h2>{es ? "Hipótesis anteriores y lo que apareció después." : "Earlier hypotheses and what appeared afterwards."}</h2>
            <p>
              {es
                ? "Registramos tanto coincidencias como diferencias. El objetivo es comprobar si el motor detecta oportunidades relevantes antes de acciones públicas comparables."
                : "We record both alignment and divergence. The goal is to test whether the engine surfaces relevant opportunities before comparable public actions."}
            </p>
          </div>

          <article className={styles.historyCard}>
            <time dateTime={historical.hypothesisGeneratedAt}>{date(historical.hypothesisGeneratedAt.slice(0, 10))}</time>
            <div>
              <h3>{historical.title[lang]}</h3>
              <p>{historical.hypothesis[lang]}</p>
            </div>
            <Link href="/live/london-city/brighton">{es ? "Ver caso →" : "Open case →"}</Link>
          </article>

          <div className={styles.principle}>
            <span>{es ? "REGLA DE EVIDENCIA" : "EVIDENCE RULE"}</span>
            <strong>{validation.principle[lang]}</strong>
            <p>{historical.caveat[lang]}</p>
          </div>
        </section>

        <footer className={styles.footer}>
          <Link href="/">{es ? "← Volver al producto" : "← Back to product"}</Link>
          <Link href="/for-clubs">{es ? "Ver propuesta para clubes →" : "See the club proposition →"}</Link>
        </footer>
      </div>
    </main>
  );
}
