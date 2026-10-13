import styles from "./CommercialEcosystem.module.css";

const inputs = [
  ["Data & intelligence", "CRM · ticketing · analytics · Blinkfire"],
  ["Documents & rights", "Drive · SharePoint · contracts"],
  ["Planning & context", "Fixtures · calendars · player availability"],
  ["Execution", "Asana · Monday · ClickUp · Trello · other tools"]
] as const;

export function CommercialEcosystem() {
  return (
    <section className={styles.wrap} id="integrations" aria-labelledby="ecosystem-title">
      <div className={styles.copy}>
        <span>Works with your club stack</span>
        <h2 id="ecosystem-title">Keep your specialist tools. Let AVELA connect the decision across them.</h2>
        <p>
          Your existing systems remain systems of record. AVELA sits above them as the operating layer that
          joins evidence, rights, timing, ownership and capacity — then prepares the action and tracks whether it is ready.
        </p>
      </div>
      <div className={styles.map} aria-label="Existing club systems feed AVELA decision orchestration">
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
          <strong>Decision Orchestration</strong>
          <p>Evidence + context + constraints + ownership + readiness</p>
        </div>
        <div className={styles.outputs}>
          <article><span>01</span><strong>Priority</strong></article>
          <article><span>02</span><strong>Decision</strong></article>
          <article><span>03</span><strong>Activation</strong></article>
          <article><span>04</span><strong>Learning</strong></article>
        </div>
      </div>
      <div className={styles.note}>
        <strong>AVELA does not replace specialist platforms — it reduces the manual work between them.</strong>
        <p>Performance, sponsor rights, player availability, contracts, calendars and execution capacity can all change the same decision. AVELA keeps that context together.</p>
      </div>
    </section>
  );
}
