import styles from "./CommercialOperatingFlow.module.css";

const sources = [
  ["Demand", "CRM + ticketing"],
  ["Performance", "Analytics + Blinkfire"],
  ["Rights", "Drive + contracts"],
  ["Capacity", "People + calendars"],
  ["Execution", "Work-management tools"]
] as const;

const steps = [
  ["01", "Read", "Signals + context"],
  ["02", "Decide", "Priority + feasibility"],
  ["03", "Prepare", "Activation + work order"],
  ["04", "Learn", "Evidence retained"]
] as const;

const outcomes = [
  ["Activation ready", "or the blocker is explicit"],
  ["Work prepared", "for the club's execution tool"],
  ["Next decision improved", "because the outcome is retained"]
] as const;

const plays = [
  {
    kicker: "Grow the fixture",
    title: "Signal → campaign",
    detail: "Audience, channel, offer and measurement prepared together."
  },
  {
    kicker: "Deliver the partnership",
    title: "Contract → activation",
    detail: "Rights, obligations, readiness and proof stay connected."
  },
  {
    kicker: "Deploy the right people",
    title: "Rights → best-fit people",
    detail: "Availability, capacity and value exchange remain visible."
  }
] as const;

export function CommercialOperatingFlow() {
  return (
    <section className={styles.wrap} aria-labelledby="operating-flow-title">
      <div className={styles.intro}>
        <span>From signal to execution</span>
        <div>
          <h2 id="operating-flow-title">From fragmented context to a prepared decision.</h2>
          <p>
            AVELA does the joining before the meeting: what changed, what matters, what can happen,
            what is prepared, and what still needs a human decision.
          </p>
        </div>
      </div>

      <div className={styles.stage} aria-label="AVELA operating flow">
        <div className={styles.sourcesLabel}>Club context</div>
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
            <strong>Decision orchestration</strong>
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
          <div className={styles.approval}>Human approval where it matters</div>
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
