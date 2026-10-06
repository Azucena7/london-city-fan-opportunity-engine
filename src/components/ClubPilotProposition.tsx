"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { MarketingNav } from "./MarketingNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

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
    const params = new URLSearchParams(window.location.search);

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
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
        utmContent: params.get("utm_content")
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

  return <main className="productShell commercialShell">
    <MarketingNav />
    <div className="commercialLanguage"><LanguageSwitcher /></div>

    <header className="commercialHero">
      <p className="eyebrow">{es ? "PARA EQUIPOS DE MARKETING Y COMERCIAL · PILOTO PROPUESTO" : "FOR MARKETING & COMMERCIAL TEAMS · PROPOSED PILOT"}</p>
      <h1>{es ? "Prueba mejores decisiones antes de integrar más." : "Prove better decisions before integrating more."}</h1>
      <p>{es ? "Empieza con 4–6 partidos o una campaña acotada y uno o dos flujos reales del equipo. AVELA trabaja con el stack actual, añade el contexto que falta y hace visible qué decisión tomar, quién debe moverla y cómo aprender del resultado." : "Start with 4–6 fixtures or a bounded campaign window and one or two real team workflows. AVELA works with the existing stack, adds the missing context and makes clear what to decide, who should move it and how to learn from the result."}</p>
      <p className="commercialScope">{es ? "4–6 partidos o campaña · 1–2 flujos · un objetivo prioritario" : "4–6 fixtures or campaign · 1–2 workflows · one priority objective"}</p>
      <div className="caseOverviewLinks">
        <a className="productButton" href="#demo">{es ? "Solicitar un piloto →" : "Request a club pilot →"}</a>
        <Link href="/app/demo?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=hero">{es ? "Probar la demo guiada →" : "Try the guided demo →"}</Link>
        <Link href="/pilot?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero">{es ? "Ver cómo funciona →" : "See how the pilot works →"}</Link>
      </div>
    </header>

    <section className="commercialPanel">
      <p className="eyebrow">{es ? "QUÉ RECIBE EL CLUB" : "WHAT THE CLUB GETS"}</p>
      <h2>{es ? "Una mejor decisión antes. Aprendizaje utilizable después." : "A better decision before. Reusable learning after."}</h2>
      <div className="commercialTwoColumns">
        <article>
          <h3>{es ? "Antes de actuar" : "Before action"}</h3>
          <p>{es ? "Una vista de decisión con oportunidad, audiencia, mensaje, responsable, bloqueos y plan de medición. La recomendación no activa nada sin aprobación humana." : "A decision view with opportunity, audience, message, owner, blockers and measurement plan. The recommendation activates nothing without human approval."}</p>
        </article>
        <article>
          <h3>{es ? "Después de actuar" : "After action"}</h3>
          <p>{es ? "Qué se ejecutó, qué cambió, qué evidencia existe y qué debe cambiar en la siguiente decisión. Sin convertir correlación en causalidad." : "What was executed, what changed, what evidence exists and what should change in the next decision — without turning correlation into causality."}</p>
        </article>
      </div>
    </section>

    <section className="commercialPanel">
      <p className="eyebrow">{es ? "EMPIEZA CON LO QUE YA TIENES" : "START WITH WHAT YOU ALREADY HAVE"}</p>
      <h2>{es ? "No hace falta conectar todo para empezar." : "You do not need to connect everything before starting."}</h2>
      <div className="commercialThreeColumns">
        <article><span>01</span><h3>{es ? "Contexto público" : "Public context"}</h3><p>{es ? "Calendario, oferta, campañas y señales públicas permiten formular y priorizar hipótesis." : "Calendar, offer, campaigns and public signals are enough to form and prioritise hypotheses."}</p></article>
        <article><span>02</span><h3>{es ? "Agregados autorizados" : "Authorised aggregates"}</h3><p>{es ? "Compras, accesos, repetición e ingresos agregados mejoran la revisión del resultado." : "Aggregate purchases, scans, repeat visits and revenue improve outcome review."}</p></article>
        <article><span>03</span><h3>{es ? "Activación en el club" : "Club-side activation"}</h3><p>{es ? "El club mantiene audiencias, consentimiento y ejecución en sus propias herramientas." : "The club keeps audiences, consent and execution inside its own tools."}</p></article>
      </div>
      <p className="commercialNote">{es ? "AVELA no necesita nombres o emails de aficionados para demostrar el flujo de decisión. Los permisos y cualquier acceso privado se acuerdan antes de transferir datos." : "AVELA does not need supporter names or emails to prove the decision workflow. Permissions and any private-data access are agreed before transfer."}</p>
    </section>

    <section className="commercialPanel">
      <p className="eyebrow">{es ? "UN TEST ACOTADO" : "A BOUNDED TEST"}</p>
      <h2>{es ? "Definir. Probar. Aprender." : "Define. Test. Learn."}</h2>
      <ol className="commercialSteps">
        <li><strong>{es ? "Definir" : "Define"}</strong><p>{es ? "Elegir objetivo, ventana, uno o dos flujos, responsables, KPI y límites de medición." : "Choose the objective, window, one or two workflows, owners, KPI and measurement boundaries."}</p></li>
        <li><strong>{es ? "Probar" : "Test"}</strong><p>{es ? "Tomar decisiones reales con el stack actual, registrando qué se aprobó y qué se ejecutó." : "Make real decisions with the existing stack, recording what was approved and what was actually executed."}</p></li>
        <li><strong>{es ? "Aprender" : "Learn"}</strong><p>{es ? "Comparar recomendación, ejecución y resultado para decidir si continuar, ajustar o parar." : "Compare recommendation, execution and outcome to decide whether to continue, adjust or stop."}</p></li>
      </ol>
    </section>

    <section className="commercialPanel">
      <p className="eyebrow">{es ? "PRUEBA PÚBLICA INDEPENDIENTE" : "INDEPENDENT PUBLIC PROOF"}</p>
      <h2>{es ? "London City muestra el método sin fingir acceso privado." : "London City shows the method without pretending to have private access."}</h2>
      <div className="commercialTwoColumns">
        <article>
          <h3>Everton</h3>
          <p>{es ? "Una decisión propuesta con bloqueos, audiencia pendiente y siguiente acción visible." : "A proposed decision with blockers, audience dependency and next action made visible."}</p>
          <Link href="/live/london-city/everton?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=live_case&utm_content=everton">{es ? "Ver decisión propuesta →" : "View the proposed decision →"}</Link>
        </article>
        <article>
          <h3>Brighton</h3>
          <p>{es ? "Una hipótesis de AVELA registrada antes de una acción pública comparable del club." : "An AVELA hypothesis time-stamped before a comparable public club action."}</p>
          <Link href="/live/london-city/brighton?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=live_case&utm_content=brighton">{es ? "Ver comparación →" : "View the comparison →"}</Link>
        </article>
      </div>
      <p className="commercialNote">{es ? "London City es un caso de demostración independiente. No implica que el club sea cliente, haya visto AVELA o haya utilizado la herramienta." : "London City is an independent demonstration case. It does not imply the club is a customer or has seen or used AVELA."}</p>
    </section>

    <section className="commercialPanel commercialNextStep" id="demo" aria-labelledby="discussion-title">
      <p className="eyebrow">{es ? "SOLICITAR PILOTO" : "REQUEST A PILOT"}</p>
      <h2 id="discussion-title">{es ? "Cuéntanos qué decisión quieres mejorar." : "Tell us which decision you want to improve."}</h2>
      <p>{es ? "Cuatro datos bastan para iniciar la conversación. No pedimos datos de aficionados ni acceso a sistemas en este paso." : "Four details are enough to start the conversation. No supporter data or system access is requested at this stage."}</p>

      {leadState === "success" ? (
        <div className="commercialLeadSuccess" role="status">
          <strong>{es ? "Solicitud recibida." : "Request received."}</strong>
          <p>{es ? "Ya tenemos el contexto básico para revisar si AVELA encaja con ese flujo." : "We now have the basic context needed to review whether AVELA fits that workflow."}</p>
          <Link href="/app/demo?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=lead_success">{es ? "Mientras tanto, prueba la demo guiada →" : "Meanwhile, try the guided demo →"}</Link>
        </div>
      ) : (
        <form className="commercialLeadForm" onSubmit={submitLead}>
          <div className="commercialLeadGrid">
            <label>
              <span>{es ? "Club" : "Club"}</span>
              <input name="clubName" autoComplete="organization" maxLength={120} required />
            </label>
            <label>
              <span>{es ? "Tu función" : "Your role"}</span>
              <input name="role" autoComplete="organization-title" maxLength={120} placeholder={es ? "Marketing, CRM, Commercial…" : "Marketing, CRM, Commercial…"} required />
            </label>
            <label>
              <span>{es ? "Email de trabajo" : "Work email"}</span>
              <input name="workEmail" type="email" autoComplete="email" maxLength={254} required />
            </label>
            <label className="commercialLeadWide">
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
          </div>

          <label className="commercialHoneypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>

          <label className="commercialConsent">
            <input name="consent" type="checkbox" value="yes" required />
            <span>{es ? "Acepto que AVELA use estos datos para responder a mi solicitud de piloto. No se solicitan datos de aficionados." : "I agree that AVELA may use these details to respond to my pilot request. No supporter data is requested."}</span>
          </label>

          <div className="commercialSubmitRow">
            <button className="productButton" type="submit" disabled={leadState === "submitting"}>
              {leadState === "submitting" ? (es ? "Enviando…" : "Sending…") : (es ? "Solicitar conversación →" : "Request a conversation →")}
            </button>
            <span>{es ? "Sin migración ni compromiso." : "No migration or commitment."}</span>
          </div>
          {leadState === "error" ? <p className="commercialLeadError" role="alert">{leadError}</p> : null}
        </form>
      )}

      <div className="caseOverviewLinks commercialSecondaryLinks">
        <Link href="/app/demo?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=next_step">{es ? "Probar la demo guiada →" : "Try the guided demo →"}</Link>
        <Link href="/pilot?utm_source=for_clubs&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=next_step">{es ? "Ver estructura del piloto →" : "See the pilot structure →"}</Link>
      </div>
    </section>
  </main>;
}
