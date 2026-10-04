"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingNav } from "./MarketingNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

export function ClubPilotProposition() {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [goal, setGoal] = useState("repeat");
  const [readiness, setReadiness] = useState("public");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const goals = es ? { repeat: "Repetición de visita", attendance: "Asistencia", revenue: "Ingresos por partido" } : { repeat: "Repeat visits", attendance: "Attendance", revenue: "Matchday revenue" };
  const dataOptions = es ? { public: "Solo datos públicos por ahora", aggregate: "Datos agregados disponibles, sujetos a autorización", review: "Acceso a datos pendiente de revisión" } : { public: "Public data only for now", aggregate: "Aggregate data available, subject to authorisation", review: "Data access still under review" };
  const brief = [
    es ? "CONVERSACIÓN SOBRE UN PILOTO · PROPUESTA, NO APROBACIÓN" : "PILOT DISCUSSION · PROPOSAL, NOT APPROVAL",
    `${es ? "Objetivo prioritario" : "Priority objective"}: ${goals[goal as keyof typeof goals]}`,
    `${es ? "Disponibilidad de datos" : "Data readiness"}: ${dataOptions[readiness as keyof typeof dataOptions]}`,
    es ? "Alcance propuesto: 90 días y 6 partidos, sujeto al calendario y a un acuerdo con el club." : "Proposed scope: 90 days and 6 fixtures, subject to the club calendar and agreement.",
    es ? "A acordar: responsable, partidos, KPI, comparación, permisos, precio y umbrales para continuar o parar." : "To agree: owner, fixtures, KPI, comparison, permissions, price and continue/stop thresholds.",
    es ? "No compartir nombres, emails ni registros individuales. El club conserva audiencias y consentimiento; el prototipo recibe resultados agregados autorizados." : "Do not share names, emails or individual records. The club retains audiences and consent; the prototype receives authorised aggregate outcomes.",
    es ? "Sin resultados comerciales garantizados. Datos públicos por sí solos no validan conversión o repetición." : "No guaranteed commercial outcomes. Public data alone cannot establish conversion or repeat visits.",
    "https://avela-growth-intelligence.vercel.app/for-clubs"
  ].join("\n\n");

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  }

  return <main className="productShell commercialShell">
    <MarketingNav />
    <div className="commercialLanguage"><LanguageSwitcher /></div>
    <header className="commercialHero">
      <p className="eyebrow">{es ? "PARA CLUBES · PILOTO PROPUESTO" : "FOR CLUBS · PROPOSED PILOT"}</p>
      <h1>{es ? "Una decisión útil antes de cada partido. Evidencia después." : "A useful decision before each fixture. Evidence afterwards."}</h1>
      <p>{es ? "Conectar calendario, contexto y señales de afición para elegir qué probar, quién lo aprueba y cómo aprender del resultado." : "Connect the calendar, context and supporter signals to choose what to test, who approves it and how to learn from the outcome."}</p>
      <p className="commercialScope">{es ? "90 días · 6 partidos propuestos · un objetivo prioritario" : "90 days · 6 proposed fixtures · one priority objective"}</p>
      <p>{es ? "Alcance a acordar según el calendario del club. Es una propuesta de trabajo, no una promesa de crecimiento ni un piloto ya contratado." : "Scope to agree against the club calendar. This is a working proposal, not a growth guarantee or a contracted pilot."}</p>
      <div className="caseOverviewLinks"><a className="productButton" href="#demo">{es ? "Preparar la conversación →" : "Prepare the discussion →"}</a></div>
      <p><Link href="/app/demo">{es ? "Probar el espacio de cliente con datos de prueba →" : "Try the client workspace with test data →"}</Link></p>
    </header>

    <section className="commercialPanel">
      <h2>{es ? "Qué recibe el club" : "What the club receives"}</h2>
      <div className="commercialTwoColumns">
        <article><h3>{es ? "Antes: una decisión, no otra lista de señales" : "Before: a decision, not another signal list"}</h3><p>{es ? "Brief con oportunidad, audiencia propuesta, mensaje, responsable, bloqueos y plan de medición. No activa campañas sin aprobación." : "A brief with an opportunity, proposed audience, message, owner, blockers and measurement plan. No campaign activation without approval."}</p></article>
        <article><h3>{es ? "Después: aprender sin exagerar resultados" : "After: learn without overstating outcomes"}</h3><p>{es ? "Revisión de lo ejecutado y del KPI acordado. Separar atribución de incremento; registrar también pruebas sin resultado o sin datos." : "Review delivery and the agreed KPI. Separate attribution from incremental change; record tests with no result or missing data too."}</p></article>
      </div>
      <p>{es ? "Incluye una revisión de preparación, hasta seis fichas de decisión y un cierre del piloto con recomendaciones para continuar, ajustar o detener." : "Includes a readiness review, up to six decision briefs and a pilot review recommending whether to continue, adjust or stop."}</p>
    </section>

    <section className="commercialPanel">
      <h2>{es ? "Qué datos hacen falta — y para qué" : "Which data is needed — and why"}</h2>
      <div className="commercialTableWrap"><table className="commercialTable"><caption>{es ? "Empezar con lo disponible; no confundir una propuesta con medición real." : "Start with available evidence; do not confuse a proposal with real measurement."}</caption><thead><tr><th>{es ? "Nivel" : "Level"}</th><th>{es ? "Información" : "Information"}</th><th>{es ? "Qué permite" : "What it enables"}</th></tr></thead><tbody>
        <tr><th scope="row">{es ? "Público" : "Public"}</th><td>{es ? "Calendario, oferta oficial y contexto público con fuente y fecha." : "Calendar, official offer and public context with source and date."}</td><td>{es ? "Formular y priorizar hipótesis. No medir ventas atribuibles." : "Form and prioritise hypotheses. Not measure attributed sales."}</td></tr>
        <tr><th scope="row">{es ? "Agregado autorizado" : "Authorised aggregate"}</th><td>{es ? "Compras, accesos y repetición por partido y cohorte; ingresos si están disponibles." : "Purchases, scans and repeat visits by fixture and cohort; revenue if available."}</td><td>{es ? "Revisar resultados con definiciones comparables y límites explícitos." : "Review outcomes with comparable definitions and explicit limits."}</td></tr>
        <tr><th scope="row">{es ? "Activación en el club" : "Club-side activation"}</th><td>{es ? "Audiencia elegible, consentimiento, exclusiones y mensaje aprobados por el club." : "Eligible audience, consent, exclusions and messaging approved by the club."}</td><td>{es ? "Ejecutar desde sus herramientas; devolver solo evidencia agregada al prototipo." : "Execute in the club's tools; return only aggregate evidence to the prototype."}</td></tr>
      </tbody></table></div>
      <p>{es ? "No necesitamos nombres o emails de aficionados en esta web. Las cohortes pequeñas y los permisos se revisan antes de transferir datos. No hay acceso CRM o ticketing real conectado actualmente." : "This website does not need supporter names or emails. Small cohorts and permissions must be reviewed before any transfer. No live CRM or ticketing access is connected today."}</p>
    </section>

    <section className="commercialPanel">
      <h2>{es ? "Así se acuerda y se evalúa" : "How the pilot is agreed and evaluated"}</h2>
      <ol className="commercialSteps">
        <li><strong>{es ? "Definir" : "Define"}</strong><p>{es ? "Elegir el objetivo, los partidos, un responsable y el precio. Verificar datos y permisos antes de prometer medición." : "Choose the objective, fixtures, owner and price. Verify data and permissions before promising measurement."}</p></li>
        <li><strong>{es ? "Aprobar y probar" : "Approve and test"}</strong><p>{es ? "Acordar audiencia, comparación, KPI y umbrales antes de activar. Registrar cambios y lo realmente ejecutado." : "Agree audience, comparison, KPI and thresholds before activation. Record changes and actual delivery."}</p></li>
        <li><strong>{es ? "Decidir con evidencia" : "Decide with evidence"}</strong><p>{es ? "Revisar cada partido y el conjunto del piloto. Continuar, ajustar o parar; sin una comparación válida, no afirmar incremento causal." : "Review each fixture and the pilot overall. Continue, adjust or stop; without a valid comparison, do not claim causal uplift."}</p></li>
      </ol>
    </section>

    <section className="commercialPanel">
      <p className="eyebrow">{es ? "DEMO INDEPENDIENTE" : "INDEPENDENT DEMO"}</p><h2>{es ? "London City: ejemplo de cómo funciona el método" : "London City: an example of how the method works"}</h2>
      <div className="commercialTwoColumns"><article><h3>Everton</h3><p>{es ? "Una propuesta de repetición pendiente de audiencia, aprobación y tracking. No está activada." : "A repeat-visit proposal awaiting audience, approval and tracking. Not activated."}</p><Link href="/live/london-city/everton">{es ? "Ver decisión propuesta →" : "View the proposed decision →"}</Link></article><article><h3>Brighton</h3><p>{es ? "Una coincidencia entre hipótesis y anuncio público. Ejecución e impacto comercial aún no verificados." : "Alignment between a hypothesis and a public announcement. Delivery and commercial impact remain unverified."}</p><Link href="/live/london-city/brighton">{es ? "Ver comparación histórica →" : "View the historical comparison →"}</Link></article></div>
      <p>{es ? "London City es un caso de demostración independiente. No implica que el club sea cliente, haya visto el prototipo o lo haya utilizado." : "London City is an independent demonstration case. It does not imply the club is a customer or has seen or used the prototype."}</p>
    </section>

    <section className="commercialPanel" id="demo" aria-labelledby="discussion-title">
      <h2 id="discussion-title">{es ? "Solicitar una demo para el club" : "Request a club demo"}</h2>
      <p>{es ? "Selecciona el punto de partida y copia un resumen para compartir por tu propio canal. Estas selecciones no se envían ni solicitan datos personales." : "Select a starting point and copy a summary to share through your own channel. These selections are not submitted and request no personal data."}</p>
      <div className="commercialTwoColumns commercialFields">
        <label htmlFor="pilot-goal">{es ? "Objetivo prioritario" : "Priority objective"}<select id="pilot-goal" value={goal} onChange={(event) => { setGoal(event.target.value); setCopyState("idle"); }}>{Object.entries(goals).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
        <label htmlFor="pilot-data">{es ? "Disponibilidad de datos" : "Data readiness"}<select id="pilot-data" value={readiness} onChange={(event) => { setReadiness(event.target.value); setCopyState("idle"); }}>{Object.entries(dataOptions).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
      </div>
      <label className="commercialBriefLabel" htmlFor="pilot-brief">{es ? "Resumen listo para copiar" : "Summary ready to copy"}</label>
      <textarea id="pilot-brief" className="commercialBrief" readOnly value={brief} rows={13} />
      <button className="productButton" type="button" onClick={copyBrief}>{es ? "Copiar resumen" : "Copy summary"}</button>
      <p role="status" aria-live="polite">{copyState === "copied" ? (es ? "Resumen copiado. No se ha enviado ninguna solicitud." : "Summary copied. No request has been sent.") : copyState === "manual" ? (es ? "No se pudo acceder al portapapeles. Selecciona el resumen y cópialo manualmente." : "Clipboard access was unavailable. Select the summary and copy it manually.") : (es ? "Este resumen no reserva ni activa un piloto. Puedes copiarlo y compartirlo por el canal que prefieras." : "This summary does not book or activate a pilot. You can copy it and share it through your preferred channel.")}</p>
      <Link href="/pilot">{es ? "Consultar el detalle operativo del piloto →" : "Read the pilot operating detail →"}</Link>
    </section>
  </main>;
}
