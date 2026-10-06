"use client";

import Link from "next/link";
import { MarketingNav } from "./MarketingNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

export function ClubPilotProposition() {
  const { lang } = useLanguage();
  const es = lang === "es";

  return <main className="productShell commercialShell">
    <MarketingNav />
    <div className="commercialLanguage"><LanguageSwitcher /></div>
    <header className="commercialHero">
      <p className="eyebrow">{es ? "PARA EQUIPOS DE MARKETING Y COMERCIAL · PILOTO PROPUESTO" : "FOR MARKETING & COMMERCIAL TEAMS · PROPOSED PILOT"}</p>
      <h1>{es ? "Demuestra mejores decisiones del club antes de añadir más integración." : "Prove better club decisions before adding more integration."}</h1>
      <p>{es ? "Empieza con 4–6 partidos o una campaña acotada y uno o dos flujos de marketing/comercial. Mantén el stack actual, añade solo el contexto que mejora la decisión y compara recomendación, ejecución y aprendizaje." : "Start with 4–6 fixtures or a bounded campaign window and one or two marketing/commercial workflows. Keep the existing stack, add only the context that improves the decision, then compare recommendation, execution and learning."}</p>
      <p className="commercialScope">{es ? "4–6 partidos o campaña acotada · 1–2 flujos · un objetivo prioritario" : "4–6 fixtures or campaign window · 1–2 workflows · one priority objective"}</p>
      <p>{es ? "Alcance a acordar según el calendario del club. Es una propuesta de trabajo, no una promesa de crecimiento ni un piloto ya contratado." : "Scope to agree against the club calendar. This is a working proposal, not a growth guarantee or a contracted pilot."}</p>
      <div className="caseOverviewLinks"><Link className="productButton" href="/pilot">{es ? "Ver cómo funciona el piloto →" : "See how the pilot works →"}</Link></div>
      <p><Link href="/app/demo">{es ? "Probar la demo guiada de 3 minutos →" : "Try the 3-minute guided demo →"}</Link></p>
    </header>

    <section className="commercialPanel">
      <h2>{es ? "Qué recibe el club" : "What the club receives"}</h2>
      <div className="commercialTwoColumns">
        <article><h3>{es ? "Antes: una decisión, no otra lista de señales" : "Before: a decision, not another signal list"}</h3><p>{es ? "Ficha de decisión con oportunidad, audiencia propuesta, mensaje, responsable, bloqueos y plan de medición. No activa campañas sin aprobación." : "A decision view with the opportunity, proposed audience, message, owner, blockers and measurement plan. No campaign activation without approval."}</p></article>
        <article><h3>{es ? "Después: aprender sin exagerar resultados" : "After: learn without overstating outcomes"}</h3><p>{es ? "Revisión de lo ejecutado y del KPI acordado. Separar atribución de incremento; registrar también pruebas sin resultado o sin datos." : "Review delivery and the agreed KPI. Separate attribution from incremental change; record tests with no result or missing data too."}</p></article>
      </div>
      <p>{es ? "Incluye una revisión de preparación, un conjunto acotado de fichas de decisión y un cierre del piloto con recomendaciones para continuar, ajustar o detener." : "Includes a readiness review, a focused set of decision views and a pilot review recommending whether to continue, adjust or stop."}</p>
    </section>

    <section className="commercialPanel">
      <h2>{es ? "Qué datos hacen falta — y para qué" : "Which data is needed — and why"}</h2>
      <div className="commercialTableWrap"><table className="commercialTable"><caption>{es ? "Empezar con lo disponible; no confundir una propuesta con medición real." : "Start with available evidence; do not confuse a proposal with real measurement."}</caption><thead><tr><th>{es ? "Nivel" : "Level"}</th><th>{es ? "Información" : "Information"}</th><th>{es ? "Qué permite" : "What it enables"}</th></tr></thead><tbody>
        <tr><th scope="row">{es ? "Público" : "Public"}</th><td>{es ? "Calendario, oferta oficial y contexto público con fuente y fecha." : "Calendar, official offer and public context with source and date."}</td><td>{es ? "Formular y priorizar hipótesis. No medir ventas atribuibles." : "Form and prioritise hypotheses. Not measure attributed sales."}</td></tr>
        <tr><th scope="row">{es ? "Agregado autorizado" : "Authorised aggregate"}</th><td>{es ? "Compras, accesos y repetición por partido y cohorte; ingresos si están disponibles." : "Purchases, scans and repeat visits by fixture and cohort; revenue if available."}</td><td>{es ? "Revisar resultados con definiciones comparables y límites explícitos." : "Review outcomes with comparable definitions and explicit limits."}</td></tr>
        <tr><th scope="row">{es ? "Activación en el club" : "Club-side activation"}</th><td>{es ? "Audiencia elegible, consentimiento, exclusiones y mensaje aprobados por el club." : "Eligible audience, consent, exclusions and messaging approved by the club."}</td><td>{es ? "Ejecutar desde sus herramientas; devolver solo evidencia agregada al entorno piloto." : "Execute in the club's tools; return only aggregate evidence to the pilot environment."}</td></tr>
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
      <p>{es ? "London City es un caso de demostración independiente. No implica que el club sea cliente, haya visto esta demo o la haya utilizado." : "London City is an independent demonstration case. It does not imply the club is a customer or has seen or used this demo."}</p>
    </section>

    <section className="commercialPanel" id="demo" aria-labelledby="discussion-title">
      <p className="eyebrow">{es ? "SIGUIENTE PASO" : "NEXT STEP"}</p>
      <h2 id="discussion-title">{es ? "Explora un piloto AVELA sin cambiar tu stack." : "Explore an AVELA pilot without changing your stack."}</h2>
      <p>{es ? "Empieza entendiendo el alcance, viendo la demo y decidiendo si uno o dos flujos reales del equipo merecen probarse durante una ventana acotada." : "Start by understanding the scope, seeing the product and deciding whether one or two real team workflows are worth testing in a bounded window."}</p>
      <div className="caseOverviewLinks">
        <Link className="productButton" href="/pilot">{es ? "Ver estructura del piloto →" : "See the pilot structure →"}</Link>
        <Link href="/app/demo">{es ? "Probar la demo guiada →" : "Try the guided demo →"}</Link>
      </div>
      <p>{es ? "Cuando activemos el formulario de contacto, este será el punto para solicitar una conversación con AVELA. Hasta entonces no pedimos datos personales desde esta página." : "When the contact form is activated, this will be the point to request an AVELA conversation. Until then, this page does not collect personal data."}</p>
    </section>
  </main>;
}
