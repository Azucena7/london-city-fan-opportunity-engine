"use client";

import { NavTabs } from "./NavTabs";
import { AiTransparency } from "./AiTransparency";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";

export function LocalizedMethodPage() {
  const { lang } = useLanguage();
  const es = lang === "es";

  return (
    <main>
      <NavTabs />

      <section className="compactIntro">
        <div className="eyebrow">{es ? "MÉTODO" : "METHOD"}</div>
        <h1>{es ? "Cómo llega el sistema a una decisión" : "How the engine reaches a decision"}</h1>
        <p className="lede">
          {es
            ? "Primero dónde. Después cuándo. Cerca del partido, solo cambian las señales dinámicas. Cada inferencia se etiqueta como inferencia."
            : "First where. Then when. Close to the fixture, only dynamic signals change. Every inference is labelled as an inference."}
        </p>
      </section>

      <section className="architecturePanel block15ArchitecturePanel">
        <div className="architectureStart">940 LSOAs</div>
        <div className="architectureFlow" aria-label="Operating architecture">
          <div><span>WHERE</span><strong>{es ? "Dónde" : "Where"}</strong></div><b>→</b>
          <div><span>WHEN</span><strong>{es ? "Cuándo" : "When"}</strong></div><b>→</b>
          <div><span>MATCHWEEK</span><strong>{es ? "Qué cambia" : "What changes"}</strong></div><b>→</b>
          <div><span>ACTION</span><strong>{es ? "Qué hacer" : "What to do"}</strong></div><b>→</b>
          <div><span>LEARN</span><strong>{es ? "Qué aprender" : "What to learn"}</strong></div>
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
          <p>{es ? "Decide en qué partidos aumentar, probar o defender la intensidad de captación." : "Decides which fixtures deserve attack, test or core-defence intensity."}</p>
        </article>

        <article>
          <div className="methodLayerTop"><span>MATCHWEEK</span><SignalBadge type="DYNAMIC" /></div>
          <h3>{es ? "Capa dinámica" : "Dynamic layer"}</h3>
          <p className="formulaLine">30 Territory · 20 Calendar · 15 Attention · 10 Appeal · 10 Weather · 15 Momentum</p>
          <p>{es ? "Weather se activa cuando existe forecast fiable. Attendance Momentum sigue WAITING hasta disponer de datos verificados." : "Weather activates inside a reliable forecast window. Attendance Momentum stays WAITING until verified data exists."}</p>
        </article>
      </section>

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
                  <h3>{es ? "Investigamos más variables de las que puntuamos" : "We investigated more variables than we scored"}</h3>
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
              <b>→</b><div><span>Post-match</span><strong>Learn</strong></div>
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
              <p className="methodLimitLine">{es ? "No predice exactamente qué persona comprará, no garantiza 1.000 nuevos fans y no atribuye causalidad a paid media." : "It does not predict exactly which individual will buy, guarantee 1,000 new fans, or claim causal paid-media uplift."}</p>
            </section>
          </div>
        </details>
      </section>
    </main>
  );
}
