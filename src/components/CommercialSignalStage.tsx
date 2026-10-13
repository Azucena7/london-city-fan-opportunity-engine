import styles from "./CommercialSignalStage.module.css";

const signals = [
  ["Weather", "Rain risk"],
  ["Transport", "Rail works"],
  ["City", "Major event"],
  ["Football", "TV overlap"],
  ["Calendar", "School holiday"],
  ["Demand", "CRM + sales"]
] as const;

const outputs = [
  ["What changed", "Travel friction + competing attention"],
  ["Why it matters", "Walk-up assumption is weaker"],
  ["Prepared move", "Earlier CRM + clearer travel message"]
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
        <div className={styles.signalStack}>
          <span className={styles.columnLabel}>Signals entering the engine</span>
          {signals.map(([label, value]) => (
            <div className={styles.signalNode} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.engineColumn}>
          <div className={styles.engineCore}>
            <span>AVELA</span>
            <strong>Opportunity Engine</strong>
            <small>detect · interpret · validate · prepare</small>
          </div>
          <div className={styles.engineFlow} aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className={styles.engineNote}>
            <span>Decision logic</span>
            <strong>External signal + club context → actionability</strong>
          </div>
        </div>

        <div className={styles.output}>
          <span className={styles.columnLabel}>Decision output</span>
          {outputs.map(([label, value], index) => (
            <div className={index === outputs.length - 1 ? styles.outputHot : ""} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <span>Not more data.</span>
        <strong>Only the signals that change the plan.</strong>
      </div>
    </div>
  );
}
