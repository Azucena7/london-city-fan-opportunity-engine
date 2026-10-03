import styles from "./CommercialSignalStage.module.css";

const signalRows = [
  ["01", "Fixture", "Everton · Home · 18 Oct"],
  ["02", "Signals", "Demand · family · culture"],
  ["03", "Opportunity", "Return-attendance moment"],
  ["04", "Recommended play", "Build the return path"],
  ["05", "Learning", "Measure what moved"]
] as const;

export function CommercialSignalStage() {
  return (
    <div className={styles.stage} aria-label="AVELA product flow">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.signalRail} aria-hidden="true">
        <span className={styles.pulseA} />
        <span className={styles.pulseB} />
        <span className={styles.pulseC} />
      </div>

      <div className={styles.topline}>
        <span>Live product flow</span>
        <strong>Fixture → decision → action</strong>
      </div>

      <div className={styles.rows}>
        {signalRows.map(([num, label, value], index) => (
          <div className={styles.row} key={label}>
            <span className={styles.num}>{num}</span>
            <div>
              <span className={styles.label}>{label}</span>
              <strong>{value}</strong>
            </div>
            <span className={[styles.state, index === 2 || index === 3 ? styles.hot : ""].join(" ")}>
              {index < 2 ? "Reading" : index === 2 ? "Detected" : index === 3 ? "Ready" : "Feeds back"}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span>AVELA</span>
        <strong>One growth decision at a time.</strong>
      </div>
    </div>
  );
}
