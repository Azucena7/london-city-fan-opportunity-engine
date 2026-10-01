"use client";

import Link from "next/link";
import { NavTabs } from "@/components/NavTabs";
import { useLanguage } from "@/components/LanguageProvider";

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

export function LocalizedTechnicalCaseStudy() {
  const { lang } = useLanguage();
  const es = lang === "es";
  const pick = (value: Localized) => value[es ? "es" : "en"];

  return (
    <main className="caseStudyPage technicalCaseStudy">
      <NavTabs />

      <section className="caseStudyHero technicalHero">
        <div className="caseStudyModeNav" aria-label={es ? "Versiones del caso de estudio" : "Case study versions"}>
          <Link href="/case-study">{es ? "Caso comercial" : "Commercial case"}</Link>
          <span className="active">{es ? "Caso técnico" : "Technical case"}</span>
        </div>
        <div className="eyebrow">{es ? "CASO TÉCNICO · ARQUITECTURA Y CONSTRUCCIÓN" : "TECHNICAL CASE · ARCHITECTURE AND DELIVERY"}</div>
        <h1>{es ? "Cómo se construye un motor de decisión auditable, paso a paso." : "How an auditable decision engine is built, step by step."}</h1>
        <p className="caseStudyHeroLede">
          {es
            ? "Una explicación de las fuentes, contratos, estados de confianza, automatizaciones y salvaguardas que conectan un partido con una decisión y una campaña medible."
            : "A walkthrough of the sources, contracts, confidence states, automation and safeguards that connect a fixture to a decision and a measurable campaign."}
        </p>
        <div className="caseStudyActions">
          <Link className="caseStudyButton primary" href="/today">{es ? "Abrir el producto vivo" : "Open the live product"}</Link>
          <Link className="caseStudyButton secondary" href="/case-study">{es ? "Volver al caso comercial" : "Back to commercial case"}</Link>
        </div>
      </section>

      <section className="caseStudySection technicalPrinciples">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "PRINCIPIOS DE DISEÑO" : "DESIGN PRINCIPLES"}</div>
          <h2>{es ? "Primero trazabilidad. Después automatización." : "Traceability first. Automation second."}</h2>
        </div>
        <div className="technicalPrincipleGrid">
          <article><span>01</span><h3>{es ? "Partido canónico" : "Canonical fixture"}</h3><p>{es ? "Calendario, señal, audiencia, campaña y resultado comparten fixtureId." : "Calendar, signal, audience, campaign and outcome share one fixtureId."}</p></article>
          <article><span>02</span><h3>{es ? "Estados explícitos" : "Explicit states"}</h3><p>{es ? "Publicado, inferido, pendiente, demo y privado nunca se mezclan." : "Published, inferred, pending, demo and private data never collapse together."}</p></article>
          <article><span>03</span><h3>{es ? "Último dato válido" : "Last valid observation"}</h3><p>{es ? "Un fallo de fuente se registra sin borrar la última observación correcta." : "A source failure is logged without erasing the last correct observation."}</p></article>
          <article><span>04</span><h3>{es ? "Humano en el circuito" : "Human in the loop"}</h3><p>{es ? "La herramienta propone; responsables autorizados aprueban oferta, assets y presupuesto." : "The engine proposes; authorised owners approve offer, assets and budget."}</p></article>
        </div>
      </section>

      <section className="caseStudySection technicalArchitecture">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "ARQUITECTURA LÓGICA" : "LOGICAL ARCHITECTURE"}</div>
          <h2>{es ? "Cinco capas unidas por claves, no por suposiciones." : "Five layers joined by keys—not assumptions."}</h2>
        </div>
        <div className="technicalStack" role="img" aria-label={es ? "Arquitectura de cinco capas" : "Five-layer architecture"}>
          <article><span>05</span><strong>{es ? "Decisión y campaña" : "Decision & campaign"}</strong><small>Today · Calendar · CampaignPlan · scorecard</small></article>
          <article><span>04</span><strong>{es ? "Modelos de decisión" : "Decision models"}</strong><small>Territory · demand · audience · matchweek</small></article>
          <article><span>03</span><strong>{es ? "Contratos y estados" : "Contracts & states"}</strong><small>fixtureId · campaignId · source · confidence</small></article>
          <article><span>02</span><strong>{es ? "Datos normalizados" : "Normalised data"}</strong><small>calendar · attendance · signals · journeys</small></article>
          <article><span>01</span><strong>{es ? "Fuentes" : "Sources"}</strong><small>club · WSL · weather · transport · YouTube · search</small></article>
        </div>
        <p className="technicalArchitectureNote">{es ? "La futura conexión CRM entra en la capa de fuentes mediante un contrato versionado; no exige rehacer la lógica superior." : "A future CRM connection enters at the source layer through a versioned contract; it does not require rebuilding the layers above."}</p>
      </section>

      <section className="caseStudySection technicalTimeline">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "CONSTRUCCIÓN POR FASES" : "BUILD PHASES"}</div>
          <h2>{es ? "Cada incremento responde una pregunta nueva." : "Each increment answers a new question."}</h2>
        </div>
        <div className="technicalPhaseList">
          {phases.map((phase, index) => (
            <article key={phase.version}>
              <div className="technicalPhaseIndex"><span>{phase.version}</span><b>{String(index + 1).padStart(2, "0")}</b></div>
              <div><h3>{pick(phase.title)}</h3><p>{pick(phase.text)}</p></div>
              <strong>{pick(phase.output)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="caseStudySection technicalSources">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "FUENTES Y CADENCIA" : "SOURCES & CADENCE"}</div>
          <h2>{es ? "Las fuentes públicas ya forman una capa operativa, con límites visibles." : "Public sources already form an operating layer—with visible limits."}</h2>
          <p>{es ? "La automatización consulta y conserva observaciones comparables. Cuando una fuente falla, muestra el fallo y mantiene el último valor válido." : "Automation checks and preserves comparable observations. When a source fails, it exposes the failure and retains the last valid value."}</p>
        </div>
        <div className="technicalSourceGrid">
          <article><span>{es ? "DIARIO" : "DAILY"}</span><h3>{es ? "Calendario y resultados" : "Fixtures & results"}</h3><p>{es ? "Fuente oficial, cambios de horario y cierre postpartido." : "Official source, schedule changes and post-match closure."}</p></article>
          <article><span>{es ? "DIARIO / VENTANAS" : "DAILY / WINDOWS"}</span><h3>{es ? "Meteorología y viaje" : "Weather & travel"}</h3><p>{es ? "Actualización de matchweek sin convertir forecast en certeza." : "Matchweek refresh without treating a forecast as certainty."}</p></article>
          <article><span>{es ? "SEMANAL + T±" : "WEEKLY + T±"}</span><h3>{es ? "Audiencia pública" : "Public audience"}</h3><p>{es ? "YouTube, búsquedas, broadcast y anotaciones de eventos." : "YouTube, search, broadcast and event annotations."}</p></article>
          <article><span>{es ? "POSTPARTIDO" : "POST-MATCH"}</span><h3>{es ? "Asistencia y benchmark" : "Attendance & benchmark"}</h3><p>{es ? "Observación oficial, muestra visible y mediana comparable." : "Official observation, visible sample and comparable median."}</p></article>
        </div>
      </section>

      <section className="caseStudySection technicalStates">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "CONTRATO DE CONFIANZA" : "TRUST CONTRACT"}</div>
          <h2>{es ? "La interfaz dice qué sabemos y qué no." : "The interface says what is—and is not—known."}</h2>
        </div>
        <div className="technicalStateTable">
          <div className="technicalStateHeader"><span>{es ? "Estado" : "State"}</span><span>{es ? "Significado" : "Meaning"}</span><span>{es ? "Ejemplo" : "Example"}</span></div>
          {states.map((item) => <div className="technicalStateRow" key={item.state}><code>{item.state}</code><p>{pick(item.meaning)}</p><small>{pick(item.example)}</small></div>)}
        </div>
      </section>

      <section className="caseStudySection technicalContracts">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "CONTRATOS DE DATOS" : "DATA CONTRACTS"}</div>
          <h2>{es ? "La integración futura ya tiene forma." : "The future integration already has a shape."}</h2>
          <p>{es ? "Aunque no exista acceso al CRM real, el producto define exactamente qué necesita, cómo se valida y qué cálculos habilita." : "Even without real CRM access, the product defines exactly what it needs, how it validates and which calculations it unlocks."}</p>
        </div>
        <div className="technicalContractGrid">
          <article>
            <span>CRM / TICKETING</span>
            <h3>{es ? "Una entrada por fila" : "One ticket per row"}</h3>
            <p>fixture → campaign → product → price → purchase → scan → consent-safe geography → repeat</p>
            <a href="/api/contracts/crm-ticketing" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
          <article>
            <span>CAMPAIGN PLAN</span>
            <h3>{es ? "Una campaña gobernada" : "One governed campaign"}</h3>
            <p>fixture → signals → audiences → playbooks → activations → UTMs → approvals → measurement</p>
            <a href="/api/contracts/campaign-plan" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
          <article>
            <span>SEARCH DEMAND</span>
            <h3>{es ? "Una comparación reproducible" : "One reproducible comparison"}</h3>
            <p>market → window → comparison set → term → dated index → activation → decision gate</p>
            <a href="/api/contracts/search-demand" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
          <article>
            <span>EXPERIENCE DEMAND</span>
            <h3>{es ? "Una señal sin datos personales" : "One non-personal intent signal"}</h3>
            <p>concept → fixture → origin → party → price → needs → gates → pilot decision</p>
            <a href="/api/contracts/experience-demand" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
          <article>
            <span>MOBILITY PARTNERSHIP</span>
            <h3>{es ? "Un escenario agregado y gobernado" : "One governed aggregate scenario"}</h3>
            <p>fixture → corridor → modelled score → aggregate threshold → quote → approval</p>
            <a href="/api/contracts/mobility-partnership" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
          <article>
            <span>EXPERIMENT MEASUREMENT</span>
            <h3>{es ? "Un evento permitido y agregado" : "One allowlisted aggregate event"}</h3>
            <p>event → validate → deliver → deduplicate → cohort → threshold → review</p>
            <a href="/api/contracts/experiment-measurement" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
          <article>
            <span>PARTNER COMMERCIAL PACK</span>
            <h3>{es ? "Un dossier trazable y no vinculante" : "One traceable non-binding pack"}</h3>
            <p>candidate → fixture → evidence → value exchange → KPIs → gates → review</p>
            <a href="/api/contracts/partner-commercial-pack" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
          <article>
            <span>PILOT READINESS</span>
            <h3>{es ? "Una decisión provisional y gobernada" : "One provisional governed decision"}</h3>
            <p>pack → score → owners → blockers → timeline → hold / go</p>
            <a href="/api/contracts/pilot-readiness" target="_blank">{es ? "Abrir esquema JSON" : "Open JSON schema"} ↗</a>
          </article>
        </div>
        <div className="technicalJoin"><code>fixture_id</code><span>→</span><code>campaign_id</code><span>→</span><code>ticket_id</code><span>→</span><code>scan</code><span>→</span><code>repeat_90d</code></div>
      </section>

      <section className="caseStudySection technicalCampaign">
        <div className="caseStudySectionHead">
          <div className="eyebrow">SIGNAL → CAMPAIGN</div>
          <h2>{es ? "Brighton ejercita el recorrido completo sin fingir datos reales." : "Brighton exercises the full path without pretending demo data is real."}</h2>
        </div>
        <div className="technicalCampaignFlow">
          <article><span>01</span><strong>{es ? "Señales" : "Signals"}</strong><p>{es ? "Opener, horario, atención y meteorología." : "Opener, kickoff, attention and weather."}</p></article>
          <article><span>02</span><strong>{es ? "Brief" : "Brief"}</strong><p>{es ? "Audiencia, propuesta, oferta, assets y canales." : "Audience, proposition, offer, assets and channels."}</p></article>
          <article><span>03</span><strong>{es ? "Gobierno" : "Governance"}</strong><p>{es ? "Responsable, cuatro aprobaciones y ningún gasto automático." : "Owner, four approvals and no automatic spend."}</p></article>
          <article><span>04</span><strong>{es ? "Atribución" : "Attribution"}</strong><p>{es ? "UTMs y seis campaign IDs ejercitados en demo." : "UTMs and six campaign IDs exercised in demo."}</p></article>
          <article><span>05</span><strong>{es ? "Cierre" : "Closure"}</strong><p>{es ? "T+1, T+7, T+30, T+60 y T+90." : "T+1, T+7, T+30, T+60 and T+90."}</p></article>
        </div>
      </section>

      <section className="caseStudySection technicalValidation">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "VALIDACIÓN Y GUARDRAILS" : "VALIDATION & GUARDRAILS"}</div>
          <h2>{es ? "El sistema bloquea conclusiones que los datos no soportan." : "The system blocks conclusions the data cannot support."}</h2>
        </div>
        <div className="technicalValidationGrid">
          {validations.map((item, index) => <article key={item.en}><span>✓</span><p>{pick(item)}</p><small>{String(index + 1).padStart(2, "0")}</small></article>)}
        </div>
        <div className="technicalChecks">
          <code>validate:campaigns</code><code>validate:crm-demo</code><code>validate:public-signals</code><code>validate:search-demand</code><code>validate:experience-demand</code><code>validate:mobility-partnership</code><code>validate:experiment-measurement</code><code>validate:partner-commercial-pack</code><code>validate:pilot-readiness</code><code>validate:source-health</code><code>typecheck</code><code>Vercel build</code>
        </div>
      </section>

      <section className="caseStudySection technicalNoCrm">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "SIN ACCESO AL CRM" : "WITHOUT CRM ACCESS"}</div>
          <h2>{es ? "Separar valor disponible de valor desbloqueable." : "Separate available value from unlockable value."}</h2>
        </div>
        <div className="technicalBoundaryGrid">
          <article className="available"><span>{es ? "DISPONIBLE AHORA" : "AVAILABLE NOW"}</span><ul><li>{es ? "Priorización territorial" : "Territory prioritisation"}</li><li>{es ? "Contexto de calendario y partido" : "Fixture and matchweek context"}</li><li>{es ? "Histórico de asistencia; benchmark actual solo cuando la fuente esté disponible" : "Attendance history; current benchmark only when its source is available"}</li><li>{es ? "Señales de audiencia y campañas; búsqueda solo cuando exista una captura válida" : "Audience signals and campaigns; search only when a valid capture exists"}</li></ul></article>
          <article><span>{es ? "REQUIERE ACCESO" : "REQUIRES ACCESS"}</span><ul><li>{es ? "Conversión a compra" : "Purchase conversion"}</li><li>{es ? "Scan y no-show" : "Scan and no-show"}</li><li>{es ? "Coste de adquisición real" : "Real acquisition cost"}</li><li>{es ? "Repetición por cohorte" : "Cohort repeat behaviour"}</li></ul></article>
        </div>
      </section>

      <section className="caseStudySection technicalStackSummary">
        <div>
          <div className="eyebrow">{es ? "IMPLEMENTACIÓN" : "IMPLEMENTATION"}</div>
          <h2>{es ? "Simple de operar. Preparada para crecer." : "Simple to operate. Ready to grow."}</h2>
        </div>
        <div className="technicalTags"><span>Next.js</span><span>TypeScript</span><span>Versioned JSON</span><span>JSON Schema</span><span>GitHub Actions</span><span>Vercel</span><span>Public APIs</span><span>Responsive UI</span></div>
        <div className="caseStudyNextActions">
          <Link className="caseStudyButton primary" href="/today">{es ? "Explorar el producto" : "Explore the product"}</Link>
          <Link className="caseStudyButton secondary" href="/case-study">{es ? "Leer el caso comercial" : "Read the commercial case"}</Link>
        </div>
      </section>

      <footer className="caseStudyFooter">
        <div>London City Fan Opportunity Engine · Technical case study</div>
        <div className="muted">{es ? "Prototipo independiente · Datos y límites visibles por diseño." : "Independent prototype · Data and limits visible by design."}</div>
      </footer>
    </main>
  );
}
