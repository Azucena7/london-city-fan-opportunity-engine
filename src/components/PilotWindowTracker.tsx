import Link from "next/link";
import { calendar, currentState } from "@/lib/data";
import { currentProductDate } from "@/lib/currentProductDate";
import { CYCLE_STATE_KEY, END_OPTIONS, PILOT_WINDOW, cycleStates, windowProgress } from "@/lib/pilotWindow";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import styles from "./PilotWindowTracker.module.css";

/**
 * The pilot window inside the app: each cycle's state, what was recommended, whether outcome
 * evidence exists, and the end-of-window decision, which belongs to the club and is only due
 * once every cycle has been played.
 */
export function PilotWindowTracker() {
  const states = cycleStates(calendar, currentProductDate(currentState.updated_at));
  const progress = windowProgress(states);
  const last = PILOT_WINDOW[PILOT_WINDOW.length - 1];

  return (
    <section className={styles.tracker} aria-label="Pilot window">
      <header className={styles.head}>
        <div>
          <span>Pilot window · public demonstration</span>
          <h2>{progress.played} of {progress.total} cycles played · {progress.observed} with public outcome evidence</h2>
          <p>London City is an independent demonstration, not a customer. A club pilot replaces public evidence with authorised club data and pre-agreed measures.</p>
        </div>
        <div className={styles.headLinks}>
          <Link href="/app/learning/report">Cycle report →</Link>
          <Link href="/pilot">How the pilot works →</Link>
        </div>
      </header>

      <ol className={styles.cycles}>
        {PILOT_WINDOW.map((item, index) => {
          const state = states[item.fixtureId];
          const decision = getCurrentProductOpportunity(item.fixtureId);
          const results = getCurrentProductResults(item.fixtureId);
          const played = state === "Observed" || state === "Played · evidence pending";
          return (
            <li key={item.fixtureId} data-state={CYCLE_STATE_KEY[state]}>
              <div className={styles.cycleTop}>
                <span>{String(index + 1).padStart(2, "0")} · {state}</span>
                <strong>{item.fixture}</strong>
                <small>{item.focus}</small>
              </div>
              <p>{item.decision}</p>
              <dl>
                <div><dt>Decision</dt><dd>{played ? "Played · review in Learning" : decision?.decisionState ?? "Not assessed"}</dd></div>
                <div><dt>Outcome evidence</dt><dd>{results?.state === "measured" ? "Measured with club data" : state === "Observed" ? "Public evidence only" : "Pending"}</dd></div>
              </dl>
              <div className={styles.links}>
                <Link href={`/app/matches/${item.fixtureId}`}>Brief</Link>
                <Link href={`/app/learning?fixture=${item.fixtureId}`}>Learning</Link>
              </div>
            </li>
          );
        })}
      </ol>

      <div className={styles.end} data-due={progress.endDecisionDue ? "true" : "false"}>
        <div>
          <span>End of window · decided by the club</span>
          <strong>{progress.endDecisionDue
            ? "The window is complete: the club decides what happens next."
            : `Not due yet · ${progress.remaining} cycle${progress.remaining === 1 ? "" : "s"} still to play (last: ${last.fixture})`}</strong>
        </div>
        <ul>
          {END_OPTIONS.map(([label, detail]) => <li key={label}><b>{label}</b><small>{detail}</small></li>)}
        </ul>
      </div>
    </section>
  );
}
