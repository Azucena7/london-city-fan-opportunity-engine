"use client";

import Link from "next/link";
import { NavTabs } from "@/components/NavTabs";
import { useLanguage } from "@/components/LanguageProvider";

type Localized = { en: string; es: string };

const productViews: Array<{ number: string; title: Localized; text: Localized; href: string; cta: Localized }> = [
  {
    number: "01", title: { en: "Today", es: "Hoy" }, href: "/today",
    text: { en: "One current decision, the material signals behind it and the marketing response.", es: "Una decisión vigente, las señales materiales que la explican y la respuesta de marketing." },
    cta: { en: "Open the operating view", es: "Abrir la vista operativa" }
  },
  {
    number: "02", title: { en: "Calendar", es: "Calendario" }, href: "/calendar",
    text: { en: "Every fixture becomes a dossier: context, attendance, audience, campaign and post-match learning.", es: "Cada partido se convierte en un expediente: contexto, asistencia, audiencia, campaña y aprendizaje postpartido." },
    cta: { en: "Explore fixture dossiers", es: "Explorar expedientes" }
  },
  {
    number: "03", title: { en: "Territories", es: "Territorios" }, href: "/territories",
    text: { en: "Local family potential, girls' football networks and public-transport access become acquisition priorities.", es: "El potencial familiar, las redes de fútbol femenino y el acceso en transporte se convierten en prioridades de captación." },
    cta: { en: "See the opportunity map", es: "Ver el mapa de oportunidad" }
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

export function LocalizedStoryPage() {
  const { lang } = useLanguage();
  const es = lang === "es";
  const pick = (value: Localized) => value[es ? "es" : "en"];

  return (
    <main className="caseStudyPage commercialCaseStudy">
      <NavTabs />

      <section className="caseStudyHero caseStudyHeroCommercial">
        <div className="caseStudyModeNav" aria-label={es ? "Versiones del caso de estudio" : "Case study versions"}>
          <span className="active">{es ? "Caso comercial" : "Commercial case"}</span>
          <Link href="/case-study/technical">{es ? "Caso técnico" : "Technical case"}</Link>
        </div>
        <div className="eyebrow">{es ? "CASO DE ESTUDIO · PRODUCTO EN EVOLUCIÓN" : "CASE STUDY · PRODUCT IN MOTION"}</div>
        <h1>{es ? "De señales dispersas a campañas que un equipo pequeño puede ejecutar." : "From scattered signals to campaigns a small team can actually run."}</h1>
        <p className="caseStudyHeroLede">
          {es
            ? "London City Fan Opportunity Lab conecta territorio, calendario, asistencia, audiencias públicas y contexto de partido para decidir dónde captar, cuándo actuar y qué aprender después."
            : "London City Fan Opportunity Lab connects territory, calendar, attendance, public audiences and match context to decide where to acquire, when to act and what to learn next."}
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
            ? "Brighton es el primer ensayo completo: usa el opener como prueba social, la oportunidad local de Bromley, el alcance de Alexia y la información de servicio de matchday para crear una campaña coordinada."
            : "Brighton is the first complete rehearsal: opener proof, Bromley opportunity, Alexia-led reach and matchday service information become one coordinated campaign."}</p>
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
          <h2>{es ? "Tres vistas. Una decisión compartida." : "Three views. One shared decision."}</h2>
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
          <div className="eyebrow">{es ? "SIGUIENTE CAPA" : "THE NEXT LAYER"}</div>
          <h2>{es ? "Preparado para CRM. Útil antes del CRM." : "CRM-ready. Useful before CRM."}</h2>
          <p>{es ? "Con fuentes públicas ya se puede priorizar, contextualizar y diseñar campañas. Con acceso autorizado a ticketing, scans y CRM se podrá cerrar conversión, no-show, coste de adquisición y repetición." : "Public sources already support prioritisation, context and campaign design. Authorised ticketing, scans and CRM access would close conversion, no-show, acquisition cost and repeat behaviour."}</p>
        </div>
        <div className="caseStudyNextActions">
          <Link className="caseStudyButton primary" href="/case-study/technical">{es ? "Abrir el caso técnico" : "Open the technical case"}</Link>
          <Link className="caseStudyButton secondary" href="/method">{es ? "Revisar la metodología" : "Review the methodology"}</Link>
        </div>
      </section>

      <footer className="caseStudyFooter">
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">{es ? "Prototipo independiente · No afiliado a London City Lionesses." : "Independent prototype · Not affiliated with London City Lionesses."}</div>
      </footer>
    </main>
  );
}
