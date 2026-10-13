import styles from "./CommercialEcosystem.module.css";

const inputs = [
  ["External signals", "Weather · transport · city events · football context"],
  ["Fan & demand", "CRM · ticketing · analytics · Blinkfire"],
  ["Commercial truth", "Partners · rights · contracts · people"],
  ["Planning & execution", "Fixtures · calendars · work-management tools"]
] as const;

export function CommercialEcosystem() {
  return (
    <section className={styles.wrap} id="integrations" aria-labelledby="ecosystem-title">
      <div className={styles.copy}>
        <span>Signal network + club stack</span>
        <h2 id="ecosystem-title">AVELA connects what is happening outside the club with what the club can actually do.</h2>
        <p>
          External context creates the signal. Club systems add demand, rights, availability and execution reality.
          AVELA uses both to decide whether the signal changes the plan.
        </p>
      </div>
      <div className={styles.map} aria-label="External and club context feed the AVELA Opportunity Engine">
        <div className={styles.inputs}>
          {inputs.map(([label, detail], index) => (
            <article key={label}>
              <i>{String(index + 1).padStart(2, "0")}</i>
              <div><span>{label}</span><strong>{detail}</strong></div>
            </article>
          ))}
        </div>
        <div className={styles.flow} aria-hidden="true"><span/><span/><span/></div>
        <div className={styles.avela}>
          <span>AVELA</span>
          <strong>Opportunity Engine</strong>
          <p>Detect · interpret · validate · prepare</p>
        </div>
        <div className={styles.outputs}>
          <article><span>01</span><strong>Pressure</strong></article>
          <article><span>02</span><strong>Opportunity</strong></article>
          <article><span>03</span><strong>Decision</strong></article>
          <article><span>04</span><strong>Learning</strong></article>
        </div>
      </div>
      <div className={styles.note}>
        <strong>AVELA does not replace CRM, analytics, rights systems or work tools.</strong>
        <p>Those systems help validate and execute the opportunity. The engine's distinctive role is connecting them with external context the team would otherwise have to monitor manually.</p>
      </div>
    </section>
  );
}
