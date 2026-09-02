"use client";

import Link from "next/link";
import { NavTabs } from "@/components/NavTabs";
import { useLanguage } from "@/components/LanguageProvider";

const FULL_CASE_STUDY_URL = "https://gamma.app/docs/kjxuybiifkup0qm";

type Copy = {
  eyebrow: string;
  title: string;
  lede: string;
  prototypeCta: string;
  fullCta: string;
  disclosure: string;
  problemEyebrow: string;
  problemTitle: string;
  problemText: string;
  inheritedTitle: string;
  inheritedText: string;
  independentTitle: string;
  independentText: string;
  operatingQuestion: string;
  insightEyebrow: string;
  insightTitle: string;
  insightQuote: string;
  insightText: string;
  competitionTitle: string;
  competitionText: string;
  demandTitle: string;
  demandText: string;
  contextNote: string;
  proofEyebrow: string;
  proofTitle: string;
  opportunity: string;
  competition: string;
  contextOnly: string;
  decision: string;
  proofSignals: string[];
  proofConclusion: string;
  systemEyebrow: string;
  systemTitle: string;
  systemText: string;
  where: string;
  whereText: string;
  when: string;
  whenText: string;
  matchweek: string;
  matchweekText: string;
  action: string;
  actionText: string;
  learn: string;
  learnText: string;
  productEyebrow: string;
  productTitle: string;
  productText: string;
  thisWeek: string;
  operatingDecision: string;
  target: string;
  channel: string;
  message: string;
  matchweekStatus: string;
  openThisWeek: string;
  biggerEyebrow: string;
  biggerTitle: string;
  biggerText: string;
  biggerQuote: string;
  biggerSupport: string;
  readFull: string;
  methodology: string;
};

const copy: Record<"en" | "es", Copy> = {
  en: {
    eyebrow: "CASE STUDY · SHORT VERSION",
    title: "Where are London City Lionesses’ next 1,000 recurring fans?",
    lede:
      "A practical case study in turning local audience data, match context and public-transport access into weekly growth decisions for women’s football.",
    prototypeCta: "Explore the live prototype",
    fullCta: "Read the full case study",
    disclosure:
      "Independent prototype · London City used as a live case study · ‘Next 1,000’ is a prioritisation question, not a forecast.",
    problemEyebrow: "THE BUSINESS PROBLEM",
    problemTitle: "London City starts from a different place.",
    problemText:
      "An independent women-first club cannot simply assume an inherited local fanbase or decades of existing matchday behaviour from a men’s club.",
    inheritedTitle: "Traditional club",
    inheritedText: "Inherited football habit → existing fanbase → matchday routine",
    independentTitle: "Independent women-first club",
    independentText: "Audience has to be found → acquired → converted → retained",
    operatingQuestion: "Where should a small team spend its next hour and its next £1?",
    insightEyebrow: "THE INSIGHT",
    insightTitle: "Maybe you’re competing for Sunday — not allegiance.",
    insightQuote: "You don’t need to change your club. You just need a great Sunday.",
    insightText:
      "High football interest can be competitive pressure, but it can also be evidence of an audience already comfortable with live football.",
    competitionTitle: "Competition",
    competitionText: "Existing loyalties and local alternatives.",
    demandTitle: "Evidence of demand",
    demandText: "A football-engaged market already primed for matchday attendance.",
    contextNote: "Competition Pressure is context only — it is not automatically deducted from Territory Opportunity.",
    proofEyebrow: "THE CROYDON CONTRADICTION",
    proofTitle: "94 Opportunity. 92 Competition. Still ATTACK.",
    opportunity: "Opportunity",
    competition: "Competition context",
    contextOnly: "Not deducted",
    decision: "Decision: ATTACK",
    proofSignals: [
      "288 dependent-child households",
      "Girls Network Score 100",
      "≈25 min Sunday public-transport journey",
      "0 transfers",
      "Crystal Palace Women ≈2.3 km away"
    ],
    proofConclusion:
      "High football interest isn’t always just competition. Sometimes it is evidence of demand.",
    systemEyebrow: "HOW THE SYSTEM WORKS",
    systemTitle: "From 940 LSOAs to a weekly action.",
    systemText: "The Lab is a decision loop, not a static dashboard.",
    where: "WHERE",
    whereText: "Family potential × girls football network × access",
    when: "WHEN",
    whenText: "Calendar × attention × fixture appeal",
    matchweek: "MATCHWEEK",
    matchweekText: "Weather × planned travel friction × attendance momentum when verified",
    action: "ACTION",
    actionText: "Attack hard · Attack · Test · Defend",
    learn: "LEARN",
    learnText: "Ticket → Scan → First-time household → Repeat ≤90d",
    productEyebrow: "THE PRODUCT",
    productTitle: "The model does not produce a report. It produces a weekly operating decision.",
    productText:
      "This Week turns the model into one clear action, then lets the user drill into opportunities, access and methodology only when needed.",
    thisWeek: "THIS WEEK",
    operatingDecision: "Weekly operating decision",
    target: "Target territory",
    channel: "Channel focus",
    message: "Message angle",
    matchweekStatus: "Matchweek status",
    openThisWeek: "Open This Week",
    biggerEyebrow: "THE BIGGER IDEA",
    biggerTitle: "This isn’t really a London City problem.",
    biggerText:
      "Women’s football teams often operate with small commercial, marketing, CRM, ticketing and fan-engagement teams — while every fixture creates dozens of decisions.",
    biggerQuote: "What if AI could give a 4-person team some of the operating capacity that previously required 10+ people?",
    biggerSupport: "Not by replacing the team. By helping it decide where to look → when to act → what to learn.",
    readFull: "Want the methodology, fixture examples, travel logic and validation design?",
    methodology: "Open the full 10-slide case study"
  },
  es: {
    eyebrow: "CASE STUDY · VERSIÓN CORTA",
    title: "¿Dónde están los próximos 1.000 espectadores recurrentes de London City Lionesses?",
    lede:
      "Un case study práctico que convierte datos locales de audiencia, contexto de partido y acceso en transporte público en decisiones semanales de crecimiento para fútbol femenino.",
    prototypeCta: "Explorar el prototipo",
    fullCta: "Ver el case study completo",
    disclosure:
      "Prototipo independiente · London City se utiliza como caso de estudio · ‘Próximos 1.000’ es una pregunta de priorización, no una predicción.",
    problemEyebrow: "EL PROBLEMA DE NEGOCIO",
    problemTitle: "London City parte de un lugar diferente.",
    problemText:
      "Un club independiente y centrado en fútbol femenino no puede asumir una base local heredada ni décadas de comportamiento de día de partido procedentes de un club masculino.",
    inheritedTitle: "Club tradicional",
    inheritedText: "Hábito heredado → base de aficionados existente → rutina de partido",
    independentTitle: "Club femenino independiente",
    independentText: "La audiencia hay que encontrarla → captarla → convertirla → retenerla",
    operatingQuestion: "¿Dónde debería invertir un equipo pequeño su próxima hora y su próximo £1?",
    insightEyebrow: "EL INSIGHT",
    insightTitle: "Quizá compites por el domingo — no por la lealtad.",
    insightQuote: "No necesitas cambiar de club. Solo necesitas un gran domingo.",
    insightText:
      "Un alto interés por el fútbol puede ser presión competitiva, pero también evidencia de una audiencia ya acostumbrada a asistir a fútbol en directo.",
    competitionTitle: "Competencia",
    competitionText: "Lealtades existentes y alternativas locales.",
    demandTitle: "Evidencia de demanda",
    demandText: "Un mercado futbolero ya preparado para la asistencia presencial.",
    contextNote: "Competition Pressure es contexto: no se resta automáticamente de Territory Opportunity.",
    proofEyebrow: "LA CONTRADICCIÓN DE CROYDON",
    proofTitle: "94 Opportunity. 92 Competition. Aun así: ATTACK.",
    opportunity: "Oportunidad",
    competition: "Contexto competitivo",
    contextOnly: "No se resta",
    decision: "Decisión: ATTACK",
    proofSignals: [
      "288 hogares con menores dependientes",
      "Girls Network Score 100",
      "≈25 min en transporte público un domingo",
      "0 transbordos",
      "Crystal Palace Women a ≈2,3 km"
    ],
    proofConclusion:
      "Un alto interés por el fútbol no siempre es solo competencia. A veces es evidencia de demanda.",
    systemEyebrow: "CÓMO FUNCIONA EL SISTEMA",
    systemTitle: "De 940 LSOAs a una acción semanal.",
    systemText: "El Lab es un bucle de decisión, no un dashboard estático.",
    where: "WHERE",
    whereText: "Potencial familiar × red de fútbol femenino × acceso",
    when: "WHEN",
    whenText: "Calendario × atención × atractivo del partido",
    matchweek: "MATCHWEEK",
    matchweekText: "Tiempo × fricción de viaje planificada × momentum de asistencia cuando esté verificado",
    action: "ACTION",
    actionText: "Attack hard · Attack · Test · Defend",
    learn: "LEARN",
    learnText: "Entrada → Acceso → Hogar nuevo → Repetición ≤90d",
    productEyebrow: "EL PRODUCTO",
    productTitle: "El modelo no produce un informe. Produce una decisión operativa semanal.",
    productText:
      "This Week convierte el modelo en una acción clara y permite profundizar en oportunidades, acceso y método solo cuando hace falta.",
    thisWeek: "ESTA SEMANA",
    operatingDecision: "Decisión operativa semanal",
    target: "Territorio objetivo",
    channel: "Canal prioritario",
    message: "Ángulo de mensaje",
    matchweekStatus: "Estado de la semana de partido",
    openThisWeek: "Abrir Esta semana",
    biggerEyebrow: "LA IDEA MÁS GRANDE",
    biggerTitle: "En realidad, este no es solo un problema de London City.",
    biggerText:
      "Muchos equipos de fútbol femenino trabajan con equipos pequeños de comercial, marketing, CRM, ticketing y fan engagement, mientras cada partido genera decenas de decisiones.",
    biggerQuote: "¿Y si la IA pudiera dar a un equipo de 4 personas parte de la capacidad operativa que antes requería 10+?",
    biggerSupport: "No sustituyendo al equipo. Ayudándole a decidir dónde mirar → cuándo actuar → qué aprender.",
    readFull: "¿Quieres ver metodología, ejemplos de partidos, lógica de viaje y diseño de validación?",
    methodology: "Abrir el case study completo de 10 slides"
  }
};

function Arrow() {
  return <span className="caseStudyArrow" aria-hidden="true">→</span>;
}

export function LocalizedStoryPage() {
  const { lang } = useLanguage();
  const c = copy[lang === "es" ? "es" : "en"];

  return (
    <main className="caseStudyPage">
      <NavTabs />

      <section className="caseStudyHero">
        <div className="eyebrow">{c.eyebrow}</div>
        <h1>{c.title}</h1>
        <p className="caseStudyHeroLede">{c.lede}</p>
        <div className="caseStudyActions">
          <Link className="caseStudyButton primary" href="/this-week">
            {c.prototypeCta}
          </Link>
          <a
            className="caseStudyButton secondary"
            href={FULL_CASE_STUDY_URL}
            target="_blank"
            rel="noreferrer"
          >
            {c.fullCta} ↗
          </a>
        </div>
        <p className="caseStudyDisclosure">{c.disclosure}</p>
      </section>

      <section className="caseStudySection caseStudyProblem">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{c.problemEyebrow}</div>
          <h2>{c.problemTitle}</h2>
          <p>{c.problemText}</p>
        </div>

        <div className="caseStudyContrast">
          <article>
            <span>01</span>
            <h3>{c.inheritedTitle}</h3>
            <p>{c.inheritedText}</p>
          </article>
          <Arrow />
          <article className="accented">
            <span>02</span>
            <h3>{c.independentTitle}</h3>
            <p>{c.independentText}</p>
          </article>
        </div>

        <blockquote className="caseStudyQuestion">{c.operatingQuestion}</blockquote>
      </section>

      <section className="caseStudySection caseStudyInsight">
        <div className="eyebrow">{c.insightEyebrow}</div>
        <h2>{c.insightTitle}</h2>
        <blockquote className="caseStudyQuote">“{c.insightQuote}”</blockquote>
        <p className="caseStudyInsightText">{c.insightText}</p>
        <div className="caseStudyDual">
          <article>
            <h3>{c.competitionTitle}</h3>
            <p>{c.competitionText}</p>
          </article>
          <article className="accented">
            <h3>{c.demandTitle}</h3>
            <p>{c.demandText}</p>
          </article>
        </div>
        <p className="caseStudyMethodNote">{c.contextNote}</p>
      </section>

      <section className="caseStudySection caseStudyProof">
        <div className="eyebrow">{c.proofEyebrow}</div>
        <h2>{c.proofTitle}</h2>
        <div className="caseStudyProofGrid">
          <div className="caseStudyStat primaryStat">
            <strong>94</strong>
            <span>{c.opportunity}</span>
          </div>
          <div className="caseStudyStat">
            <strong>92</strong>
            <span>{c.competition}</span>
            <small>{c.contextOnly}</small>
          </div>
          <div className="caseStudyDecisionStamp">{c.decision}</div>
        </div>
        <div className="caseStudySignalStrip">
          {c.proofSignals.map((signal) => <span key={signal}>{signal}</span>)}
        </div>
        <blockquote className="caseStudyProofConclusion">{c.proofConclusion}</blockquote>
      </section>

      <section className="caseStudySection caseStudySystem">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{c.systemEyebrow}</div>
          <h2>{c.systemTitle}</h2>
          <p>{c.systemText}</p>
        </div>
        <div className="caseStudyFlow" aria-label="Fan Opportunity Engine decision flow">
          <div className="caseStudyFlowStart">
            <strong>940</strong>
            <span>LSOAs</span>
          </div>
          <Arrow />
          {[
            [c.where, c.whereText],
            [c.when, c.whenText],
            [c.matchweek, c.matchweekText],
            [c.action, c.actionText],
            [c.learn, c.learnText]
          ].map(([label, text], index) => (
            <div className={`caseStudyFlowStep ${index === 4 ? "learn" : ""}`} key={label}>
              <strong>{label}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="caseStudySection caseStudyProduct">
        <div className="caseStudySectionHead">
          <div className="eyebrow">{c.productEyebrow}</div>
          <h2>{c.productTitle}</h2>
          <p>{c.productText}</p>
        </div>

        <div className="caseStudyBrowser" aria-label="Preview of the This Week operating view">
          <div className="caseStudyBrowserBar">
            <span />
            <span />
            <span />
            <small>london-city-fan-opportunity-engine.vercel.app/this-week</small>
          </div>
          <div className="caseStudyBrowserBody">
            <div className="caseStudyBrowserDecision">
              <span>{c.thisWeek}</span>
              <strong>ATTACK</strong>
              <small>{c.operatingDecision}</small>
            </div>
            <div className="caseStudyBrowserBrief">
              <div><span>{c.target}</span><strong>Croydon / priority territory</strong></div>
              <div><span>{c.channel}</span><strong>Grassroots + local digital</strong></div>
              <div><span>{c.message}</span><strong>“You don’t need to change your club…”</strong></div>
              <div><span>{c.matchweekStatus}</span><strong>Weather · Travel · Attendance</strong></div>
            </div>
          </div>
        </div>

        <Link className="caseStudyTextLink" href="/this-week">{c.openThisWeek} →</Link>
      </section>

      <section className="caseStudySection caseStudyBiggerIdea">
        <div className="eyebrow">{c.biggerEyebrow}</div>
        <h2>{c.biggerTitle}</h2>
        <p>{c.biggerText}</p>
        <blockquote>{c.biggerQuote}</blockquote>
        <p className="caseStudyBiggerSupport">{c.biggerSupport}</p>

        <div className="caseStudyFullCta">
          <div>
            <span>{c.readFull}</span>
            <strong>{c.methodology}</strong>
          </div>
          <a href={FULL_CASE_STUDY_URL} target="_blank" rel="noreferrer">
            {c.fullCta} ↗
          </a>
        </div>
      </section>

      <footer className="caseStudyFooter">
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">Independent prototype · Not affiliated with London City Lionesses.</div>
      </footer>
    </main>
  );
}
