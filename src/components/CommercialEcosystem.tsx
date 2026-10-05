import styles from "./CommercialEcosystem.module.css";

const inputs = [
  ["Performance", "Blinkfire / analytics"],
  ["Fans", "CRM / ticketing"],
  ["Work", "Asana / Monday / Jira"],
  ["Time", "Google / Microsoft calendars"],
  ["Rights", "Contracts / documents"],
  ["Context", "Fixtures + internal knowledge"]
] as const;

export function CommercialEcosystem() {
  return (
    <section className={styles.wrap} id="integrations" aria-labelledby="ecosystem-title">
      <div className={styles.copy}>
        <span>Works with your club stack</span>
        <h2 id="ecosystem-title">Keep your specialist tools. Add the decision layer.</h2>
        <p>Your existing tools remain systems of record. AVELA connects the context between them so the club can decide what deserves attention and what can realistically be delivered.</p>
      </div>
      <div className={styles.map} aria-label="Existing club systems feed AVELA decision intelligence">
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
          <strong>Decision Intelligence</strong>
          <p>Evidence + context + constraints</p>
        </div>
        <div className={styles.outputs}>
          <article><span>01</span><strong>Priority</strong></article>
          <article><span>02</span><strong>Decision</strong></article>
          <article><span>03</span><strong>Action</strong></article>
        </div>
      </div>
      <div className={styles.note}>
        <strong>Specialist platforms optimise individual domains. AVELA optimises the decision across domains.</strong>
        <p>Performance data, sponsor rights, player availability, executive calendars, creative capacity and fixture context can all affect the same decision.</p>
      </div>
    </section>
  );
}
