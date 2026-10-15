"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
import { FIRST_TOUCH_KEY, leadAttribution } from "@/lib/firstTouch";
import ed from "./editorial.module.css";
import styles from "./ClubPilotProposition.module.css";

type LeadState = "idle" | "submitting" | "success" | "error";

export function ClubPilotProposition() {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [leadState, setLeadState] = useState<LeadState>("idle");
  const [leadError, setLeadError] = useState("");

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadState("submitting");
    setLeadError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    let storedFirstTouch: string | null = null;
    try { storedFirstTouch = window.localStorage.getItem(FIRST_TOUCH_KEY); } catch { storedFirstTouch = null; }
    const attribution = leadAttribution(window.location.search, storedFirstTouch);

    const response = await fetch("/api/commercial-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubName: data.get("clubName"),
        role: data.get("role"),
        workEmail: data.get("workEmail"),
        priority: data.get("priority"),
        consent: data.get("consent") === "yes",
        website: data.get("website"),
        sourcePath: window.location.pathname,
        ...attribution
      })
    }).catch(() => null);

    if (!response?.ok) {
      const payload = await response?.json().catch(() => null) as { error?: string } | null;
      setLeadError(payload?.error || (es ? "No se ha podido enviar. Inténtalo de nuevo." : "Your request could not be sent. Please try again."));
      setLeadState("error");
      return;
    }

    form.reset();
    setLeadState("success");
  }

  return <main className={ed.surface} data-editorial>
    <MarketingNav variant="board" />

    <header className={`${ed.board} ${styles.board}`}>
      <div className={`${ed.titleTile} ${styles.titleTile}`}>
        <div className={styles.titleMeta}>
          <LanguageSwitcher />
          <p className={ed.tileMeta}>{es ? "Para equipos de marketing y comercial · Piloto del Opportunity Engine" : "For marketing & commercial teams · Opportunity Engine pilot"}</p>
        </div>
        <h1>{es ? "Mira qué podría cambiar tus próximos 4\u2060–\u20606 partidos." : "See what could change your next 4\u2060–\u20606 matches."}</h1>
      </div>
      <div className={`${ed.leadTile} ${styles.leadTile}`}>
        <p>{es ? "Un piloto apunta AVELA a tus propios partidos: las señales externas alrededor de cada uno, unidas a tu demanda, derechos y disponibilidad. Antes de cada partido el equipo recibe qué cambió, por qué importa y qué movimiento conviene preparar; el piloto mide si esos movimientos fueron mejores. Trabaja con el stack actual: no hay que integrarlo todo para empezar." : "A pilot points AVELA at your own fixtures: the external signals around each one, joined with your demand, rights and availability. Before every match the team gets what changed, why it matters and the move worth preparing — and the pilot measures whether those moves were better. It works with the existing stack: nothing has to be integrated first."}</p>
        <a className={ed.lightButton} href="#demo">{es ? "Solicitar un piloto →" : "Request a club pilot →"}</a>
      </div>
      <div className={`${ed.accentTile} ${styles.scopeTile}`}>
        <p className={styles.scope}>{es ? "4–6 partidos · 1–2 decisiones prioritarias · medición acordada antes" : "4–6 fixtures · 1–2 priority decisions · measurement agreed up front"}</p>
        <div className={ed.actions}>
          <Link className={ed.textLink} href="/app/demo?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=hero">{es ? "Probar la demo guiada →" : "Try the guided demo →"}</Link>
          <Link className={ed.textLink} href="/pilot?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero">{es ? "Ver cómo funciona →" : "See how the pilot works →"}</Link>
        </div>
      </div>
    </header>

    <section className={styles.gets} aria-labelledby="gets-title">
      <h2 id="gets-title">{es ? "La señal que importa antes. Aprendizaje utilizable después." : "The signal that matters before. Reusable learning after."}</h2>
      <div className={styles.fields}>
        <article className={styles.beforeField}>
          <h3>{es ? "Antes de actuar" : "Before action"}</h3>
          <p>{es ? "Qué cambió alrededor del partido, por qué importa y un movimiento preparado con audiencia, mensaje, responsable, bloqueos y plan de medición. Nada se activa sin aprobación humana." : "What changed around the match, why it matters and one prepared move with audience, message, owner, blockers and measurement plan. Nothing activates without human approval."}</p>
        </article>
        <article className={styles.afterField}>
          <h3>{es ? "Después de actuar" : "After action"}</h3>
          <p>{es ? "Qué se ejecutó, qué cambió, qué evidencia existe y qué debe cambiar en la siguiente decisión. Sin convertir correlación en causalidad." : "What was executed, what changed, what evidence exists and what should change in the next decision — without turning correlation into causality."}</p>
        </article>
      </div>
    </section>

    <section className={styles.reads} aria-labelledby="engine-reads-title">
      <h2 id="engine-reads-title">{es ? "Lo que ya lee hoy, y lo que se conecta en un piloto." : "What it reads today, and what connects in a pilot."}</h2>
      <div className={styles.readRows}>
        <article>
          <h3>{es ? "Hoy, con fuentes públicas" : "Today, from public sources"}</h3>
          <p>{es ? "Previsión meteorológica, eventos en la ciudad y fútbol que compite por la misma franja, calendario y anuncios del club, ventanas internacionales, noticias públicas y cortes de carretera y tren de TfL, revisados a diario." : "Weather forecasts, city events and football competing for the same slot, the club calendar and announcements, international windows, public news, and TfL road and rail disruption, checked daily."}</p>
        </article>
        <article>
          <h3>{es ? "En el piloto, con acceso del club" : "In the pilot, with club access"}</h3>
          <p>{es ? "Rutas de viaje en directo y feeds de National Rail, agregados de CRM y ticketing, derechos y obligaciones con partners, y disponibilidad de jugadoras y staff. Hasta conectarse se muestran como no conectados, nunca se rellenan." : "Live journey routing and National Rail feeds, CRM and ticketing aggregates, partner rights and obligations, and player and staff availability. Until connected they are shown as not connected, never filled in."}</p>
        </article>
      </div>
    </section>

    <section className={styles.start} aria-labelledby="start-title">
      <div className={styles.startStatement}>
        <h2 id="start-title">{es ? "No hace falta conectar todo para empezar." : "You do not need to connect everything before starting."}</h2>
        <p>{es ? "Empieza con lo que ya tienes. AVELA no necesita nombres o emails de aficionados para demostrar el flujo de decisión. Los permisos y cualquier acceso privado se acuerdan antes de transferir datos." : "Start with what you already have. AVELA does not need supporter names or emails to prove the decision workflow. Permissions and any private-data access are agreed before transfer."}</p>
      </div>
      <ol className={styles.startRows}>
        <li><h3>{es ? "Contexto público" : "Public context"}</h3><p>{es ? "Calendario, oferta, campañas y señales públicas permiten formular y priorizar hipótesis." : "Calendar, offer, campaigns and public signals are enough to form and prioritise hypotheses."}</p></li>
        <li><h3>{es ? "Agregados autorizados" : "Authorised aggregates"}</h3><p>{es ? "Compras, accesos, repetición e ingresos agregados mejoran la revisión del resultado." : "Aggregate purchases, scans, repeat visits and revenue improve outcome review."}</p></li>
        <li><h3>{es ? "Activación en el club" : "Club-side activation"}</h3><p>{es ? "El club mantiene audiencias, consentimiento y ejecución en sus propias herramientas." : "The club keeps audiences, consent and execution inside its own tools."}</p></li>
      </ol>
    </section>

    <section className={styles.cycle} aria-labelledby="cycle-title">
      <h2 id="cycle-title">{es ? "Definir. Probar. Aprender." : "Define. Test. Learn."}</h2>
      <ol className={styles.cycleSteps}>
        <li><strong>{es ? "Definir" : "Define"}</strong><p>{es ? "Elegir objetivo, ventana, uno o dos flujos, responsables, KPI y límites de medición." : "Choose the objective, window, one or two workflows, owners, KPI and measurement boundaries."}</p></li>
        <li><strong>{es ? "Probar" : "Test"}</strong><p>{es ? "Tomar decisiones reales con el stack actual, registrando qué se aprobó y qué se ejecutó." : "Make real decisions with the existing stack, recording what was approved and what was actually executed."}</p></li>
        <li><strong>{es ? "Aprender" : "Learn"}</strong><p>{es ? "Comparar recomendación, ejecución y resultado para decidir si continuar, ajustar o parar." : "Compare recommendation, execution and outcome to decide whether to continue, adjust or stop."}</p></li>
      </ol>
    </section>

    <section className={styles.proof} aria-labelledby="proof-title">
      <h2 id="proof-title">{es ? "London City muestra el método sin fingir acceso privado." : "London City shows the method without pretending to have private access."}</h2>
      <aside className={styles.proofNotes}>
        <p><strong>{es ? "Prueba pública independiente." : "Independent public proof."}</strong> {es ? "London City es un caso de demostración independiente. No implica que el club sea cliente, haya visto AVELA o haya utilizado la herramienta." : "London City is an independent demonstration case. It does not imply the club is a customer or has seen or used AVELA."}</p>
        <p>{es ? "La demostración pública muestra cómo debería cambiar la decisión entre Brighton, Everton, Crystal Palace y Manchester City a medida que cambian el contexto, la evidencia y las restricciones." : "The public demonstration shows how the decision should change across Brighton, Everton, Crystal Palace and Manchester City as context, evidence and constraints change."}</p>
      </aside>
      <div className={styles.proofRows}>
        <article>
          <h3>Everton</h3>
          <p>{es ? "Una decisión propuesta con bloqueos, audiencia pendiente y siguiente acción visible." : "A proposed decision with blockers, audience dependency and next action made visible."}</p>
          <Link className={ed.textLink} href="/live/london-city/everton?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=live_case&utm_content=everton">{es ? "Ver decisión propuesta →" : "View the proposed decision →"}</Link>
        </article>
        <article>
          <h3>Brighton</h3>
          <p>{es ? "Una hipótesis de AVELA registrada antes de una acción pública comparable del club." : "An AVELA hypothesis time-stamped before a comparable public club action."}</p>
          <Link className={ed.textLink} href="/live/london-city/brighton?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=live_case&utm_content=brighton">{es ? "Ver comparación →" : "View the comparison →"}</Link>
        </article>
        <Link className={ed.textLink} href="/pilot?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=multi_cycle_proof">{es ? "Ver la demostración pública de 4 ciclos →" : "See the 4-cycle public demonstration →"}</Link>
      </div>
    </section>

    <section className={styles.request} id="demo" aria-labelledby="discussion-title">
      <div className={styles.requestIntro}>
        <h2 id="discussion-title">{es ? "Cuéntanos qué decisión quieres mejorar." : "Tell us which decision you want to improve."}</h2>
        <p>{es ? "Cuatro datos bastan para iniciar la conversación. No pedimos datos de aficionados ni acceso a sistemas en este paso." : "Four details are enough to start the conversation. No supporter data or system access is requested at this stage."}</p>
        <div className={styles.requestLinks}>
          <Link className={ed.textLink} href="/app/demo?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=next_step">{es ? "Probar la demo guiada →" : "Try the guided demo →"}</Link>
          <Link className={ed.textLink} href="/pilot?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=next_step">{es ? "Ver estructura del piloto →" : "See the pilot structure →"}</Link>
        </div>
      </div>

      {leadState === "success" ? (
        <div className={styles.success} role="status">
          <strong>{es ? "Solicitud recibida." : "Request received."}</strong>
          <p>{es ? "Ya tenemos el contexto básico para revisar si AVELA encaja con ese flujo." : "We now have the basic context needed to review whether AVELA fits that workflow."}</p>
          <Link className={ed.textLink} href="/app/demo?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=lead_success">{es ? "Mientras tanto, prueba la demo guiada →" : "Meanwhile, try the guided demo →"}</Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={submitLead}>
          <label>
            <span>{es ? "Club" : "Club"}</span>
            <input name="clubName" autoComplete="organization" maxLength={120} required />
          </label>
          <label>
            <span>{es ? "Tu función" : "Your role"}</span>
            <input name="role" autoComplete="organization-title" maxLength={120} placeholder={es ? "Marketing, CRM, Commercial…" : "Marketing, CRM, Commercial…"} required />
          </label>
          <label className={styles.wide}>
            <span>{es ? "Email de trabajo" : "Work email"}</span>
            <input name="workEmail" type="email" autoComplete="email" spellCheck={false} maxLength={254} required />
          </label>
          <label className={styles.wide}>
            <span>{es ? "Prioridad (opcional)" : "Priority (optional)"}</span>
            <select name="priority" defaultValue="">
              <option value="">{es ? "Selecciona si ya lo sabes" : "Choose if you already know"}</option>
              <option value="Matchday & ticketing">Matchday & ticketing</option>
              <option value="CRM & fan engagement">CRM & fan engagement</option>
              <option value="Sponsorship & commercial">Sponsorship & commercial</option>
              <option value="Player & content assets">Player & content assets</option>
              <option value="Campaign planning">Campaign planning</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className={styles.commercialHoneypot} aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>

          <label className={styles.consent}>
            <input name="consent" type="checkbox" value="yes" required />
            <span>{es ? "Acepto que AVELA use estos datos para responder a mi solicitud de piloto. No se solicitan datos de aficionados." : "I agree that AVELA may use these details to respond to my pilot request. No supporter data is requested."}</span>
          </label>

          <div className={styles.submitRow}>
            <button className={ed.coralButton} type="submit" disabled={leadState === "submitting"}>
              {leadState === "submitting" ? (es ? "Enviando…" : "Sending…") : (es ? "Solicitar conversación →" : "Request a conversation →")}
            </button>
            <span>{es ? "Sin migración ni compromiso." : "No migration or commitment."}</span>
          </div>
          {leadState === "error" ? <p className={styles.error} role="alert">{leadError}</p> : null}
        </form>
      )}
    </section>

    <MarketingFooter />
  </main>;
}
