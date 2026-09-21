"use client";

import Link from "next/link";
import { NavTabs } from "@/components/NavTabs";
import { useLanguage } from "@/components/LanguageProvider";
import type { DecisionValidationData } from "@/lib/models";

type Localized = { en: string; es: string };

const productViews: Array<{ number: string; title: Localized; text: Localized; href: string; cta: Localized }> = [
  {
    number: "01", title: { en: "Today", es: "Hoy" }, href: "/today",
    text: { en: "What matters before the next fixture—and which action deserves attention now.", es: "Qué importa antes del próximo partido y qué acción merece atención ahora." },
    cta: { en: "Open decision cockpit", es: "Abrir cockpit de decisión" }
  },
  {
    number: "02", title: { en: "Calendar", es: "Calendario" }, href: "/calendar",
    text: { en: "A fixture-led operating plan instead of a passive list of dates.", es: "Un plan operativo por partido en lugar de una lista pasiva de fechas." },
    cta: { en: "Open fixture plan", es: "Abrir plan de partido" }
  },
  {
    number: "03", title: { en: "Territories", es: "Territorios" }, href: "/territories",
    text: { en: "Where local acquisition opportunity appears strongest before access friction is tested.", es: "Dónde parece más fuerte la oportunidad de captación local antes de probar la fricción de acceso." },
    cta: { en: "Open opportunity map", es: "Abrir mapa de oportunidad" }
  },
  {
    number: "04", title: { en: "Matchday Access", es: "Acceso al partido" }, href: "/access",
    text: { en: "Whether supporters from priority areas can realistically reach the ground on matchday.", es: "Si los aficionados de zonas prioritarias pueden llegar realmente al estadio el día de partido." },
    cta: { en: "Validate access", es: "Validar acceso" }
  },
  {
    number: "05", title: { en: "Fan Experience", es: "Experiencia del aficionado" }, href: "/experience",
    text: { en: "Which experience concepts are worth testing before they are treated as products.", es: "Qué conceptos de experiencia merece la pena probar antes de tratarlos como productos." },
    cta: { en: "Open experience lab", es: "Abrir laboratorio de experiencia" }
  },
  {
    number: "06", title: { en: "Measurement", es: "Medición" }, href: "/measurement",
    text: { en: "Whether there is enough evidence to act—and how prior hypotheses compare with observable reality.", es: "Si existe suficiente evidencia para actuar y cómo se comparan las hipótesis previas con la realidad observable." },
    cta: { en: "Open evidence control", es: "Abrir control de evidencia" }
  }
];

const operatingLoop: Array<{ label: Localized; text: Localized }> = [
  { label: { en: "Find", es: "Localizar" }, text: { en: "Where is qualified local demand?", es: "¿Dónde está la demanda local cualificada?" } },
  { label: { en: "Read", es: "Interpretar" }, text: { en: "What changed around the fixture?", es: "¿Qué ha cambiado alrededor del partido?" } },
  { label: { en: "Activate", es: "Activar" }, text: { en: "Which campaign can the team execute?", es: "¿Qué campaña puede ejecutar el equipo?" } },
  { label: { en: "Measure", es: "Medir" }, text: { en: "Did attention become attendance?", es: "¿La atención se convirtió en asistencia?" } },
  { label: { en: "Learn", es: "Aprender" }, text: { en: "Who returned within 30/60/90 days?", es: "¿Quién volvió en 30/60/90 días?" } }
];

const valueCards: Array<{ title: Localized; text: Localized }> = [
  { title: { en: "Marketing", es: "Marketing" }, text: { en: "Prioritised audiences, messages, channels, assets and execution windows.", es: "Audiencias, mensajes, canales, piezas y ventanas de ejecución priorizadas." } },
  { title: { en: "Ticketing & CRM", es: "Ticketing y CRM" }, text: { en: "A shared path from campaign ID to ticket, scan, no-show and repeat visit.", es: "Un recorrido común desde el ID de campaña hasta entrada, acceso, no-show y repetición." } },
  { title: { en: "Fan engagement", es: "Fan engagement" }, text: { en: "Fixture-specific journeys that reduce access, timing and weather friction.", es: "Recorridos específicos por partido que reducen fricción de acceso, horario y tiempo." } },
  { title: { en: "Commercial", es: "Comercial" }, text: { en: "Evidence-led propositions for local partners, community activation and sponsorship.", es: "Propuestas basadas en evidencia para partners locales, comunidad y patrocinio." } }
];

export function LocalizedStoryPage({ validation }: { validation: DecisionValidationData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const pick = (value: Localized) => value[es ? "es" : "en"];
  const validationCase = validation.cases[0];
  const aligned = validationCase.dimensions.filter((item) => item.state === "aligned").length;
  const partial = validationCase.dimensions.filter((item) => item.state === "partial").length;

  return (
    <main className="caseStudyPage commercialCaseStudy">
      <NavTabs />

      <section className="caseStudyHero caseStudyHeroCommercial">
        <div className="caseStudyModeNav" aria-label={es ? "Versiones del caso de estudio" : "Case study versions"}>
          <span className="active">{es ? "Caso comercial" : "Commercial case"}</span>
          <Link href="/case-study/technical">{es ? "Caso técnico" : "Technical case"}</Link>
        </div>
        <div className="eyebrow">{es ? "CASO DE ESTUDIO · EVIDENCIA EN EVOLUCIÓN" : "CASE STUDY · EVIDENCE IN MOTION"}</div>
        <h1>{es ? "De señales dispersas a decisiones que pueden contrastarse con la realidad." : "From scattered signals to decisions that can be tested against reality."}</h1>
        <p className="caseStudyHeroLede">
          {es
            ? "El prototipo conecta territorio, calendario, atención, acceso, experiencia y medición para generar hipótesis operativas y comprobar después qué ocurrió realmente."
            : "The prototype connects territory, calendar, attention, access, experience and measurement to generate operating hypotheses and then check what actually happened."}
        </p>
        <div className="caseStudyActions">
          <Link className="caseStudyButton primary" href="/today">{es ? "Explorar el producto" : "Explore the product"}</Link>
          <Link className="caseStudyButton secondary" href="/case-study/technical">{es ? "Ver cómo se ha construido" : "See how it is built"} →</Link>
        </div>
        <p className="caseStudyDisclosure">
          {es
            ? "Prototipo independiente · London City Lionesses se utiliza como caso de estudio vivo · Los resultados internos permanecen pendientes hasta disponer de acceso autorizado."
            : "Independent prototype · London City Lionesses is used as a live case study · Internal outcomes remain pending until authorised access exists."}
        </p>
      </section>

      <section className="caseStudySection caseStudyProblem">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "EL PROBLEMA COMERCIAL" : "THE COMMERCIAL PROBLEM"}</div>
          <h2>{es ? "Cada partido genera decisiones. Los datos suelen vivir separados." : "Every fixture creates decisions. The data usually lives apart."}</h2>
          <p>{es
            ? "Un club femenino independiente necesita construir hábito, no solo vender un partido. Pero calendario, atención digital, asistencia, territorio, transporte, campañas y repetición suelen analizarse en herramientas distintas o demasiado tarde."
            : "An independent women's club needs to build habit, not only sell one match. Yet fixtures, digital attention, attendance, territory, travel, campaigns and repeat behaviour are often analysed in different tools or too late."}</p>
        </div>
        <div className="caseStudyChallengeGrid">
          <article><span>01</span><strong>{es ? "¿Dónde?" : "Where?"}</strong><p>{es ? "Qué territorios contienen demanda alcanzable y relevante." : "Which territories contain relevant, reachable demand."}</p></article>
          <article><span>02</span><strong>{es ? "¿Cuándo?" : "When?"}</strong><p>{es ? "Qué señales hacen que una jornada requiera más captación o servicio." : "Which signals make a matchweek require more acquisition or service."}</p></article>
          <article><span>03</span><strong>{es ? "¿Qué hacer?" : "What next?"}</strong><p>{es ? "Cómo traducir el análisis en una campaña concreta y aprobable." : "How to turn analysis into a concrete, approvable campaign."}</p></article>
          <article><span>04</span><strong>{es ? "¿Funcionó?" : "Did it work?"}</strong><p>{es ? "Qué generó compra, acceso y repetición, no solo alcance." : "What created purchase, scan and repeat—not just reach."}</p></article>
        </div>
      </section>

      <section className="caseStudySection caseStudyCommercialThesis">
        <div className="eyebrow">{es ? "LA PROPUESTA" : "THE PROPOSITION"}</div>
        <h2>{es ? "Un sistema operativo de demanda para cada partido." : "A demand operating system for every fixture."}</h2>
        <p className="caseStudyInsightText">{es
          ? "La herramienta no intenta producir otra capa de reporting. Organiza evidencia pública y, cuando exista, información privada del club en un bucle de decisión con responsables, aprobaciones y medición."
          : "The product is not trying to create another reporting layer. It organises public evidence and, when available, private club data into a decision loop with owners, approvals and measurement."}</p>
        <div className="caseStudyOperatingLoop">
          {operatingLoop.map((item, index) => (
            <article key={item.label.en}><span>{String(index + 1).padStart(2, "0")}</span><strong>{pick(item.label)}</strong><p>{pick(item.text)}</p></article>
          ))}
        </div>
      </section>

      <section className="caseStudySection caseStudyEvidenceMaturity">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "QUÉ ESTÁ DEMOSTRADO" : "WHAT IS ACTUALLY DEMONSTRATED"}</div>
          <h2>{es ? "Separar producto construido, evidencia observada e impacto todavía no probado." : "Separate built product, observed evidence and impact that is still unproven."}</h2>
          <p>{es
            ? "La evaluación gana credibilidad cuando no trata todas las capas como si tuvieran el mismo nivel de prueba."
            : "The evaluation is more credible when every layer is not presented as if it carries the same level of proof."}</p>
        </div>

        <div className="caseStudyEvidenceStates">
          <article className="built">
            <span>{es ? "CONSTRUIDO" : "BUILT"}</span>
            <strong>{es ? "Sistema de decisión operativo" : "Operational decision system"}</strong>
            <p>{es ? "Flujo desde señales y fixtures hasta campañas, acceso, partnerships, medición y control de fuentes." : "A working flow from signals and fixtures through campaigns, access, partnerships, measurement and source control."}</p>
          </article>
          <article className="observed">
            <span>{es ? "OBSERVADO" : "OBSERVED"}</span>
            <strong>{es ? "Primera alineación documentada con acción real" : "First documented alignment with real-world action"}</strong>
            <p>{es ? "La hipótesis Brighton + Inglaterra–España quedó registrada antes de que apareciera una activación pública comparable del club." : "The Brighton + England v Spain hypothesis was time-stamped before a comparable public club activation appeared."}</p>
          </article>
          <article className="pending">
            <span>{es ? "PENDIENTE" : "STILL TO PROVE"}</span>
            <strong>{es ? "Impacto causal en conversión y repetición" : "Causal impact on conversion and repeat"}</strong>
            <p>{es ? "Requiere acceso autorizado a ticketing/CRM, instrumentación de producción y comparación controlada." : "Requires authorised ticketing/CRM access, production instrumentation and controlled comparison."}</p>
          </article>
        </div>

        <div className="caseStudyRealityCheck">
          <div className="caseStudyRealityHeader">
            <div>
              <span>{es ? "15 SEP · HIPÓTESIS DEL ENGINE" : "15 SEP · ENGINE HYPOTHESIS"}</span>
              <strong>{validationCase.hypothesis[lang]}</strong>
            </div>
            <b>→</b>
            <div>
              <span>{es ? "18 SEP · ACCIÓN OBSERVADA" : "18 SEP · OBSERVED CLUB ACTION"}</span>
              <strong>{validationCase.observedAction[lang]}</strong>
            </div>
          </div>
          <div className="caseStudyRealitySummary">
            <div><strong>{aligned}</strong><span>{es ? "dimensiones alineadas" : "aligned dimensions"}</span></div>
            <div><strong>{partial}</strong><span>{es ? "alineación parcial" : "partial alignment"}</span></div>
            <div><strong>0</strong><span>{es ? "causalidad afirmada" : "causation claimed"}</span></div>
            <a href={validationCase.observedSource.url} target="_blank" rel="noreferrer">{es ? "Ver fuente pública" : "View public source"} ↗</a>
          </div>
          <p>{validationCase.caveat[lang]}</p>
        </div>
      </section>

      <section className="caseStudySection caseStudyProof">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "PRUEBA CONSTRUIDA" : "PROOF BUILT"}</div>
          <h2>{es ? "El prototipo ya conecta mercado, demanda y ejecución." : "The prototype now connects market, demand and execution."}</h2>
          <p>{es ? "No es una maqueta conceptual. Cada cifra tiene un estado, una fuente y un uso definido." : "This is not a conceptual mock-up. Every number has a state, a source and a defined use."}</p>
        </div>
        <div className="caseStudyMetricGrid">
          <article className="featured"><strong>940</strong><span>LSOAs</span><p>{es ? "evaluadas para priorizar oportunidad territorial" : "evaluated for territory opportunity"}</p></article>
          <article><strong>11</strong><span>{es ? "partidos" : "fixtures"}</span><p>{es ? "de WSL en casa reconstruidos para 2025/26" : "2025/26 home WSL matches reconstructed"}</p></article>
          <article><strong>34,939</strong><span>{es ? "asistentes" : "attendees"}</span><p>{es ? "en el ledger histórico auditable" : "in the auditable historical ledger"}</p></article>
          <article><strong>5,414</strong><span>{es ? "récord" : "record"}</span><p>{es ? "benchmark ante Arsenal" : "benchmark against Arsenal"}</p></article>
        </div>
        <div className="caseStudyEvidenceRail">
          <div><span>{es ? "Media 2025/26" : "2025/26 average"}</span><strong>3,176</strong></div>
          <div><span>{es ? "Mediana" : "Median"}</span><strong>2,982</strong></div>
          <div><span>{es ? "Media Hayes Lane" : "Hayes Lane average"}</span><strong>3,012</strong></div>
          <div><span>{es ? "Opener actual" : "Current opener"}</span><strong>5,402</strong><small>{es ? "+70% sobre la media anterior" : "+70% vs prior average"}</small></div>
        </div>
      </section>

      <section className="caseStudySection caseStudyCampaignBridge">
        <div className="caseStudySectionHead">
          <div className="eyebrow">SIGNAL → CAMPAIGN</div>
          <h2>{es ? "La sugerencia termina en un briefing, no en una frase genérica." : "The recommendation ends in a brief—not a generic sentence."}</h2>
          <p>{es
            ? "Brighton es el primer caso donde el brief generado puede compararse con una acción pública posterior. El valor ya no está solo en producir una campaña, sino en aprender si la hipótesis era relevante."
            : "Brighton is the first case where a generated brief can be compared with a later public action. The value is no longer only producing a campaign—it is learning whether the hypothesis was relevant."}</p>
        </div>
        <div className="caseStudyCampaignCard">
          <div className="caseStudyCampaignLead">
            <span>{es ? "CAMPAÑA PILOTO" : "PILOT CAMPAIGN"}</span>
            <h3>{es ? "Brighton · El primer partido de la doble sesión" : "Brighton · The first match of the double-header"}</h3>
            <p>{es ? "Objetivo: convertir la atención del opener y la oportunidad local en intención cualificada de entrada." : "Objective: turn opener attention and local opportunity into qualified ticket intent."}</p>
            <strong>{es ? "Borrador · Sin inversión autorizada" : "Draft · No spend authorised"}</strong>
          </div>
          <div className="caseStudyCampaignFacts">
            <div><strong>4</strong><span>{es ? "playbooks reutilizables" : "reusable playbooks"}</span></div>
            <div><strong>4</strong><span>{es ? "activaciones coordinadas" : "coordinated activations"}</span></div>
            <div><strong>6</strong><span>{es ? "IDs de atribución" : "attribution IDs"}</span></div>
            <div><strong>1/4</strong><span>{es ? "aprobaciones listas" : "approvals ready"}</span></div>
          </div>
        </div>
        <div className="caseStudyPlaybooks">
          {["Back to Bromley", "The next chapter", "Alexia → London City", "Matchday confidence"].map((item, index) => <span key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</span>)}
        </div>
        <Link className="caseStudyTextLink" href="/today">{es ? "Ver el Campaign Lab en contexto" : "See the Campaign Lab in context"} →</Link>
      </section>

      <section className="caseStudySection caseStudyAudienceLayer">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "DE ALCANCE A DEMANDA" : "FROM REACH TO DEMAND"}</div>
          <h2>{es ? "No sumar audiencias distintas. Conectarlas." : "Do not add unlike audiences. Connect them."}</h2>
          <p>{es ? "YouTube, Eleven TV, televisión, búsquedas, entradas y asistencia se mantienen como métricas diferentes dentro del mismo recorrido." : "YouTube, Eleven TV, broadcast, search, tickets and attendance remain different measures inside the same journey."}</p>
        </div>
        <div className="caseStudyFunnel">
          {[es ? "Alcance" : "Reach", es ? "Interacción" : "Engage", es ? "Intención" : "Intent", es ? "Compra / acceso" : "Buy / scan", es ? "Repetición" : "Repeat"].map((item, index) => (
            <div key={item} className={index > 2 ? "restricted" : ""}><span>{index + 1}</span><strong>{item}</strong><small>{index > 2 ? (es ? "requiere acceso" : "requires access") : (es ? "señal pública / instrumentable" : "public / instrumentable")}</small></div>
          ))}
        </div>
      </section>

      <section className="caseStudySection caseStudyProduct">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "EL PRODUCTO" : "THE PRODUCT"}</div>
          <h2>{es ? "Seis preguntas operativas. Un mismo sistema." : "Six operating questions. One system."}</h2>
          <p>{es ? "La navegación evita otro dashboard infinito y lleva a cada equipo desde la decisión hacia la evidencia necesaria." : "The navigation avoids another endless dashboard and takes each team from the decision to the evidence it needs."}</p>
        </div>
        <div className="caseStudyProductGrid">
          {productViews.map((view) => (
            <article key={view.href}><span>{view.number}</span><h3>{pick(view.title)}</h3><p>{pick(view.text)}</p><Link href={view.href}>{pick(view.cta)} →</Link></article>
          ))}
        </div>
      </section>

      <section className="caseStudySection caseStudyValue">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{es ? "VALOR PARA EL CLUB" : "VALUE FOR THE CLUB"}</div>
          <h2>{es ? "Una capa de coordinación para equipos con poco tiempo." : "A coordination layer for teams with limited time."}</h2>
        </div>
        <div className="caseStudyValueGrid">
          {valueCards.map((card) => <article key={card.title.en}><h3>{pick(card.title)}</h3><p>{pick(card.text)}</p></article>)}
        </div>
        <blockquote className="caseStudyCommercialQuote">
          {es ? "La oportunidad no es tener más datos. Es cerrar mejor el recorrido entre señal, decisión, campaña y aprendizaje." : "The opportunity is not more data. It is closing the loop from signal to decision, campaign and learning."}
        </blockquote>
      </section>

      <section className="caseStudySection caseStudyNextLayer">
        <div>
          <div className="eyebrow">{es ? "DE PROTOTIPO A PILOTO" : "FROM PROTOTYPE TO PILOT"}</div>
          <h2>{es ? "El siguiente salto no es más UI. Es cerrar el bucle con datos de club." : "The next leap is not more UI. It is closing the loop with club data."}</h2>
          <p>{es ? "Un piloto real conectaría datos privados mínimos, instrumentaría una o dos decisiones por partido y revisaría resultados contra un baseline antes de ampliar alcance." : "A real pilot would connect the minimum private data, instrument one or two fixture decisions and review outcomes against a baseline before expanding scope."}</p>
        </div>
        <div className="caseStudyPilotSteps">
          <article><span>01</span><strong>{es ? "Conectar" : "Connect"}</strong><p>{es ? "Ticketing, scans y CRM mediante contratos ya definidos." : "Ticketing, scans and CRM through already-defined contracts."}</p></article>
          <article><span>02</span><strong>{es ? "Instrumentar" : "Instrument"}</strong><p>{es ? "Una campaña y una experiencia con IDs y eventos trazables." : "One campaign and one experience with traceable IDs and events."}</p></article>
          <article><span>03</span><strong>{es ? "Comparar" : "Compare"}</strong><p>{es ? "Baseline, resultado, no-show, primera visita y repetición." : "Baseline, outcome, no-show, first visit and repeat."}</p></article>
          <article><span>04</span><strong>{es ? "Decidir" : "Decide"}</strong><p>{es ? "Escalar, adaptar o parar según evidencia observada." : "Scale, adapt or stop based on observed evidence."}</p></article>
        </div>
        <div className="caseStudyNextActions">
          <Link className="caseStudyButton primary" href="/measurement">{es ? "Ver control de evidencia" : "Open evidence control"}</Link>
          <Link className="caseStudyButton secondary" href="/method">{es ? "Revisar metodología" : "Review methodology"}</Link>
        </div>
      </section>

      <footer className="caseStudyFooter">
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">{es ? "Prototipo independiente · No afiliado a London City Lionesses." : "Independent prototype · Not affiliated with London City Lionesses."}</div>
      </footer>
    </main>
  );
}
