import styles from "./CommercialEcosystem.module.css";

// External signals sit on top: they are what the club's own tools cannot see. The club's
// systems are sources AVELA can read and places where the prepared move is executed. Each row
// says honestly when it applies: read today, joined in a pilot, or planned (no connector yet).
const inputs = [
  ["Outside the club", "External signals", "Live today"],
  ["Fans", "CRM / ticketing", "In a pilot"],
  ["Performance", "Blinkfire / analytics", "Planned"],
  ["Rights", "Contracts / partner obligations", "In a pilot"],
  ["People", "Google / Microsoft calendars", "Planned"],
  ["Execution", "Asana / Monday / Jira / Drive", "Planned"]
] as const;

export function CommercialEcosystem() {
  return (
    <section className={styles.wrap} id="integrations" aria-labelledby="ecosystem-title">
      <h2 id="ecosystem-title">AVELA works across your tools.</h2>
      <div className={styles.copy}>
        <p className={styles.lead}>Works with your club stack.</p>
        <p>CRM, Blinkfire, Asana, Monday and Drive are not competitors. They remain systems of record: sources AVELA can read, and the places where the prepared move is executed. External signals sit above them — what is changing around the match that none of them can see.</p>
      </div>
      <div className={styles.map} aria-label="External signals and existing club systems feed the AVELA Opportunity Engine">
        <table className={styles.inputs}>
          <caption>What AVELA can read, and when</caption>
          <tbody>
            {inputs.map(([label, detail, status]) => (
              <tr key={label}><th scope="row">{label}</th><td>{detail} <small className={styles.status} data-status={status}>{status}</small></td></tr>
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
        <p>The prepared move is handed to the tools the team already uses to run it — nothing is migrated, and nothing is replaced. Direct connectors are set up with the club; until then a source is shown as not connected.</p>
      </div>
    </section>
  );
}
