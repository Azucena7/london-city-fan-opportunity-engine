import styles from "./CommercialOperatingFlow.module.css";

const sources = [
  ["Demand", "CRM + ticketing"],
  ["Performance", "Analytics + Blinkfire"],
  ["Rights", "Drive + contracts"],
  ["Capacity", "People + calendars"],
  ["Execution", "Asana / Monday / ClickUp / Trello"]
] as const;

const plays = [
  {
    kicker: "Grow the fixture",
    title: "Turn a signal into a campaign that can actually ship.",
    detail: "Audience, channel, offer, owner, constraints and measurement are prepared around the same decision."
  },
  {
    kicker: "Deliver the partnership",
    title: "Turn contract truth into activations, readiness and proof.",
    detail: "Obligations, rights, matchday windows, work orders and reporting stay connected."
  },
  {
    kicker: "Deploy the right people",
    title: "Use players and staff with rights, capacity and value exchange visible.",
    detail: "Commercial fit never overrides availability, contractual truth or human approval."
  }
] as const;

export function CommercialOperatingFlow() {
  return (
    <section className={styles.wrap} aria-labelledby="operating-flow-title">
      <div className={styles.intro}>
        <span>From signal to execution</span>
        <h2 id="operating-flow-title">AVELA prepares what should happen next — then shows what needs your decision.</h2>
        <p>
          The club keeps its specialist systems. AVELA turns fragmented context into a prepared decision,
          checks whether it can happen, and carries the result into execution and learning.
        </p>
      </div>

      <div className={styles.stage} aria-label="AVELA operating flow">
        <div className={styles.sourceRail}>
          {sources.map(([label, detail], index) => (
            <div className={styles.source} key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{label}</small><strong>{detail}</strong></div>
            </div>
          ))}
        </div>

        <div className={styles.engine}>
          <div className={styles.engineHalo} aria-hidden="true" />
          <span className={styles.engineLabel}>AVELA</span>
          <strong>Decision orchestration</strong>
          <div className={styles.engineFlow}>
            <span>Read</span><i>→</i><span>Decide</span><i>→</i><span>Check</span><i>→</i><span>Prepare</span>
          </div>
          <p>Evidence + context + rights + timing + ownership + capacity</p>
          <div className={styles.engineAction}>Human approval where it matters</div>
        </div>

        <div className={styles.outputRail}>
          <div><span>01</span><strong>Activation ready</strong><small>or clearly blocked</small></div>
          <div><span>02</span><strong>Work prepared</strong><small>for the club&apos;s execution tool</small></div>
          <div><span>03</span><strong>Evidence retained</strong><small>to improve the next decision</small></div>
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
