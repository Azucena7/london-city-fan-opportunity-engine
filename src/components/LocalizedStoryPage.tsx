"use client";

import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useLanguage } from "@/components/LanguageProvider";
import type { DecisionValidationData } from "@/lib/models";
import ed from "@/components/editorial.module.css";
import styles from "./LocalizedStoryPage.module.css";

type Localized = { en: string; es: string };

const productViews: Array<{ title: Localized; text: Localized; href: string; cta: Localized }> = [
  {
    title: { en: "Home", es: "Inicio" }, href: "/app",
    text: { en: "What matters before the next fixture, and which action deserves attention now.", es: "Qué importa antes del próximo partido y qué acción merece atención ahora." },
    cta: { en: "Open Home", es: "Abrir Inicio" }
  },
  {
    title: { en: "Opportunity Radar", es: "Radar de oportunidades" }, href: "/app/matches",
    text: { en: "A fixture-led operating plan instead of a passive list of dates.", es: "Un plan operativo por partido en lugar de una lista pasiva de fechas." },
    cta: { en: "Open Opportunity Radar", es: "Abrir Radar de oportunidades" }
  },
  {
    title: { en: "Territory signals", es: "Señales territoriales" }, href: "/app/matches",
    text: { en: "Where local acquisition opportunity appears strongest before access friction is tested.", es: "Dónde parece más fuerte la oportunidad de captación local antes de probar la fricción de acceso." },
    cta: { en: "Open Radar", es: "Abrir Radar" }
  },
  {
    title: { en: "Matchday access signals", es: "Señales de acceso al partido" }, href: "/app/matches",
    text: { en: "Whether supporters from priority areas can realistically reach the ground on matchday.", es: "Si los aficionados de zonas prioritarias pueden llegar realmente al estadio el día de partido." },
    cta: { en: "Review fixture signals", es: "Revisar señales del partido" }
  },
  {
    title: { en: "Campaign opportunities", es: "Oportunidades de campaña" }, href: "/app/campaigns",
    text: { en: "Which experience concepts are worth testing before they are treated as products.", es: "Qué conceptos de experiencia merece la pena probar antes de tratarlos como productos." },
    cta: { en: "Open Campaigns", es: "Abrir Campañas" }
  },
  {
    title: { en: "Learning", es: "Aprendizaje" }, href: "/app/learning",
    text: { en: "Whether there is enough evidence to act, and how prior hypotheses compare with observable reality.", es: "Si existe suficiente evidencia para actuar y cómo se comparan las hipótesis previas con la realidad observable." },
    cta: { en: "Open Learning", es: "Abrir Aprendizaje" }
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

const dayMs = 86_400_000;

// The commercial case study, on the shared editorial system: the hero board, then one field of
// colour per question. Built, observed and still-to-prove stay visibly separate throughout.
export function LocalizedStoryPage({ validation }: { validation: DecisionValidationData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const pick = (value: Localized) => value[es ? "es" : "en"];
  const validationCase = validation.cases[0];
  const aligned = validationCase.dimensions.filter((item) => item.state === "aligned").length;
  const partial = validationCase.dimensions.filter((item) => item.state === "partial").length;
  const day = (value: string) => new Date(value.slice(0, 10) + "T12:00:00Z");
  const shortDate = (value: string) => day(value).toLocaleDateString(es ? "es-ES" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  const gapDays = Math.round((day(validationCase.observedAt).getTime() - day(validationCase.hypothesisGeneratedAt).getTime()) / dayMs);

  return (
    <main className={ed.surface} data-editorial>
      <MarketingNav variant="board" />

      <section className={`${ed.board} ${styles.board}`} aria-labelledby="case-title">
        <div className={`${ed.titleTile} ${styles.titleTile}`}>
          <ul className={ed.tileMeta} aria-label={es ? "Versiones del caso de estudio" : "Case study versions"}>
            <li aria-current="page">{es ? "Caso comercial" : "Commercial case"}</li>
            <li><Link href="/case-study/technical">{es ? "Caso técnico" : "Technical case"}</Link></li>
          </ul>
          <h1 id="case-title">{es ? "Señales dispersas, contrastadas con la realidad." : "Scattered signals, tested against reality."}</h1>
        </div>
        <div className={`${ed.leadTile} ${styles.leadTile}`}>
          <p>
            {es
              ? "El entorno de evidencia conecta territorio, calendario, atención, acceso, experiencia y medición para generar hipótesis operativas y comprobar después qué ocurrió realmente."
              : "The evidence environment connects territory, calendar, attention, access, experience and measurement to generate operating hypotheses and then check what actually happened."}
          </p>
          <Link className={ed.lightButton} href="/app">{es ? "Explorar el producto" : "Explore the product"}</Link>
        </div>
        <div className={`${ed.accentTile} ${styles.disclosureTile}`}>
          <p>
            {es
              ? "Demo independiente · London City Lionesses se utiliza como caso de estudio vivo · Los resultados internos permanecen pendientes hasta disponer de acceso autorizado."
              : "Independent demo · London City Lionesses is used as a live case study · Internal outcomes remain pending until authorised access exists."}
          </p>
          <Link className={ed.inkButton} href="/case-study/technical">{es ? "Ver cómo se ha construido" : "See how it is built"}</Link>
        </div>
      </section>

      <section className={styles.prediction} aria-labelledby="prediction-title">
        <p className={styles.label}>{es ? "Antes de que el club lo anunciara" : "Before the club announced it"}</p>
        <h2 id="prediction-title">{es ? "AVELA detectó la misma oportunidad de jornada extendida tres días antes de la activación pública." : "AVELA surfaced the same extended-matchday opportunity three days before the public activation."}</h2>
        <p className={styles.predictionNote}>{es
          ? "No demuestra que London City utilizara AVELA. Sí demuestra que una hipótesis registrada por el engine apareció después como una acción pública comparable."
          : "This does not show London City used AVELA. It shows a time-stamped engine hypothesis was followed by a comparable public club action."}</p>
        <ol className={styles.flow}>
          <li>
            <span>{shortDate(validationCase.hypothesisGeneratedAt)} · {es ? "Hipótesis del engine" : "Engine hypothesis"}</span>
            <strong>{validationCase.hypothesis[lang]}</strong>
            <small>{validationCase.hypothesisSource.name}</small>
          </li>
          <li className={styles.gap} aria-label={es ? `${gapDays} días después` : `${gapDays} days later`}>
            <b>{gapDays}</b><span>{es ? "días" : "days"}</span>
          </li>
          <li className={styles.observed}>
            <span>{shortDate(validationCase.observedAt)} · {es ? "Acción observada del club" : "Observed club action"}</span>
            <strong>{validationCase.observedAction[lang]}</strong>
            <a className={ed.textLink} href={validationCase.observedSource.url} target="_blank" rel="noreferrer">{es ? "Fuente pública ↗" : "Public source ↗"}</a>
          </li>
        </ol>
        <dl className={styles.readout}>
          <div><dt>{es ? "dimensiones totalmente alineadas" : "dimensions fully aligned"}</dt><dd>{aligned}/{validationCase.dimensions.length}</dd></div>
          <div><dt>{es ? "dimensión parcialmente alineada" : "partially aligned dimension"}</dt><dd>{partial}</dd></div>
          <div><dt>{es ? "causalidad afirmada" : "causation claimed"}</dt><dd>0</dd></div>
          <div><dt>{es ? "estado de validación" : "validation state"}</dt><dd className={styles.state}>{validationCase.liveValidation?.state.replaceAll("-", " ") ?? "documented"}</dd></div>
        </dl>
        <div className={styles.boundary}>
          <div><h3>{es ? "Lo que sí prueba" : "What it does show"}</h3><p>{es ? "AVELA pudo detectar una oportunidad comercialmente relevante antes de que apareciera públicamente una ejecución comparable." : "AVELA could surface a commercially relevant opportunity before a comparable execution became public."}</p></div>
          <div><h3>{es ? "Lo que no prueba" : "What it does not show"}</h3><p>{validationCase.caveat[lang]}</p></div>
        </div>
        <Link className={ed.textLink} href="/app/learning">{es ? "Abrir la evidencia completa ↗" : "Open the full evidence trail ↗"}</Link>
      </section>

      <section className={styles.problem} aria-labelledby="problem-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "El problema comercial" : "The commercial problem"}</p>
          <h2 id="problem-title">{es ? "Cada partido genera decisiones. Los datos suelen vivir separados." : "Every fixture creates decisions. The data usually lives apart."}</h2>
          <p>{es
            ? "Un club femenino independiente necesita construir hábito, no solo vender un partido. Pero calendario, atención digital, asistencia, territorio, transporte, campañas y repetición suelen analizarse en herramientas distintas o demasiado tarde."
            : "An independent women's club needs to build habit, not only sell one match. Yet fixtures, digital attention, attendance, territory, travel, campaigns and repeat behaviour are often analysed in different tools or too late."}</p>
        </div>
        <dl className={styles.rows}>
          <div><dt>{es ? "¿Dónde?" : "Where?"}</dt><dd>{es ? "Qué territorios contienen demanda alcanzable y relevante." : "Which territories contain relevant, reachable demand."}</dd></div>
          <div><dt>{es ? "¿Cuándo?" : "When?"}</dt><dd>{es ? "Qué señales hacen que una jornada requiera más captación o servicio." : "Which signals make a matchweek require more acquisition or service."}</dd></div>
          <div><dt>{es ? "¿Qué hacer?" : "What next?"}</dt><dd>{es ? "Cómo traducir el análisis en una campaña concreta y aprobable." : "How to turn analysis into a concrete, approvable campaign."}</dd></div>
          <div><dt>{es ? "¿Funcionó?" : "Did it work?"}</dt><dd>{es ? "Qué generó compra, acceso y repetición, no solo alcance." : "What created purchase, scan and repeat, not just reach."}</dd></div>
        </dl>
      </section>

      <section className={styles.thesis} aria-labelledby="thesis-title">
        <h2 id="thesis-title">{es ? "Un sistema operativo de demanda para cada partido." : "A demand operating system for every fixture."}</h2>
        <p>{es
          ? "La herramienta no intenta producir otra capa de reporting. Organiza evidencia pública y, cuando exista, información privada del club en un bucle de decisión con responsables, aprobaciones y medición."
          : "The product is not trying to create another reporting layer. It organises public evidence and, when available, private club data into a decision loop with owners, approvals and measurement."}</p>
        <ol className={styles.loop}>
          {operatingLoop.map((item) => (
            <li key={item.label.en}><strong>{pick(item.label)}</strong><span>{pick(item.text)}</span></li>
          ))}
        </ol>
      </section>

      <section className={styles.maturity} aria-labelledby="maturity-title">
        <div className={styles.maturityHead}>
          <p className={styles.label}>{es ? "Qué está demostrado" : "What is actually demonstrated"}</p>
          <h2 id="maturity-title">{es ? "Separar producto construido, evidencia observada e impacto todavía no probado." : "Separate built product, observed evidence and impact that is still unproven."}</h2>
          <p>{es
            ? "La evaluación gana credibilidad cuando no trata todas las capas como si tuvieran el mismo nivel de prueba."
            : "The evaluation is more credible when every layer is not presented as if it carries the same level of proof."}</p>
        </div>
        <div className={styles.states}>
          <article data-state="built">
            <p className={styles.label}>{es ? "Construido" : "Built"}</p>
            <h3>{es ? "Sistema de decisión operativo" : "Operational decision system"}</h3>
            <p>{es ? "Flujo desde señales y fixtures hasta campañas, acceso, partnerships, medición y control de fuentes." : "A working flow from signals and fixtures through campaigns, access, partnerships, measurement and source control."}</p>
          </article>
          <article data-state="observed">
            <p className={styles.label}>{es ? "Observado" : "Observed"}</p>
            <h3>{es ? "Primera alineación documentada con acción real" : "First documented alignment with real-world action"}</h3>
            <p>{es ? "La hipótesis Brighton + Inglaterra–España quedó registrada antes de que apareciera una activación pública comparable del club." : "The Brighton + England v Spain hypothesis was time-stamped before a comparable public club activation appeared."}</p>
          </article>
          <article data-state="pending">
            <p className={styles.label}>{es ? "Pendiente" : "Still to prove"}</p>
            <h3>{es ? "Impacto causal en conversión y repetición" : "Causal impact on conversion and repeat"}</h3>
            <p>{es ? "Requiere acceso autorizado a ticketing/CRM, instrumentación de producción y comparación controlada." : "Requires authorised ticketing/CRM access, production instrumentation and controlled comparison."}</p>
          </article>
        </div>
      </section>

      <section className={styles.metrics} aria-labelledby="metrics-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "Prueba construida" : "Proof built"}</p>
          <h2 id="metrics-title">{es ? "La demo ya conecta mercado, demanda y ejecución." : "The demo now connects market, demand and execution."}</h2>
          <p>{es ? "No es una maqueta conceptual. Cada cifra tiene un estado, una fuente y un uso definido." : "This is not a conceptual mock-up. Every number has a state, a source and a defined use."}</p>
        </div>
        <div className={styles.metricBody}>
          <dl className={styles.metricGrid}>
            <div className={styles.featured}><dt>LSOAs · {es ? "evaluadas para priorizar oportunidad territorial" : "evaluated for territory opportunity"}</dt><dd>940</dd></div>
            <div><dt>{es ? "partidos · de WSL en casa reconstruidos para 2025/26" : "fixtures · 2025/26 home WSL matches reconstructed"}</dt><dd>11</dd></div>
            <div><dt>{es ? "asistentes · reportado · registro partido a partido; WSL Analytics publica 33.775" : "attendees · reported · match-by-match ledger; WSL Analytics reports 33,775"}</dt><dd>34,939</dd></div>
            <div><dt>{es ? "récord · reportado · ante Arsenal, verificado con Sky Sports" : "record · reported · against Arsenal, verified with Sky Sports"}</dt><dd>5,414</dd></div>
          </dl>
          <dl className={styles.rail}>
            <div><dt>{es ? "Media 2025/26" : "2025/26 average"}</dt><dd>3,176</dd></div>
            <div><dt>{es ? "Mediana" : "Median"}</dt><dd>2,982</dd></div>
            <div><dt>{es ? "Media Hayes Lane" : "Hayes Lane average"}</dt><dd>3,012</dd></div>
            <div><dt>{es ? "Opener actual · registro del club" : "Current opener · club fixture record"}</dt><dd>5,402 <small>{es ? "+70% sobre la media anterior" : "+70% vs prior average"}</small></dd></div>
          </dl>
          <p className={styles.metricNote}>{es
            ? "Asistencias publicadas, no medidas por AVELA: la media, la mediana y el total salen del registro partido a partido (corroborado por ESPN). WSL Analytics publica un total de 33.775 (media 3.070); la diferencia se mantiene visible."
            : "Published attendances, not measured by AVELA: the average, median and total come from the match-by-match ledger (corroborated by ESPN). WSL Analytics reports a 33,775 total (3,070 average); the difference stays visible."}</p>
        </div>
      </section>

      <section className={styles.campaign} aria-labelledby="campaign-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "De señal a campaña" : "Signal to campaign"}</p>
          <h2 id="campaign-title">{es ? "La sugerencia termina en un briefing, no en una frase genérica." : "The recommendation ends in a brief, not a generic sentence."}</h2>
          <p>{es
            ? "Brighton es el primer caso donde el brief generado puede compararse con una acción pública posterior. El valor ya no está solo en producir una campaña, sino en aprender si la hipótesis era relevante."
            : "Brighton is the first case where a generated brief can be compared with a later public action. The value is no longer only producing a campaign; it is learning whether the hypothesis was relevant."}</p>
          <Link className={ed.textLink} href="/app/campaigns">{es ? "Ver el Campaign Lab en contexto ↗" : "See the Campaign Lab in context ↗"}</Link>
        </div>
        <div className={styles.brief}>
          <div className={styles.briefLead}>
            <p className={styles.label}>{es ? "Campaña piloto" : "Pilot campaign"}</p>
            <h3>{es ? "Brighton · El primer partido de la doble sesión" : "Brighton · The first match of the double-header"}</h3>
            <p>{es ? "Objetivo: convertir la atención del opener y la oportunidad local en intención cualificada de entrada." : "Objective: turn opener attention and local opportunity into qualified ticket intent."}</p>
            <strong>{es ? "Borrador · Sin inversión autorizada" : "Draft · No spend authorised"}</strong>
          </div>
          <dl className={styles.briefFacts}>
            <div><dt>{es ? "playbooks reutilizables" : "reusable playbooks"}</dt><dd>4</dd></div>
            <div><dt>{es ? "activaciones coordinadas" : "coordinated activations"}</dt><dd>4</dd></div>
            <div><dt>{es ? "IDs de atribución" : "attribution IDs"}</dt><dd>6</dd></div>
            <div><dt>{es ? "aprobaciones listas" : "approvals ready"}</dt><dd>1/4</dd></div>
          </dl>
          <ul className={styles.playbooks} aria-label={es ? "Playbooks" : "Playbooks"}>
            {["Back to Bromley", "The next chapter", "Alexia → London City", "Matchday confidence"].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className={styles.funnel} aria-labelledby="funnel-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "De alcance a demanda" : "From reach to demand"}</p>
          <h2 id="funnel-title">{es ? "No sumar audiencias distintas. Conectarlas." : "Do not add unlike audiences. Connect them."}</h2>
          <p>{es ? "YouTube, Eleven TV, televisión, búsquedas, entradas y asistencia se mantienen como métricas diferentes dentro del mismo recorrido." : "YouTube, Eleven TV, broadcast, search, tickets and attendance remain different measures inside the same journey."}</p>
        </div>
        <ol className={styles.stages}>
          {[es ? "Alcance" : "Reach", es ? "Interacción" : "Engage", es ? "Intención" : "Intent", es ? "Compra / acceso" : "Buy / scan", es ? "Repetición" : "Repeat"].map((item, index) => (
            <li key={item} data-restricted={index > 2 ? "" : undefined}>
              <strong>{item}</strong>
              <span>{index > 2 ? (es ? "requiere acceso" : "requires access") : (es ? "señal pública / instrumentable" : "public / instrumentable")}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.product} aria-labelledby="product-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "El producto" : "The product"}</p>
          <h2 id="product-title">{es ? "Seis preguntas operativas. Un mismo sistema." : "Six operating questions. One system."}</h2>
          <p>{es ? "La navegación evita otro dashboard infinito y lleva a cada equipo desde la decisión hacia la evidencia necesaria." : "The navigation avoids another endless dashboard and takes each team from the decision to the evidence it needs."}</p>
        </div>
        <div className={styles.views}>
          {productViews.map((view) => (
            <article key={view.title.en}>
              <h3>{pick(view.title)}</h3>
              <p>{pick(view.text)}</p>
              <Link className={ed.textLink} href={view.href}>{pick(view.cta)} ↗</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.value} aria-labelledby="value-title">
        <h2 id="value-title">{es ? "Una capa de coordinación para equipos con poco tiempo." : "A coordination layer for teams with limited time."}</h2>
        <dl className={styles.valueGrid}>
          {valueCards.map((card) => <div key={card.title.en}><dt>{pick(card.title)}</dt><dd>{pick(card.text)}</dd></div>)}
        </dl>
        <blockquote className={styles.quote}>
          {es ? "La oportunidad no es tener más datos. Es cerrar mejor el recorrido entre señal, decisión, campaña y aprendizaje." : "The opportunity is not more data. It is closing the loop from signal to decision, campaign and learning."}
        </blockquote>
      </section>

      <section className={styles.next} aria-labelledby="next-title">
        <div className={styles.intro}>
          <p className={styles.label}>{es ? "De demo a piloto" : "From demo to pilot"}</p>
          <h2 id="next-title">{es ? "El siguiente salto no es más UI. Es cerrar el bucle con datos de club." : "The next leap is not more UI. It is closing the loop with club data."}</h2>
          <p>{es ? "Un piloto real conectaría datos privados mínimos, instrumentaría una o dos decisiones por partido y revisaría resultados contra un baseline antes de ampliar alcance." : "A real pilot would connect the minimum private data, instrument one or two fixture decisions and review outcomes against a baseline before expanding scope."}</p>
          <div className={ed.actions}>
            <Link className={ed.coralButton} href="/app/learning">{es ? "Ver control de evidencia" : "Open evidence control"}</Link>
            <Link className={ed.textLink} href="/case-study/technical">{es ? "Revisar metodología ↗" : "Review methodology ↗"}</Link>
          </div>
        </div>
        <dl className={styles.pilotSteps}>
          <div><dt>{es ? "Conectar" : "Connect"}</dt><dd>{es ? "Ticketing, scans y CRM mediante contratos ya definidos." : "Ticketing, scans and CRM through already-defined contracts."}</dd></div>
          <div><dt>{es ? "Instrumentar" : "Instrument"}</dt><dd>{es ? "Una campaña y una experiencia con IDs y eventos trazables." : "One campaign and one experience with traceable IDs and events."}</dd></div>
          <div><dt>{es ? "Comparar" : "Compare"}</dt><dd>{es ? "Baseline, resultado, no-show, primera visita y repetición." : "Baseline, outcome, no-show, first visit and repeat."}</dd></div>
          <div><dt>{es ? "Decidir" : "Decide"}</dt><dd>{es ? "Escalar, adaptar o parar según evidencia observada." : "Scale, adapt or stop based on observed evidence."}</dd></div>
        </dl>
      </section>

      <p className={styles.affiliation}>
        <strong>AVELA · London City Live Proof</strong>
        <span>{es ? "Demo independiente · No afiliada a London City Lionesses." : "Independent demo · Not affiliated with London City Lionesses."}</span>
      </p>

      <MarketingFooter />
    </main>
  );
}
