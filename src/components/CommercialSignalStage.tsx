import styles from "./CommercialSignalStage.module.css";

const signalRows = [
  ["01", "Fixture", "Everton · Home · 18 Oct", "Reading"],
  ["02", "Opportunity", "Return-attendance moment", "Detected"],
  ["03", "Feasibility", "Rights + people + timing checked", "Checked"],
  ["04", "Activation", "Family return path prepared", "Prepared"],
  ["05", "Execution", "Owner + work order + readiness", "Ready"],
  ["06", "Learning", "Evidence feeds the next decision", "Feeds back"]
] as const;

export function CommercialSignalStage() {
  return (
    <div className={styles.stage} aria-label="AVELA product flow">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.signalRail} aria-hidden="true">
        <span className={styles.pulseA} />
        <span className={styles.pulseB} />
        <span className={styles.pulseC} />
        <i className={styles.tracer} />
      </div>

      <div className={styles.topline}>
        <span>Live product flow</span>
        <strong>Signal → decision → execution → learning</strong>
      </div>

      <div className={styles.rows}>
        {signalRows.map(([num, label, value, state], index) => (
          <div className={styles.row} key={label}>
            <span className={styles.num}>{num}</span>
            <div>
              <span className={styles.label}>{label}</span>
              <strong>{value}</strong>
            </div>
            <span className={[styles.state, index >= 1 && index <= 4 ? styles.hot : ""].join(" ")}>
              {state}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span>AVELA</span>
        <strong>Prepared decisions. Human control.</strong>
      </div>
      <div className={styles.decisionPulse} aria-hidden="true">
        <span>read</span><i>→</i><span>decide</span><i>→</i><strong>move</strong><i>→</i><span>learn</span>
      </div>
    </div>
  );
}
