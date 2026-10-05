import styles from "./CommercialDecisionDemo.module.css";

const scenarios = [
  {
    label: "01 · Player window",
    signals: ["Momentum rises", "Sponsor appearance due", "International call-up risk"],
    decision: "Use the strongest viable player window now.",
    outcome: "Earlier action · lower conflict risk"
  },
  {
    label: "02 · Matchday demand",
    signals: ["Family demand signal", "Local event collision", "CRM audience available"],
    decision: "Shift the offer and audience before media spend.",
    outcome: "Sharper targeting · less wasted activation"
  },
  {
    label: "03 · Commercial rights",
    signals: ["Partner objective", "Rights verified", "Creative capacity tight"],
    decision: "Reduce scope, protect the right and keep the opportunity viable.",
    outcome: "Commercial value · operationally deliverable"
  }
] as const;

export function CommercialDecisionDemo() {
  return (
    <section className={styles.wrap} aria-labelledby="decision-demo-title">
      <div className={styles.intro}>
        <span>See AVELA think</span>
        <h2 id="decision-demo-title">When the context changes, the recommendation should change with it.</h2>
        <p>This is an illustrative product simulation. It shows the decision pattern AVELA is designed to support; it is not a live club action feed.</p>
      </div>

      <div className={styles.stage}>
        <div className={styles.rail} aria-hidden="true"><i /><i /><i /></div>
        {scenarios.map((scenario, index) => (
          <article key={scenario.label} className={styles.scenario} style={{ "--delay": `${index * 2.4}s` } as React.CSSProperties}>
            <div className={styles.scenarioHead}>
              <span>{scenario.label}</span>
              <strong>Context changes</strong>
            </div>
            <div className={styles.signalStack}>
              {scenario.signals.map((signal, signalIndex) => (
                <div key={signal} style={{ "--signal-delay": `${index * 2.4 + signalIndex * 0.28}s` } as React.CSSProperties}>
                  <span>{String(signalIndex + 1).padStart(2, "0")}</span>
                  <strong>{signal}</strong>
                </div>
              ))}
            </div>
            <div className={styles.flowArrow} aria-hidden="true">→</div>
            <div className={styles.decision}>
              <span>AVELA decision</span>
              <strong>{scenario.decision}</strong>
              <small>{scenario.outcome}</small>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.footer}>
        <span>Signal</span><i>→</i><span>Constraint</span><i>→</i><span>Decision</span><i>→</i><strong>Measured learning</strong>
      </div>
    </section>
  );
}
