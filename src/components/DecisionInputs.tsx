import styles from "./DecisionInputs.module.css";

const shown = 3;

function Column({ label, tone, items, empty }: { label: string; tone: "known" | "assumed" | "missing"; items: string[]; empty: string }) {
  return (
    <article className={styles.column} data-tone={tone}>
      <h3>{label} <span>{items.length}</span></h3>
      {items.length ? (
        <ul>
          {items.slice(0, shown).map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : <p>{empty}</p>}
      {items.length > shown ? <small>+{items.length - shown} more in Evidence &amp; impact</small> : null}
    </article>
  );
}

/**
 * What the recommendation stands on, next to the decision: what is known from sources, what the
 * engine assumed, and what is still missing. Same lists as the Evidence & impact phase, so the
 * distinction is visible before anyone approves, not only after opening the evidence.
 */
export function DecisionInputs({ known, assumptions, missing }: { known: string[]; assumptions: string[]; missing: string[] }) {
  return (
    <section className={styles.inputs} aria-label="What this decision stands on">
      <div className={styles.head}>
        <span>Before you decide</span>
        <a href="#signals">All evidence →</a>
      </div>
      <div className={styles.grid}>
        <Column label="Known" tone="known" items={known} empty="Nothing sourced for this fixture yet." />
        <Column label="Assumed" tone="assumed" items={assumptions} empty="No assumption recorded." />
        <Column label="Missing" tone="missing" items={missing} empty="No missing input recorded." />
      </div>
    </section>
  );
}
