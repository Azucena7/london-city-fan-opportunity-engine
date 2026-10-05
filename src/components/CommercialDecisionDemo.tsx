import type { CSSProperties } from "react";
import styles from "./CommercialDecisionDemo.module.css";

const scenarios = [
  {
    label: "01 · Early fixture read",
    signals: ["Ticket pace below target", "Family audience reachable", "Weekend home fixture"],
    decision: "Prioritise a family return-attendance campaign.",
    outcome: "Audience: families · Message: come back together"
  },
  {
    label: "02 · Context shifts",
    signals: ["Local event collision", "Organic interest rises", "Paid media capacity limited"],
    decision: "Narrow the audience and move spend closer to high-intent segments.",
    outcome: "Audience: warm CRM · Channel: owned first"
  },
  {
    label: "03 · Demand strengthens",
    signals: ["Sales velocity improves", "Player content overperforms", "Inventory pressure increases"],
    decision: "Stop discount-led messaging and switch to urgency plus player-led creative.",
    outcome: "Message: scarcity · Creative: player-led"
  }
] as const;

export function CommercialDecisionDemo() {
  return (
    <section className={styles.wrap} aria-labelledby="decision-demo-title">
      <div className={styles.intro}>
        <span>See AVELA think about a match</span>
        <h2 id="decision-demo-title">One fixture. Different signals. A different marketing decision.</h2>
        <p>
          Illustrative matchday simulation: AVELA reads demand, audience, timing, local context and club capacity,
          then changes the recommended marketing play as the picture changes.
        </p>
      </div>

      <div className={styles.stage}>
        <div className={styles.rail} aria-hidden="true"><i /><i /><i /></div>
        {scenarios.map((scenario, index) => (
          <article key={scenario.label} className={styles.scenario} style={{ "--delay": `${index * 2.4}s` } as CSSProperties}>
            <div className={styles.scenarioHead}>
              <span>{scenario.label}</span>
              <strong>Match context changes</strong>
            </div>
            <div className={styles.signalStack}>
              {scenario.signals.map((signal, signalIndex) => (
                <div key={signal} style={{ "--signal-delay": `${index * 2.4 + signalIndex * 0.28}s` } as CSSProperties}>
                  <span>{String(signalIndex + 1).padStart(2, "0")}</span>
                  <strong>{signal}</strong>
                </div>
              ))}
            </div>
            <div className={styles.flowArrow} aria-hidden="true">→</div>
            <div className={styles.decision}>
              <span>Recommended marketing play</span>
              <strong>{scenario.decision}</strong>
              <small>{scenario.outcome}</small>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.footer}>
        <span>Fixture</span><i>→</i><span>Signals</span><i>→</i><span>Audience + offer + channel</span><i>→</i><strong>Measured matchday learning</strong>
      </div>
    </section>
  );
}
