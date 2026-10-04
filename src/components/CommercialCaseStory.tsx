"use client";

import Link from "next/link";
import { MarketingNav } from "./MarketingNav";
import { useLanguage } from "./LanguageProvider";
import type { CalendarFixture, CampaignPlan, DecisionValidationData } from "@/lib/models";

type ValidationCase = DecisionValidationData["cases"][number];

export function CommercialCaseStory({ kind, fixture, campaign, validation }: {
  kind: "everton" | "brighton";
  fixture: CalendarFixture;
  campaign: Pick<CampaignPlan, "objective" | "whyNow" | "audiences" | "approvals" | "schedule" | "nextApproval">;
  validation?: ValidationCase;
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const everton = kind === "everton";
  const date = new Date(fixture.date + "T12:00:00Z").toLocaleDateString(es ? "es-ES" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
  const comparison = [
    [es ? "Oportunidad" : "Opportunity", es ? "Alargar la jornada con Inglaterra–España." : "Extend the football day with England v Spain.", es ? "Anunció un watchalong después de Brighton." : "Announced a watchalong after Brighton.", es ? "Coincidencia de propuesta" : "Proposition alignment"],
    [es ? "Ejecución" : "Execution", es ? "Contemplaba una extensión con un establecimiento local." : "Considered an extension with a local viewing partner.", es ? "Anunció la actividad en el propio recinto." : "Announced the activity at the ground.", es ? "Diferencia operativa" : "Operational difference"],
    [es ? "Entrega real" : "Actual delivery", es ? "Necesita comprobar que la actividad se realizó." : "Requires evidence that the activity ran.", es ? "El anuncio no demuestra ejecución." : "An announcement does not establish delivery.", es ? "Sin verificar" : "Unverified"],
    [es ? "Resultado comercial" : "Commercial outcome", es ? "Medir asistencia, ventas y repetición." : "Measure attendance, sales and repeat visits.", es ? "No hay resultados comerciales conectados a la demo pública." : "No commercial outcomes are connected to the public demo.", es ? "Sin medir" : "Not measured"]
  ];
  return <main>
    <MarketingNav />
    <header className="caseOverviewHero">
      <Link href="/live/london-city">← {es ? "Resumen London City" : "London City overview"}</Link>
      <p className="eyebrow">{everton ? (es ? "DECISIÓN PROPUESTA · NO ACTIVADA" : "PROPOSED DECISION · NOT ACTIVATED") : (es ? "APRENDIZAJE HISTÓRICO · IMPACTO SIN MEDIR" : "HISTORICAL LEARNING · IMPACT NOT MEASURED")}</p>
      <h1>{everton ? (es ? "Everton: probar una razón para volver." : "Everton: test a reason to return.") : (es ? "Brighton: qué coincidió y qué falta demostrar." : "Brighton: what aligned and what remains unproven.")}</h1>
      <p>{date} · {fixture.kickoff} · {fixture.venue} · {es ? "hora local de Londres" : "London local time"}</p>
      <p>{everton ? campaign.objective[lang] : validation?.learning[lang]}</p>
    </header>

    {everton ? <>
      <section className="caseOverviewPanel">
        <span className="eyebrow">{es ? "LA DECISIÓN" : "THE DECISION"}</span>
        <h2>{es ? "Revisar una prueba de repetición. No aprobar inversión todavía." : "Review a repeat-visit test. Do not approve spend yet."}</h2>
        <p>{campaign.whyNow[lang]}</p>
        <p>{es ? "Oktoberfest es el contexto publicado por el club. Que ese contexto motive una segunda visita es nuestra hipótesis, no un resultado observado." : "Oktoberfest is context published by the club. Whether it motivates a second visit is our hypothesis, not an observed outcome."}</p>
        <a href="https://www.londoncitylionesses.com/everton-h-2627" target="_blank" rel="noreferrer">{es ? "Consultar la oferta oficial ↗" : "Read the official offer ↗"}</a>
      </section>
      <section className="caseOverviewPanel">
        <h2>{es ? "Para quién y con qué mensaje" : "For whom, with which message"}</h2>
        <div className="commercialTwoColumns">
          <article><h3>{es ? "Aficionados que podrían repetir" : "Potential returning supporters"}</h3><p>{campaign.audiences[0]?.label[lang]}</p><p>{es ? "Primero comprobar compras y consentimiento. Excluir a quienes ya compraron Everton. El tamaño de la audiencia está pendiente." : "First validate purchases and consent. Exclude people who already bought Everton. Audience size is still unknown."}</p></article>
          <article><h3>{es ? "Familias locales" : "Local families"}</h3><p>{es ? "Explicar la opción familiar sin alcohol por separado. No asumir que el mensaje de Oktoberfest encaja con todas las familias." : "Explain the alcohol-free family option separately. Do not assume Oktoberfest messaging suits every family."}</p><p>{es ? "Usar la oferta oficial, sin inventar descuentos o paquetes." : "Use the official offer; do not invent discounts or packages."}</p></article>
        </div>
      </section>
      <section className="caseOverviewPanel">
        <h2>{es ? "Qué debe quedar aprobado" : "What must be approved"}</h2>
        <ul>{campaign.approvals.map((gate) => <li key={gate.id}>{gate.label[lang]}</li>)}</ul>
        <p><strong>{es ? "Siguiente paso: " : "Next step: "}</strong>{campaign.nextApproval[lang]}</p>
        <p>{es ? "Los responsables son roles propuestos; todavía no hay personas asignadas por el club." : "Owners are proposed roles; the club has not assigned people yet."}</p>
      </section>
      <section className="caseOverviewPanel">
        <h2>{es ? "Cómo sabremos si funciona" : "How we would know whether it works"}</h2>
        <div className="commercialTableWrap"><table className="commercialTable"><caption>{es ? "Plan de medición propuesto; umbrales a acordar antes de activar." : "Proposed measurement plan; thresholds must be agreed before activation."}</caption><thead><tr><th>{es ? "Pregunta" : "Question"}</th><th>{es ? "Medición" : "Measurement"}</th><th>{es ? "Límite" : "Limit"}</th></tr></thead><tbody>
          <tr><th>{es ? "¿Hay intención?" : "Is there intent?"}</th><td>{es ? "Clics únicos al enlace oficial etiquetado." : "Unique clicks to the tagged official ticket link."}</td><td>{es ? "Un clic no es una compra." : "A click is not a purchase."}</td></tr>
          <tr><th>{es ? "¿Compran y asisten?" : "Do they buy and attend?"}</th><td>{es ? "Compras atribuibles, accesos y ausencias." : "Attributed purchases, scans and no-shows."}</td><td>{es ? "Requiere datos autorizados de ticketing." : "Requires authorised ticketing evidence."}</td></tr>
          <tr><th>{es ? "¿Vuelven más?" : "Do more people return?"}</th><td>{es ? "Repetición Brighton–Everton entre personas elegibles." : "Brighton-to-Everton repeat visits among eligible supporters."}</td><td>{es ? "Necesita audiencia comparable y un grupo de referencia válido." : "Needs a comparable audience and credible comparison group."}</td></tr>
        </tbody></table></div>
        <p>{es ? "Continuar, cambiar o detener la prueba según los criterios acordados. No afirmar ventas adicionales solo por encontrar un identificador de campaña." : "Continue, change or stop the test against pre-agreed criteria. A campaign identifier alone does not establish additional sales."}</p>
      </section>
    </> : <>
      <section className="caseOverviewPanel">
        <h2>{es ? "Una hipótesis anterior a un anuncio comparable" : "A hypothesis preceding a comparable announcement"}</h2>
        <div className="commercialTwoColumns"><article><span className="eyebrow">{validation?.hypothesisGeneratedAt.slice(0,10)} · {es ? "MOTOR" : "ENGINE"}</span><p>{validation?.hypothesis[lang]}</p></article><article><span className="eyebrow">{validation?.observedAt} · {es ? "CLUB" : "CLUB"}</span><p>{validation?.observedAction[lang]}</p>{validation ? <a href={validation.observedSource.url} target="_blank" rel="noreferrer">{es ? "Anuncio oficial ↗" : "Official announcement ↗"}</a> : null}</article></div>
        <p><strong>{validation?.caveat[lang]}</strong></p>
      </section>
      <section className="caseOverviewPanel"><h2>{es ? "Comparación sin exagerar la evidencia" : "Compare without overstating the evidence"}</h2><div className="commercialTableWrap"><table className="commercialTable"><caption>{es ? "Propuesta del motor frente al anuncio público del club" : "Engine proposal compared with the public club announcement"}</caption><thead><tr><th>{es ? "Dimensión" : "Dimension"}</th><th>{es ? "Motor" : "Engine"}</th><th>{es ? "Club / evidencia" : "Club / evidence"}</th><th>{es ? "Lectura" : "Interpretation"}</th></tr></thead><tbody>{comparison.map((row) => <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1).map((value,index) => <td key={index}>{value}</td>)}</tr>)}</tbody></table></div></section>
      <section className="caseOverviewPanel"><h2>{es ? "Qué aprendemos para el siguiente partido" : "What we learn for the next fixture"}</h2><p>{es ? "La coincidencia apoya la relevancia de detectar ocasiones que prolongan la jornada. No valida todavía su rentabilidad. Para Everton, la hipótesis debe definir audiencia, oferta, aprobación y medición antes de activarse." : "Alignment supports the relevance of finding occasions that extend matchday. It does not establish profitability. For Everton, the hypothesis must specify audience, offer, approval and measurement before activation."}</p><p>{es ? "Brighton queda cerrado como ventana de activación previa, pero abierto como revisión de resultados pendientes. No marcamos el watchalong como realizado sin evidencia." : "Brighton's pre-match activation window is closed, but the outcome review remains open. Watchalong delivery is not marked complete without evidence."}</p><Link href={`/app/learning?fixture=${fixture.id}`}>{es ? "Ver resultados disponibles y datos pendientes →" : "View available results and missing evidence →"}</Link></section>
    </>}
    <section className="caseOverviewPanel"><h2>{es ? "Del ejemplo a un piloto de club" : "From example to a club pilot"}</h2><p>{es ? "London City demuestra el método, no una relación comercial ni resultados causales. Un piloto autorizado permitiría contrastarlo con datos agregados reales." : "London City demonstrates the method, not a commercial relationship or causal outcomes. An authorised pilot would test it with real aggregate club evidence."}</p><div className="caseOverviewLinks"><Link href="/for-clubs">{es ? "Ver propuesta para clubes →" : "View the club proposition →"}</Link><Link href={everton ? "/live/london-city/brighton" : "/live/london-city/everton"}>{everton ? (es ? "Comparar con Brighton →" : "Compare with Brighton →") : (es ? "Ver la decisión de Everton →" : "View the Everton decision →")}</Link></div></section>
  </main>;
}
