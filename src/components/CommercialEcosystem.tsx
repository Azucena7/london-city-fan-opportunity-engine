import styles from "./CommercialEcosystem.module.css";

// External signals sit on top: they are what the club's own tools cannot see. The club's
// systems are sources AVELA reads and places where the prepared move is executed.
const inputs = [
  ["Outside the club", "External signals"],
  ["Fans", "CRM / ticketing"],
  ["Performance", "Blinkfire / analytics"],
  ["Rights", "Contracts / partner obligations"],
  ["People", "Google / Microsoft calendars"],
  ["Execution", "Asana / Monday / Jira / Drive"]
] as const;

export function CommercialEcosystem() {
  return (
    <section className={styles.wrap} id="integrations" aria-labelledby="ecosystem-title">
      <div className={styles.copy}>
        <span>Works with your club stack</span>
        <h2 id="ecosystem-title">Keep your specialist tools. AVELA reads across them.</h2>
        <p>CRM, Blinkfire, Asana, Monday and Drive are not competitors. They remain systems of record: sources AVELA reads, and the places where the prepared move is executed. External signals sit above them — what is changing around the match that none of them can see.</p>
      </div>
      <div className={styles.map} aria-label="External signals and existing club systems feed the AVELA Opportunity Engine">
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
          <p>Signal + demand + rights + availability</p>
        </div>
        <div className={styles.outputs}>
          <article><span>01</span><strong>What changed</strong></article>
          <article><span>02</span><strong>Why it matters</strong></article>
          <article><span>03</span><strong>Prepared move</strong></article>
        </div>
      </div>
      <div className={styles.note}>
        <strong>Each platform sees its own domain. AVELA connects what changed outside the club with what each of them knows.</strong>
        <p>The prepared move goes back to the tools the team already uses to run it — nothing is migrated, and nothing is replaced.</p>
      </div>
    </section>
  );
}
