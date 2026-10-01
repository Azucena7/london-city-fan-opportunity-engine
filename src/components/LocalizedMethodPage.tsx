"use client";

import { NavTabs } from "./NavTabs";
import { AiTransparency } from "./AiTransparency";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";

const decisionStages = [
  {
    id: "signal",
    code: "01",
    en: { title: "Observe", question: "What changed?", text: "Read verified public signals and preserve uncertainty when a source is missing or degraded." },
    es: { title: "Observar", question: "¿Qué ha cambiado?", text: "Leer señales públicas verificadas y conservar la incertidumbre cuando una fuente falta o está degradada." }
  },
  {
    id: "context",
    code: "02",
    en: { title: "Frame", question: "Does it matter here?", text: "Join the signal to the fixture, territory, audience or access context where it could change a decision." },
    es: { title: "Enmarcar", question: "¿Importa aquí?", text: "Unir la señal al partido, territorio, audiencia o contexto de acceso donde podría cambiar una decisión." }
  },
  {
    id: "hypothesis",
    code: "03",
    en: { title: "Hypothesise", question: "What should we test?", text: "Turn the context into a concrete action, campaign, experience or service hypothesis with a traceable ID." },
    es: { title: "Hipotetizar", question: "¿Qué deberíamos probar?", text: "Convertir el contexto en una acción, campaña, experiencia o servicio concreto con un ID trazable." }
  },
  {
    id: "gate",
    code: "04",
    en: { title: "Gate", question: "Do we have the right to act?", text: "Check evidence, permissions, instrumentation, rights and operational dependencies before anything advances." },
    es: { title: "Filtrar", question: "¿Tenemos derecho a actuar?", text: "Comprobar evidencia, permisos, instrumentación, derechos y dependencias operativas antes de avanzar." }
  },
  {
    id: "observe",
    code: "05",
    en: { title: "Observe reality", question: "What actually happened?", text: "Capture measured outcomes or later observable market action without converting alignment into causation." },
    es: { title: "Observar la realidad", question: "¿Qué ocurrió realmente?", text: "Capturar resultados medidos o acciones de mercado posteriores sin convertir alineación en causalidad." }
  },
  {
    id: "learn",
    code: "06",
    en: { title: "Learn", question: "What changes next?", text: "Keep, adapt or stop the hypothesis and carry the learning into the next fixture decision." },
    es: { title: "Aprender", question: "¿Qué cambia después?", text: "Mantener, adaptar o parar la hipótesis y llevar el aprendizaje a la siguiente decisión de partido." }
  }
] as const;

export function LocalizedMethodPage() {
  const { lang } = useLanguage();
  const es = lang === "es";

  return (
    <main>
      <NavTabs />

      <section className="compactIntro methodIntro">
        <div className="eyebrow">{es ? "MÉTODO" : "METHOD"}</div>
        <h1>{es ? "Cómo una señal se gana el derecho a convertirse en decisión" : "How a signal earns the right to become a decision"}</h1>
        <p className="lede">
          {es
            ? "El sistema no salta de dato a recomendación. Cada decisión pasa por un ciclo explícito y puede detenerse si la evidencia, el acceso o las aprobaciones no son suficientes."
            : "The engine does not jump from data to recommendation. Every decision passes through an explicit lifecycle and can stop when evidence, access or approvals are insufficient."}
        </p>
      </section>

      <section className="methodDecisionLifecycle" aria-labelledby="method-lifecycle-title">
        <div className="methodLifecycleHead">
          <div>
            <div className="eyebrow">{es ? "CICLO DE DECISIÓN" : "DECISION LIFECYCLE"}</div>
            <h2 id="method-lifecycle-title">{es ? "Seis pasos. Tres oportunidades para parar." : "Six stages. Three chances to stop."}</h2>
          </div>
          <p>{es
            ? "Una decisión puede quedar matizada por una fuente, bloqueada por falta de evidencia o detenida por un gate humano. El score nunca invalida esos límites."
            : "A decision can be qualified by a source, blocked by missing evidence or stopped by a human gate. A score never overrides those limits."}</p>
        </div>

        <div className="methodLifecycleGrid">
          {decisionStages.map((stage) => {
            const copy = stage[lang];
            return (
              <article key={stage.id} className={stage.id === "gate" || stage.id === "observe" ? "controlStage" : ""}>
                <span>{stage.code}</span>
                <strong>{copy.title}</strong>
                <h3>{copy.question}</h3>
                <p>{copy.text}</p>
              </article>
            );
          })}
        </div>

        <div className="methodStopRules">
          <article><span>{es ? "STOP RULE 01" : "STOP RULE 01"}</span><strong>{es ? "Dato ausente ≠ cero" : "Missing data ≠ zero"}</strong><p>{es ? "Una fuente no disponible reduce confianza o bloquea la decisión; nunca se rellena con una falsa observación." : "An unavailable source reduces confidence or blocks the decision; it is never filled with a false observation."}</p></article>
          <article><span>{es ? "STOP RULE 02" : "STOP RULE 02"}</span><strong>{es ? "Score ≠ permiso" : "Score ≠ permission"}</strong><p>{es ? "Una puntuación alta no puede superar derechos, privacidad, presupuesto, inventario o aprobación humana." : "A high score cannot override rights, privacy, budget, inventory or human approval."}</p></article>
          <article><span>{es ? "STOP RULE 03" : "STOP RULE 03"}</span><strong>{es ? "Alineación ≠ causalidad" : "Alignment ≠ causation"}</strong><p>{es ? "Que una hipótesis se parezca a una acción posterior del mercado es evidencia de relevancia, no de influencia." : "A later market action resembling a prior hypothesis is evidence of relevance—not influence."}</p></article>
        </div>
      </section>

      <details className="methodDisclosure methodScoringDisclosure">
        <summary>
          <div>
            <span>{es ? "SCORING Y PRIORIZACIÓN" : "SCORING & PRIORITISATION"}</span>
            <strong>{es ? "Cómo se calculan WHERE, WHEN y MATCHWEEK" : "How WHERE, WHEN and MATCHWEEK are calculated"}</strong>
          </div>
        </summary>
        <div className="methodDisclosureBody">
          <section className="architecturePanel block15ArchitecturePanel">
            <div className="architectureStart">940 LSOAs</div>
            <div className="architectureFlow" aria-label={es ? "Arquitectura de priorización" : "Prioritisation architecture"}>
              <div><span>WHERE</span><strong>{es ? "Dónde" : "Where"}</strong></div><b>→</b>
              <div><span>WHEN</span><strong>{es ? "Cuándo" : "When"}</strong></div><b>→</b>
              <div><span>MATCHWEEK</span><strong>{es ? "Qué cambia" : "What changes"}</strong></div><b>→</b>
              <div><span>ACTION</span><strong>{es ? "Qué hacer" : "What to do"}</strong></div>
            </div>
          </section>

          <section className="methodLayers block15MethodLayers">
            <article>
              <div className="methodLayerTop"><span>WHERE</span><SignalBadge type="STRUCTURAL" /></div>
              <h3>{es ? "Oportunidad territorial" : "Territory opportunity"}</h3>
              <p className="formulaLine">35% Family · 35% Girls network · 30% Access</p>
              <p>{es ? "Competition Pressure e IDACI se conservan como contexto; no reducen automáticamente la oportunidad." : "Competition Pressure and IDACI remain context; they do not automatically reduce opportunity."}</p>
            </article>

            <article>
              <div className="methodLayerTop"><span>WHEN</span><SignalBadge type="PLANNING" /></div>
              <h3>{es ? "Score de planificación" : "Planning score"}</h3>
              <p className="formulaLine">35% Territory · 25% Calendar · 20% Attention · 20% Appeal</p>
              <p>{es ? "Prioriza qué partidos merecen más atención operativa; no autoriza inversión por sí mismo." : "Prioritises which fixtures deserve more operating attention; it does not authorise spend by itself."}</p>
            </article>

            <article>
              <div className="methodLayerTop"><span>MATCHWEEK</span><SignalBadge type="DYNAMIC" /></div>
              <h3>{es ? "Capa dinámica" : "Dynamic layer"}</h3>
              <p className="formulaLine">30 Territory · 20 Calendar · 15 Attention · 10 Appeal · 10 Weather · 15 Momentum</p>
              <p>{es ? "Weather entra solo con forecast fiable. Momentum permanece WAITING hasta disponer de datos verificados." : "Weather activates only with a reliable forecast. Momentum remains WAITING until verified data exists."}</p>
            </article>
          </section>
        </div>
      </details>

      <section className="methodDetailStack">
        <details className="methodDisclosure">
          <summary>
            <div><span>{es ? "EVIDENCIA Y DATOS" : "EVIDENCE & DATA"}</span><strong>{es ? "Qué sabemos, qué contextualizamos y qué falta conectar" : "What is known, contextual and still to connect"}</strong></div>
          </summary>
          <div className="methodDisclosureBody">
            <AiTransparency />

            <section className="dataDisciplinePanel block15DataDiscipline">
              <div className="sectionHeader">
                <div>
                  <div className="eyebrow">{es ? "DISCIPLINA DE DATOS" : "DATA DISCIPLINE"}</div>
                  <h3>{es ? "Investigamos más variables de las que puntuamos" : "We investigate more variables than we score"}</h3>
                </div>
              </div>
              <div className="disciplineColumns">
                <div><span>{es ? "MOTOR ACTUAL" : "CURRENT ENGINE"}</span><p>Families · girls network · public-transport access · calendar whitespace · attention availability · fixture appeal · weather when available</p></div>
                <div><span>{es ? "SOLO CONTEXTO · 0% PESO" : "CONTEXT ONLY · 0% WEIGHT"}</span><p>Competition Pressure · IDACI / deprivation · local retail / BID / station research</p></div>
                <div><span>{es ? "SIGUIENTE CAPA CONECTADA" : "NEXT CONNECTED LAYER"}</span><p>Paid media · ticket conversion · scans · first-time households · repeat ≤90d · realised £/ticket · acquisition source</p></div>
              </div>
            </section>
          </div>
        </details>

        <details className="methodDisclosure">
          <summary>
            <div><span>{es ? "RITMO OPERATIVO" : "OPERATING CADENCE"}</span><strong>{es ? "Cuándo se revisa cada tipo de señal" : "When each signal type is revisited"}</strong></div>
          </summary>
          <div className="methodDisclosureBody">
            <section className="operatingLoopPanel">
              <div><span>6 weeks</span><strong>{es ? "Calendario y atención" : "Calendar & attention"}</strong></div>
              <b>→</b><div><span>7 days</span><strong>Weather</strong></div>
              <b>→</b><div><span>72h</span><strong>{es ? "Revisar acceso" : "Review access"}</strong></div>
              <b>→</b><div><span>24h</span><strong>{es ? "Cerrar acción" : "Lock action"}</strong></div>
              <b>→</b><div><span>Post-match</span><strong>{es ? "Observar y aprender" : "Observe & learn"}</strong></div>
            </section>
          </div>
        </details>

        <details className="methodDisclosure">
          <summary>
            <div><span>{es ? "IA Y LÍMITES" : "AI & LIMITATIONS"}</span><strong>{es ? "Qué acelera la IA y qué no afirma el modelo" : "What AI accelerates and what the model does not claim"}</strong></div>
          </summary>
          <div className="methodDisclosureBody">
            <section className="aiPrinciplePanel block15AiPanel">
              <div className="eyebrow">{es ? "QUÉ ES IA AQUÍ" : "WHAT IS AI HERE"}</div>
              <h3>{es ? "El sistema no es una caja negra predictiva." : "The engine is not a black-box prediction model."}</h3>
              <p>{es ? "La lógica de scoring es transparente y basada en reglas. La IA acelera investigación, síntesis, prototipado e iteración; las decisiones comerciales siguen siendo humanas." : "The scoring logic is transparent and rule-based. AI accelerates research, synthesis, prototyping and iteration; commercial decisions remain human-led."}</p>
              <p className="methodLimitLine">{es ? "No predice exactamente qué persona comprará, no garantiza nuevos fans, no atribuye causalidad a una coincidencia y no sustituye aprobaciones humanas." : "It does not predict exactly which individual will buy, guarantee new fans, turn alignment into causation or replace human approvals."}</p>
            </section>
          </div>
        </details>
      </section>
    </main>
  );
}
