import styles from "./CommercialOperatingFlow.module.css";

const sources = [
  ["External context", "Weather · transport · city events · football"],
  ["Demand", "CRM + ticketing"],
  ["Performance", "Analytics + Blinkfire"],
  ["Rights", "Drive + contracts"],
  ["Capacity", "People + calendars"]
] as const;

const steps = [
  ["01", "See", "What changed"],
  ["02", "Judge", "What matters"],
  ["03", "Prepare", "What can move"],
  ["04", "Learn", "What improves next"]
] as const;

const outcomes = [
  ["Attention", "What needs a decision today"],
  ["Commercial value", "What can be sold, protected or fulfilled"],
  ["Execution", "What is ready, at risk or blocked"]
] as const;

const plays = [
  {
    kicker: "Grow the fixture",
    title: "Where can we create more demand?",
    detail: "AVELA turns changing signals into a prepared audience, offer, channel and measurement plan."
  },
  {
    kicker: "Deliver the partnership",
    title: "Are we fulfilling — or leaving value unused?",
    detail: "Obligations, rights, activation windows and incremental opportunities stay visible together."
  },
  {
    kicker: "Deploy the right people",
    title: "Who can we use, and is it the right use?",
    detail: "Rights, availability, capacity and commercial fit are checked before the activation is prepared."
  }
] as const;

export function CommercialOperatingFlow() {
  return (
    <section className={styles.wrap} aria-labelledby="operating-flow-title">
      <div className={styles.intro}>
        <span>What AVELA gives you</span>
        <div>
          <h2 id="operating-flow-title">Walk into the meeting already knowing where the decision is.</h2>
          <p>
            Instead of expecting the team to monitor weather, transport, city agendas, competing football, CRM, contracts and availability at once, AVELA brings the signals that actually change the decision into one operating view.
          </p>
        </div>
      </div>

      <div className={styles.stage} aria-label="AVELA operating flow">
        <div className={styles.sourcesLabel}>External signals + club context</div>
        <div className={styles.sourceRail}>
          {sources.map(([label, detail]) => (
            <div className={styles.source} key={label}>
              <small>{label}</small>
              <strong>{detail}</strong>
            </div>
          ))}
        </div>

        <div className={styles.engine}>
          <div className={styles.engineMark}>
            <span>AVELA</span>
            <strong>One operating view</strong>
          </div>
          <div className={styles.stepRail}>
            {steps.map(([num, label, detail], index) => (
              <div className={styles.step} key={label}>
                <span>{num}</span>
                <div><strong>{label}</strong><small>{detail}</small></div>
                {index < steps.length - 1 ? <i aria-hidden="true">→</i> : null}
              </div>
            ))}
          </div>
          <div className={styles.approval}>You keep the decision</div>
        </div>

        <div className={styles.outcomes}>
          {outcomes.map(([title, detail], index) => (
            <div key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.playGrid}>
        {plays.map((play) => (
          <article key={play.kicker}>
            <span>{play.kicker}</span>
            <h3>{play.title}</h3>
            <p>{play.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
