import styles from "./CommercialSignalStage.module.css";

const signals = [
  ["Weather", "Rain risk"],
  ["Transport", "Rail works"],
  ["City", "Major event"],
  ["Football", "TV overlap"],
  ["Calendar", "School holiday"],
  ["Demand", "CRM + sales"]
] as const;

export function CommercialSignalStage() {
  return (
    <div className={styles.stage} aria-label="AVELA opportunity engine">
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.topline}>
        <span>AVELA Opportunity Engine</span>
        <strong>External signals + club context</strong>
      </div>

      <div className={styles.engineScene}>
        <div className={styles.signalOrbit} aria-label="Signals feeding the opportunity engine">
          {signals.map(([label, value], index) => (
            <div className={[styles.signalNode, styles["node" + (index + 1)]].join(" ")} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}

          <div className={styles.engineCore}>
            <span>AVELA</span>
            <strong>Opportunity<br />Engine</strong>
            <small>detect · interpret · prepare</small>
            <i aria-hidden="true" />
          </div>
        </div>

        <div className={styles.output}>
          <div>
            <span>What changed</span>
            <strong>Travel friction + competing attention</strong>
          </div>
          <div>
            <span>Why it matters</span>
            <strong>Walk-up assumption is weaker</strong>
          </div>
          <div className={styles.outputHot}>
            <span>Prepared move</span>
            <strong>Earlier CRM + travel message</strong>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>Not more data.</span>
        <strong>Only the signals that change the plan.</strong>
      </div>
    </div>
  );
}
