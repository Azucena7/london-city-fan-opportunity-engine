"use client";

import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useLanguage } from "@/components/LanguageProvider";
import ed from "@/components/editorial.module.css";
import styles from "./LocalizedTechnicalCaseStudy.module.css";

type Localized = { en: string; es: string };

const phases: Array<{ version: string; title: Localized; text: Localized; output: Localized }> = [
  {
    version: "V1.0",
    title: { en: "Territory opportunity", es: "Oportunidad territorial" },
    text: { en: "940 LSOAs scored through family potential, girls' football networks, access and competition context.", es: "940 LSOAs puntuadas mediante potencial familiar, redes de fútbol femenino, acceso y contexto competitivo." },
    output: { en: "WHERE to acquire", es: "DÓNDE captar" }
  },
  {
    version: "V1.1",
    title: { en: "Live fixture context", es: "Contexto vivo de partido" },
    text: { en: "Canonical calendar, results, weather, travel friction and sourced material-change signals.", es: "Calendario canónico, resultados, meteorología, fricción de viaje y señales materiales con fuente." },
    output: { en: "WHEN to act", es: "CUÁNDO actuar" }
  },
  {
    version: "V1.2",
    title: { en: "Demand history", es: "Histórico de demanda" },
    text: { en: "An auditable 2025/26 attendance ledger, venue split and benchmark layer with source-state awareness.", es: "Ledger auditable de asistencia 2025/26, desglose por estadio y capa de benchmark consciente del estado de la fuente." },
    output: { en: "WHAT normal looks like", es: "QUÉ es normal" }
  },
  {
    version: "V1.3",
    title: { en: "Audience impact", es: "Impacto de audiencias" },
    text: { en: "Owned-channel signals are connected while broadcast and search remain separate evidence states that may be pending or unavailable.", es: "Las señales de canales propios están conectadas, mientras broadcast y búsqueda permanecen como estados de evidencia separados que pueden estar pendientes o no disponibles." },
    output: { en: "WHY attention moved", es: "POR QUÉ cambia la atención" }
  },
  {
    version: "V1.3b",
    title: { en: "CRM readiness", es: "Preparación para CRM" },
    text: { en: "Versioned ticket-level contract, synthetic Brighton rehearsal and time-bound post-match closure states.", es: "Contrato versionado por entrada, ensayo sintético de Brighton y estados de cierre postpartido por ventanas." },
    output: { en: "HOW conversion will close", es: "CÓMO cerrar conversión" }
  },
  {
    version: "V1.4",
    title: { en: "Signal-to-campaign", es: "De señal a campaña" },
    text: { en: "CampaignPlan contract, reusable playbooks, activation briefs, UTM joins, approvals and guardrails.", es: "Contrato CampaignPlan, playbooks reutilizables, briefs de activación, UTMs, aprobaciones y guardrails." },
    output: { en: "WHAT to execute", es: "QUÉ ejecutar" }
  },
  {
    version: "V1.5",
    title: { en: "Search demand observatory", es: "Observatorio de demanda de búsqueda" },
    text: { en: "Matched GB/Spain comparison sets, an intent ladder, activation links and evidence gates for travel products.", es: "Comparaciones equivalentes GB/España, escalera de intención, enlaces con activaciones y gates de evidencia para productos de viaje." },
    output: { en: "IF attention becomes demand", es: "SI la atención se convierte en demanda" }
  },
  {
    version: "V1.6",
    title: { en: "Experience demand validation", es: "Validación de demanda de experiencias" },
    text: { en: "Three configurable concepts, a non-personal intent event and launch gates that keep registration and sale blocked until approved.", es: "Tres conceptos configurables, un evento de intención sin datos personales y gates que bloquean registro y venta hasta su aprobación." },
    output: { en: "WHICH product merits a pilot", es: "QUÉ producto merece un piloto" }
  },
  {
    version: "V1.7",
    title: { en: "Mobility partnership layer", es: "Capa de partnerships de movilidad" },
    text: { en: "Three fixture pilots, corridor scoring, aggregate privacy thresholds and a shuttle economics simulator that never presents assumptions as quotes.", es: "Tres pilotos de partido, scoring de corredores, umbrales agregados de privacidad y un simulador económico que nunca presenta supuestos como cotizaciones." },
    output: { en: "WHETHER mobility merits partner review", es: "SI la movilidad merece revisión de partners" }
  },
  {
    version: "V1.8",
    title: { en: "Experiment measurement layer", es: "Capa de medición de experimentos" },
    text: { en: "Allowlisted anonymous events, test/production separation, provider-aware delivery and aggregate fixture cohorts with a minimum evidence threshold.", es: "Eventos anónimos con allowlist, separación test/producción, entrega consciente del proveedor y cohortes agregadas por partido con umbral mínimo." },
    output: { en: "WHEN a scenario becomes evidence", es: "CUÁNDO un escenario se convierte en evidencia" }
  },
  {
    version: "V1.9",
    title: { en: "Partner commercial pack", es: "Partner Commercial Pack" },
    text: { en: "Four candidate-specific narratives join pilots, evidence states, value exchange, KPIs and approval gates without implying outreach or endorsement.", es: "Cuatro narrativas por candidato conectan pilotos, estados de evidencia, intercambio de valor, KPIs y gates sin sugerir contacto ni endorsement." },
    output: { en: "HOW to frame an exploratory conversation", es: "CÓMO plantear una conversación exploratoria" }
  },
  {
    version: "V2.0",
    title: { en: "Decision validation", es: "Validación de decisiones" },
    text: { en: "Time-stamped engine hypotheses can now be compared with later observable club action, dimension by dimension and without claiming causation.", es: "Las hipótesis del engine con sello temporal pueden compararse con acciones posteriores observables del club, dimensión por dimensión y sin afirmar causalidad." },
    output: { en: "WHETHER hypotheses remain relevant in reality", es: "SI las hipótesis siguen siendo relevantes en la realidad" }
  },
  {
    version: "V2.1",
    title: { en: "Decision-first product architecture", es: "Arquitectura de producto orientada a decisiones" },
    text: { en: "Today, Calendar, Territories, Access, Experience, Measurement and Partnerships were reorganised around operator questions instead of feature inventory.", es: "Today, Calendar, Territories, Access, Experience, Measurement y Partnerships se reorganizaron alrededor de preguntas operativas en lugar de inventario de funcionalidades." },
    output: { en: "WHAT deserves attention now", es: "QUÉ merece atención ahora" }
  },
  {
    version: "V2.2",
    title: { en: "Decision reliability", es: "Fiabilidad de decisión" },
    text: { en: "Technical source health is mapped to the business decisions it supports, qualifies or blocks.", es: "La salud técnica de las fuentes se mapea a las decisiones de negocio que soporta, matiza o bloquea." },
    output: { en: "WHICH decisions can be trusted today", es: "QUÉ decisiones pueden confiarse hoy" }
  }
];

const states: Array<{ state: string; meaning: Localized; example: Localized }> = [
  { state: "public-verified", meaning: { en: "Observed in a cited public source.", es: "Observado en una fuente pública citada." }, example: { en: "Fixture, published attendance", es: "Partido, asistencia publicada" } },
  { state: "public-inferred", meaning: { en: "A planning inference, never a known customer fact.", es: "Inferencia de planificación, nunca un dato conocido del cliente." }, example: { en: "Territory or player-led audience", es: "Audiencia territorial o vinculada a jugadora" } },
  { state: "pending-source", meaning: { en: "Expected but not publicly available yet.", es: "Esperado pero todavía no disponible públicamente." }, example: { en: "TV audience, missing attendance", es: "Audiencia TV, asistencia ausente" } },
  { state: "source-unavailable", meaning: { en: "A capture failed without overwriting or inventing a value.", es: "Una captura falló sin sobrescribir ni inventar un valor." }, example: { en: "Rate-limited Google Trends baseline", es: "Baseline de Google Trends limitado temporalmente" } },
  { state: "validation-concept", meaning: { en: "A proposition can be tested but is not on sale.", es: "Una propuesta puede probarse, pero no está a la venta." }, example: { en: "Matchday, VIP and international concepts", es: "Conceptos matchday, VIP e internacional" } },
  { state: "modelled-scenario", meaning: { en: "A transparent planning assumption, not measured demand or a supplier quote.", es: "Un supuesto transparente de planificación, no demanda medida ni cotización de proveedor." }, example: { en: "Corridor score and shuttle economics", es: "Score de corredor y economía de shuttle" } },
  { state: "provider-not-configured", meaning: { en: "Events validate locally but are not stored or counted.", es: "Los eventos se validan localmente, pero no se almacenan ni cuentan." }, example: { en: "Experience and mobility telemetry", es: "Telemetría de experiencias y movilidad" } },
  { state: "prospecting-draft", meaning: { en: "A non-binding narrative for review, not outreach or a relationship.", es: "Una narrativa no vinculante para revisión, no contacto ni relación." }, example: { en: "Mobility and travel partner packs", es: "Packs de partners de movilidad y viaje" } },
  { state: "demo", meaning: { en: "Synthetic data that proves calculations only.", es: "Datos sintéticos que solo prueban cálculos." }, example: { en: "Brighton ticketing rehearsal", es: "Ensayo de ticketing de Brighton" } },
  { state: "requires-instrumentation", meaning: { en: "Measurable after UTMs or event tracking are deployed.", es: "Medible tras desplegar UTMs o seguimiento de eventos." }, example: { en: "Landing-page intent", es: "Intención en landing" } },
  { state: "requires-access", meaning: { en: "Needs an authorised club system.", es: "Necesita un sistema autorizado del club." }, example: { en: "Purchase, scan, no-show, repeat", es: "Compra, acceso, no-show, repetición" } }
];

const validations: Localized[] = [
  { en: "Fixture and campaign IDs must resolve to one canonical match.", es: "Los IDs de partido y campaña deben resolver al mismo partido canónico." },
  { en: "Missing public observations remain pending; they never become zero.", es: "Las observaciones públicas ausentes permanecen pendientes; nunca se convierten en cero." },
  { en: "A campaign cannot be ready while an approval gate is pending.", es: "Una campaña no puede estar lista mientras haya una aprobación pendiente." },
  { en: "Repository data cannot mark a campaign live or authorise spend.", es: "Los datos del repositorio no pueden marcar una campaña como live ni autorizar inversión." },
  { en: "UTM campaign keys must equal the canonical fixture key.", es: "Las claves UTM de campaña deben coincidir con la clave canónica del partido." },
  { en: "Purchase, scan and repeat cannot be claimed without authorised data.", es: "Compra, acceso y repetición no pueden declararse sin datos autorizados." },
  { en: "Hospitality gates cannot pass without measured downstream intent.", es: "Los gates de hospitality no pueden superarse sin intención posterior medida." },
  { en: "A validation concept cannot collect personal data, take deposits or claim inventory.", es: "Un concepto de validación no puede recoger datos personales, aceptar depósitos ni afirmar que existe inventario." },
  { en: "A mobility scenario cannot become a pilot without aggregated measured intent and an operator quote.", es: "Un escenario de movilidad no puede convertirse en piloto sin intención agregada medida y cotización del operador." },
  { en: "Addresses, postcodes and individual movements are prohibited from the partnership contract.", es: "Direcciones, códigos postales y movimientos individuales están prohibidos en el contrato de partnership." },
  { en: "Test events cannot contribute to a production cohort or partner-facing threshold.", es: "Los eventos de prueba no pueden contribuir a una cohorte de producción ni a un umbral para partners." },
  { en: "Unknown event properties are rejected before any provider delivery.", es: "Las propiedades de evento desconocidas se rechazan antes de cualquier entrega al proveedor." },
  { en: "A partner pack must expose verified, modelled, unmeasured and partner-dependent evidence together.", es: "Un partner pack debe mostrar conjuntamente evidencia verificada, modelada, no medida y dependiente del partner." },
  { en: "Repository data cannot imply candidate contact, endorsement, inventory, quote or approval.", es: "Los datos del repositorio no pueden sugerir contacto, endorsement, inventario, cotización ni aprobación." },
  { en: "Observed alignment between an engine hypothesis and later club action never implies causation, access or influence.", es: "La alineación observada entre una hipótesis del engine y una acción posterior del club nunca implica causalidad, acceso ni influencia." }
];

const contracts: Array<{ name: string; title: Localized; path: string; href: string }> = [
  { name: "CRM / ticketing", title: { en: "One ticket per row", es: "Una entrada por fila" }, path: "fixture → campaign → product → price → purchase → scan → consent-safe geography → repeat", href: "/api/contracts/crm-ticketing" },
  { name: "Campaign plan", title: { en: "One governed campaign", es: "Una campaña gobernada" }, path: "fixture → signals → audiences → playbooks → activations → UTMs → approvals → measurement", href: "/api/contracts/campaign-plan" },
  { name: "Search demand", title: { en: "One reproducible comparison", es: "Una comparación reproducible" }, path: "market → window → comparison set → term → dated index → activation → decision gate", href: "/api/contracts/search-demand" },
  { name: "Experience demand", title: { en: "One non-personal intent signal", es: "Una señal sin datos personales" }, path: "concept → fixture → origin → party → price → needs → gates → pilot decision", href: "/api/contracts/experience-demand" },
  { name: "Mobility partnership", title: { en: "One governed aggregate scenario", es: "Un escenario agregado y gobernado" }, path: "fixture → corridor → modelled score → aggregate threshold → quote → approval", href: "/api/contracts/mobility-partnership" },
  { name: "Experiment measurement", title: { en: "One allowlisted aggregate event", es: "Un evento permitido y agregado" }, path: "event → validate → deliver → deduplicate → cohort → threshold → review", href: "/api/contracts/experiment-measurement" },
  { name: "Partner commercial pack", title: { en: "One traceable non-binding pack", es: "Un dossier trazable y no vinculante" }, path: "candidate → fixture → evidence → value exchange → KPIs → gates → review", href: "/api/contracts/partner-commercial-pack" },
  { name: "Pilot readiness", title: { en: "One provisional governed decision", es: "Una decisión provisional y gobernada" }, path: "pack → score → owners → blockers → timeline → hold / go", href: "/api/contracts/pilot-readiness" }
];

const checks = ["validate:campaigns", "validate:crm-demo", "validate:public-signals", "validate:search-demand", "validate:experience-demand", "validate:mobility-partnership", "validate:experiment-measurement", "validate:partner-commercial-pack", "validate:pilot-readiness", "validate:source-health", "typecheck", "Vercel build"];

// The technical case study, on the shared editorial system: the hero board, then one field of
// colour per layer of the build. Every state and contract stays inspectable as text.
export function LocalizedTechnicalCaseStudy() {
  const { lang } = useLanguage();
  const es = lang === "es";
  const pick = (value: Localized) => value[es ? "es" : "en"];

  return (
    <main className={ed.surface} data-editorial>
      <MarketingNav variant="board" />

      <section className={`${ed.board} ${styles.board}`} aria-labelledby="technical-title">
        <div className={`${ed.titleTile} ${styles.titleTile}`}>
          <ul className={ed.tileMeta} aria-label={es ? "Versiones del caso de estudio" : "Case study versions"}>
            <li><Link href="/case-study">{es ? "Caso comercial" : "Commercial case"}</Link></li>
            <li aria-current="page">{es ? "Caso técnico" : "Technical case"}</li>
          </ul>
          <h1 id="technical-title">{es ? "Un motor de decisión auditable, paso a paso." : "An auditable decision engine, step by step."}</h1>
        </div>
        <div className={`${ed.leadTile} ${styles.leadTile}`}>
          <p>
            {es
              ? "Una explicación de las fuentes, contratos, estados de confianza, automatizaciones y salvaguardas que conectan un partido con una decisión y una campaña medible."
              : "A walkthrough of the sources, contracts, confidence states, automation and safeguards that connect a fixture to a decision and a measurable campaign."}
          </p>
          <Link className={ed.lightButton} href="/app">{es ? "Abrir el producto vivo" : "Open the live product"}</Link>
        </div>
        <div className={`${ed.accentTile} ${styles.principleTile}`}>
          <p>{es ? "Primero trazabilidad. Después automatización." : "Traceability first. Automation second."}</p>
          <Link className={ed.inkButton} href="/case-study">{es ? "Volver al caso comercial" : "Back to commercial case"}</Link>
        </div>
      </section>

      <section className={styles.axis} aria-labelledby="principles-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Principios de diseño" : "Design principles"}</p>
          <h2 id="principles-title">{es ? "Cuatro reglas antes de cualquier modelo." : "Four rules before any model."}</h2>
        </div>
        <dl className={styles.rows}>
          <div><dt>{es ? "Partido canónico" : "Canonical fixture"}</dt><dd>{es ? "Calendario, señal, audiencia, campaña y resultado comparten fixtureId." : "Calendar, signal, audience, campaign and outcome share one fixtureId."}</dd></div>
          <div><dt>{es ? "Estados explícitos" : "Explicit states"}</dt><dd>{es ? "Publicado, inferido, pendiente, demo y privado nunca se mezclan." : "Published, inferred, pending, demo and private data never collapse together."}</dd></div>
          <div><dt>{es ? "Último dato válido" : "Last valid observation"}</dt><dd>{es ? "Un fallo de fuente se registra sin borrar la última observación correcta." : "A source failure is logged without erasing the last correct observation."}</dd></div>
          <div><dt>{es ? "Humano en el circuito" : "Human in the loop"}</dt><dd>{es ? "La herramienta propone; responsables autorizados aprueban oferta, assets y presupuesto." : "The engine proposes; authorised owners approve offer, assets and budget."}</dd></div>
        </dl>
      </section>

      <section className={styles.architecture} aria-labelledby="architecture-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Arquitectura lógica" : "Logical architecture"}</p>
          <h2 id="architecture-title">{es ? "Cinco capas unidas por claves, no por suposiciones." : "Five layers joined by keys, not assumptions."}</h2>
          <p>{es ? "La futura conexión CRM entra en la capa de fuentes mediante un contrato versionado; no exige rehacer la lógica superior." : "A future CRM connection enters at the source layer through a versioned contract; it does not require rebuilding the layers above."}</p>
        </div>
        <ol className={styles.stack} reversed aria-label={es ? "Arquitectura de cinco capas, de arriba abajo" : "Five-layer architecture, top to bottom"}>
          <li><strong>{es ? "Decisión y campaña" : "Decision & campaign"}</strong><code>Today · Calendar · CampaignPlan · scorecard</code></li>
          <li><strong>{es ? "Modelos de decisión" : "Decision models"}</strong><code>Territory · demand · audience · matchweek</code></li>
          <li><strong>{es ? "Contratos y estados" : "Contracts & states"}</strong><code>fixtureId · campaignId · source · confidence</code></li>
          <li><strong>{es ? "Datos normalizados" : "Normalised data"}</strong><code>calendar · attendance · signals · journeys</code></li>
          <li><strong>{es ? "Fuentes" : "Sources"}</strong><code>club · WSL · weather · transport · YouTube · search</code></li>
        </ol>
      </section>

      <section className={styles.phases} aria-labelledby="phases-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Construcción por fases" : "Build phases"}</p>
          <h2 id="phases-title">{es ? "Cada incremento responde una pregunta nueva." : "Each increment answers a new question."}</h2>
        </div>
        <ol className={styles.phaseList}>
          {phases.map((phase) => (
            <li key={phase.version}>
              <span>{phase.version}</span>
              <div><h3>{pick(phase.title)}</h3><p>{pick(phase.text)}</p></div>
              <strong>{pick(phase.output)}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.sources} aria-labelledby="sources-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Fuentes y cadencia" : "Sources & cadence"}</p>
          <h2 id="sources-title">{es ? "Las fuentes públicas ya forman una capa operativa, con límites visibles." : "Public sources already form an operating layer, with visible limits."}</h2>
          <p>{es ? "La automatización consulta y conserva observaciones comparables. Cuando una fuente falla, muestra el fallo y mantiene el último valor válido." : "Automation checks and preserves comparable observations. When a source fails, it exposes the failure and retains the last valid value."}</p>
        </div>
        <div className={styles.sourceGrid}>
          <article><p className={styles.label}>{es ? "Diario" : "Daily"}</p><h3>{es ? "Calendario y resultados" : "Fixtures & results"}</h3><p>{es ? "Fuente oficial, cambios de horario y cierre postpartido." : "Official source, schedule changes and post-match closure."}</p></article>
          <article><p className={styles.label}>{es ? "Diario / ventanas" : "Daily / windows"}</p><h3>{es ? "Meteorología y viaje" : "Weather & travel"}</h3><p>{es ? "Actualización de matchweek sin convertir forecast en certeza." : "Matchweek refresh without treating a forecast as certainty."}</p></article>
          <article><p className={styles.label}>{es ? "Semanal + T±" : "Weekly + T±"}</p><h3>{es ? "Audiencia pública" : "Public audience"}</h3><p>{es ? "YouTube, búsquedas, broadcast y anotaciones de eventos." : "YouTube, search, broadcast and event annotations."}</p></article>
          <article><p className={styles.label}>{es ? "Postpartido" : "Post-match"}</p><h3>{es ? "Asistencia y benchmark" : "Attendance & benchmark"}</h3><p>{es ? "Observación oficial, muestra visible y mediana comparable." : "Official observation, visible sample and comparable median."}</p></article>
        </div>
      </section>

      <section className={styles.states} aria-labelledby="states-title">
        <p className={styles.label}>{es ? "Contrato de confianza" : "Trust contract"}</p>
        <h2 id="states-title">{es ? "La interfaz dice qué sabemos y qué no." : "The interface says what is, and is not, known."}</h2>
        <table className={styles.stateTable}>
          <caption className={ed.visuallyHidden}>{es ? "Estados de evidencia" : "Evidence states"}</caption>
          <thead><tr><th scope="col">{es ? "Estado" : "State"}</th><th scope="col">{es ? "Significado" : "Meaning"}</th><th scope="col">{es ? "Ejemplo" : "Example"}</th></tr></thead>
          <tbody>
            {states.map((item) => <tr key={item.state}><th scope="row"><code>{item.state}</code></th><td>{pick(item.meaning)}</td><td>{pick(item.example)}</td></tr>)}
          </tbody>
        </table>
      </section>

      <section className={styles.contracts} aria-labelledby="contracts-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Contratos de datos" : "Data contracts"}</p>
          <h2 id="contracts-title">{es ? "La integración futura ya tiene forma." : "The future integration already has a shape."}</h2>
          <p>{es ? "Aunque no exista acceso al CRM real, el producto define exactamente qué necesita, cómo se valida y qué cálculos habilita." : "Even without real CRM access, the product defines exactly what it needs, how it validates and which calculations it unlocks."}</p>
          <p className={styles.join}><code>fixture_id</code> → <code>campaign_id</code> → <code>ticket_id</code> → <code>scan</code> → <code>repeat_90d</code></p>
        </div>
        <div className={styles.contractGrid}>
          {contracts.map((item) => (
            <article key={item.href}>
              <p className={styles.label}>{item.name}</p>
              <h3>{pick(item.title)}</h3>
              <p className={styles.path}>{item.path}</p>
              <a className={ed.textLink} href={item.href} target="_blank" rel="noreferrer">{es ? "Abrir esquema JSON ↗" : "Open JSON schema ↗"}</a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.campaign} aria-labelledby="campaign-title">
        <p className={styles.label}>{es ? "De señal a campaña" : "Signal to campaign"}</p>
        <h2 id="campaign-title">{es ? "Brighton ejercita el recorrido completo sin fingir datos reales." : "Brighton exercises the full path without pretending demo data is real."}</h2>
        <ol className={styles.flow}>
          <li><strong>{es ? "Señales" : "Signals"}</strong><span>{es ? "Opener, horario, atención y meteorología." : "Opener, kickoff, attention and weather."}</span></li>
          <li><strong>{es ? "Brief" : "Brief"}</strong><span>{es ? "Audiencia, propuesta, oferta, assets y canales." : "Audience, proposition, offer, assets and channels."}</span></li>
          <li><strong>{es ? "Gobierno" : "Governance"}</strong><span>{es ? "Responsable, cuatro aprobaciones y ningún gasto automático." : "Owner, four approvals and no automatic spend."}</span></li>
          <li><strong>{es ? "Atribución" : "Attribution"}</strong><span>{es ? "UTMs y seis campaign IDs ejercitados en demo." : "UTMs and six campaign IDs exercised in demo."}</span></li>
          <li><strong>{es ? "Cierre" : "Closure"}</strong><span>{es ? "T+1, T+7, T+30, T+60 y T+90." : "T+1, T+7, T+30, T+60 and T+90."}</span></li>
        </ol>
      </section>

      <section className={styles.validation} aria-labelledby="validation-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Validación y guardrails" : "Validation & guardrails"}</p>
          <h2 id="validation-title">{es ? "El sistema bloquea conclusiones que los datos no soportan." : "The system blocks conclusions the data cannot support."}</h2>
          <ul className={styles.checks} aria-label={es ? "Comprobaciones automáticas" : "Automated checks"}>
            {checks.map((item) => <li key={item}><code>{item}</code></li>)}
          </ul>
        </div>
        <ul className={styles.rules}>
          {validations.map((item) => <li key={item.en}>{pick(item)}</li>)}
        </ul>
      </section>

      <section className={styles.boundary} aria-labelledby="boundary-title">
        <div className={styles.boundaryHead}>
          <p className={styles.label}>{es ? "Sin acceso al CRM" : "Without CRM access"}</p>
          <h2 id="boundary-title">{es ? "Separar valor disponible de valor desbloqueable." : "Separate available value from unlockable value."}</h2>
        </div>
        <div className={styles.boundaryFields}>
          <article><h3>{es ? "Disponible ahora" : "Available now"}</h3><ul><li>{es ? "Priorización territorial" : "Territory prioritisation"}</li><li>{es ? "Contexto de calendario y partido" : "Fixture and matchweek context"}</li><li>{es ? "Histórico de asistencia; benchmark actual solo cuando la fuente esté disponible" : "Attendance history; current benchmark only when its source is available"}</li><li>{es ? "Señales de audiencia y campañas; búsqueda solo cuando exista una captura válida" : "Audience signals and campaigns; search only when a valid capture exists"}</li></ul></article>
          <article><h3>{es ? "Requiere acceso" : "Requires access"}</h3><ul><li>{es ? "Conversión a compra" : "Purchase conversion"}</li><li>{es ? "Scan y no-show" : "Scan and no-show"}</li><li>{es ? "Coste de adquisición real" : "Real acquisition cost"}</li><li>{es ? "Repetición por cohorte" : "Cohort repeat behaviour"}</li></ul></article>
        </div>
      </section>

      <section className={styles.implementation} aria-labelledby="implementation-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Implementación" : "Implementation"}</p>
          <h2 id="implementation-title">{es ? "Simple de operar. Preparada para crecer." : "Simple to operate. Ready to grow."}</h2>
          <div className={ed.actions}>
            <Link className={ed.coralButton} href="/app">{es ? "Explorar el producto" : "Explore the product"}</Link>
            <Link className={ed.textLink} href="/case-study">{es ? "Leer el caso comercial ↗" : "Read the commercial case ↗"}</Link>
          </div>
        </div>
        <ul className={styles.tags} aria-label={es ? "Tecnología" : "Technology"}>
          {["Next.js", "TypeScript", "Versioned JSON", "JSON Schema", "GitHub Actions", "Vercel", "Public APIs", "Responsive UI"].map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <p className={styles.affiliation}>
        <strong>AVELA · London City technical case study</strong>
        <span>{es ? "Demo independiente · Datos y límites visibles por diseño." : "Independent demo · Data and limits visible by design."}</span>
      </p>

      <MarketingFooter />
    </main>
  );
}
