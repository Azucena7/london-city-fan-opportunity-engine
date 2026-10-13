import styles from "./CommercialSignalStage.module.css";

const signalRows = [
  ["01", "Fixture", "Everton · Home · 18 Oct", "Reading"],
  ["02", "External context", "Rain · rail works · televised fixture", "Changed"],
  ["03", "Opportunity", "Family return-attendance moment", "Detected"],
  ["04", "Recommendation", "Earlier CRM + travel message", "Prepared"],
  ["05", "Execution", "Owner + work order + readiness", "Ready"],
  ["06", "Learning", "Attendance response feeds next match", "Feeds back"]
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
        <span>External + club context</span>
        <strong>Signal → impact → decision → execution</strong>
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
        <strong>Only the signals that change the plan.</strong>
      </div>
      <div className={styles.decisionPulse} aria-hidden="true">
        <span>detect</span><i>→</i><span>judge</span><i>→</i><strong>move</strong><i>→</i><span>learn</span>
      </div>
    </div>
  );
}
