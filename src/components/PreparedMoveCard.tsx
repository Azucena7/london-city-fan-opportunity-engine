import type { PreparedMove } from "@/lib/preparedMoves";
import { PreparedMoveAdoption } from "./PreparedMoveAdoption";
import styles from "./PreparedMoveCard.module.css";

function day(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

/** An engine draft for a fixture with no curated campaign plan: a starting point, never approved. */
export function PreparedMoveCard({ draft }: { draft: PreparedMove }) {
  return (
    <section className={styles.card} aria-label="Prepared move · engine draft">
      <div className={styles.head}>
        <span>Prepared move · engine draft</span>
        <b>Not approved</b>
      </div>
      <h2>{draft.move}</h2>
      {draft.moveRecordedAt ? <p className={styles.recorded}>Action recorded with the reviewed signal on {day(draft.moveRecordedAt)}.</p> : null}
      <dl className={styles.facts}>
        <div><dt>Suggested owner</dt><dd>{draft.ownerRole}</dd></div>
        <div><dt>Prepare by</dt><dd>{day(draft.prepareBy)}{draft.late ? " · already inside the week before" : " · T−7"}</dd></div>
        <div><dt>Measurement</dt><dd>{draft.measurement}</dd></div>
      </dl>
      <div className={styles.columns}>
        <div>
          <h3>Because</h3>
          <ul>{draft.because.map((reason) => <li key={reason.label}>{reason.label} <small>· {reason.source}</small></li>)}</ul>
        </div>
        <div>
          <h3>Open before anything moves</h3>
          <ul>{draft.gates.map((gate) => <li key={gate}>{gate}</li>)}</ul>
        </div>
      </div>
      <PreparedMoveAdoption fixtureId={draft.fixtureId} move={draft.move} ownerRole={draft.ownerRole} gates={draft.gates} />
      <p className={styles.boundary}>Drafted by the engine from the signals above. No audience size, budget or forecast is implied; the club team decides whether it becomes a campaign.</p>
    </section>
  );
}
