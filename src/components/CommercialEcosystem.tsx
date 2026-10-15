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
      <h2 id="ecosystem-title">AVELA reads across your tools.</h2>
      <div className={styles.copy}>
        <p className={styles.lead}>Works with your club stack.</p>
        <p>CRM, Blinkfire, Asana, Monday and Drive are not competitors. They remain systems of record: sources AVELA reads, and the places where the prepared move is executed. External signals sit above them — what is changing around the match that none of them can see.</p>
      </div>
      <div className={styles.map} aria-label="External signals and existing club systems feed the AVELA Opportunity Engine">
        <table className={styles.inputs}>
          <caption>What AVELA reads</caption>
          <tbody>
            {inputs.map(([label, detail]) => (
              <tr key={label}><th scope="row">{label}</th><td>{detail}</td></tr>
            ))}
          </tbody>
        </table>
        <p className={styles.engine}><strong>AVELA Opportunity Engine</strong> Signal + demand + rights + availability</p>
        <ol className={styles.outputs} aria-label="What it returns">
          <li>What changed</li>
          <li>Why it matters</li>
          <li>Prepared move</li>
        </ol>
      </div>
      <div className={styles.note}>
        <p><strong>Each platform sees its own domain. AVELA connects what changed outside the club with what each of them knows.</strong></p>
        <p>The prepared move goes back to the tools the team already uses to run it — nothing is migrated, and nothing is replaced.</p>
      </div>
    </section>
  );
}
