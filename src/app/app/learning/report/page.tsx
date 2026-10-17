import type { Metadata } from "next";
import Link from "next/link";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { PrintButton } from "@/components/PrintButton";
import { calendar, currentState } from "@/lib/data";
import { currentProductDate } from "@/lib/currentProductDate";
import { deriveNextFixtureLearning } from "@/lib/learningRecommendation";
import { END_OPTIONS, PILOT_WINDOW, cycleStates, windowProgress } from "@/lib/pilotWindow";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import styles from "./report.module.css";

export const metadata: Metadata = {
  title: "Pilot cycle report",
  description: "Each cycle of the pilot window: the opportunity, what AVELA recommended, what happened, what it learned and what changes next, ending with the club's decision."
};

function day(value: string) {
  return new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * The end-of-cycle report a club takes to its leadership: one section per cycle in the pilot
 * window, built only from what the app already records. Nothing is scored; unplayed cycles and
 * missing club data are named as such, and the closing decision is left for the club to make.
 */
export default function PilotCycleReportPage() {
  const today = currentProductDate(currentState.updated_at);
  const states = cycleStates(calendar, today);
  const progress = windowProgress(states);
  const last = PILOT_WINDOW[PILOT_WINDOW.length - 1];

  const cycles = PILOT_WINDOW.map((item) => {
    const state = states[item.fixtureId];
    const fixture = calendar.find((entry) => entry.id === item.fixtureId);
    const played = state === "Observed" || state === "Played · evidence pending";
    const opportunity = getCurrentProductOpportunity(item.fixtureId);
    const results = getCurrentProductResults(item.fixtureId);
    return {
      item,
      state,
      fixture,
      played,
      opportunity,
      results,
      learning: played ? deriveNextFixtureLearning(opportunity, results) : null
    };
  });

  return (
    <AppWorkspaceShell
      active="learning"
      eyebrow="Pilot cycle report"
      title="What the window tested, what happened and what changes next"
      subtitle={`${progress.played} of ${progress.total} cycles played · prepared ${day(today)}`}
      actions={<PrintButton className={styles.print} />}
    >
      <section className={styles.notice} aria-label="About this report">
        <strong>Public demonstration</strong>
        <p>Built on London City Lionesses public information. London City is not an AVELA customer. A club pilot replaces public evidence with authorised club data and measures agreed before the window starts.</p>
      </section>

      <ol className={styles.cycles}>
        {cycles.map(({ item, state, fixture, played, opportunity, results, learning }, index) => (
          <li key={item.fixtureId} className={styles.cycle} data-state={played ? "played" : "ahead"}>
            <header>
              <span>Cycle {index + 1} · {state}</span>
              <h2>{item.fixture}</h2>
              <small>{item.focus}{fixture ? " · " + day(fixture.date) : ""}</small>
            </header>
            <dl className={styles.rows}>
              <div><dt>Decision tested</dt><dd>{item.decision}</dd></div>
              <div><dt>Opportunity</dt><dd>{opportunity?.opportunity ?? "Not assessed"}</dd></div>
              <div><dt>AVELA recommended</dt><dd>{opportunity?.recommendedAction ?? "Not assessed"}</dd></div>
              <div><dt>Club decision</dt><dd className={styles.muted}>Recorded in the club workspace; none in this public demonstration.</dd></div>
              <div>
                <dt>What happened</dt>
                <dd>
                  {!played
                    ? "Not played yet."
                    : fixture?.attendance
                      ? `Reported attendance ${fixture.attendance.toLocaleString("en-GB")} (public figure, not ticket sales).`
                      : "Played; no public attendance on record yet."}
                  {played ? (results?.state === "measured" ? " Outcome measured with club data." : " Outcome not measured: needs the club's ticketing data.") : null}
                </dd>
              </div>
              {learning ? (
                <>
                  <div><dt>What AVELA learned</dt><dd>{learning.learned}</dd></div>
                  <div><dt>Repeat</dt><dd>{learning.repeat}</dd></div>
                  <div><dt>Change next</dt><dd>{learning.change}</dd></div>
                  <div><dt>Measure next</dt><dd>{learning.measure}</dd></div>
                  <div><dt>Learning confidence</dt><dd>{learning.confidence} · {learning.evidenceState === "measured" ? "measured evidence" : learning.evidenceState === "descriptive" ? "descriptive evidence" : "outcome evidence missing"}</dd></div>
                </>
              ) : (
                <div><dt>Learning</dt><dd className={styles.muted}>Written after the match, from what actually happened.</dd></div>
              )}
              <div><dt>Evidence for this cycle</dt><dd>{item.evidence}</dd></div>
            </dl>
            <p className={styles.links}>
              <Link href={`/app/matches/${item.fixtureId}`}>Opportunity brief</Link>
              <Link href={`/app/learning?fixture=${item.fixtureId}`}>Learning detail</Link>
            </p>
          </li>
        ))}
      </ol>

      <section className={styles.end} aria-labelledby="end-title" data-due={progress.endDecisionDue ? "true" : "false"}>
        <h2 id="end-title">The club&apos;s decision for the next window</h2>
        <p>
          {progress.endDecisionDue
            ? "Every cycle has been played. The club decides; AVELA does not pre-select an option."
            : `Not due yet: ${progress.remaining} cycle${progress.remaining === 1 ? "" : "s"} still to play (last: ${last.fixture}).`}
        </p>
        <ul>
          {END_OPTIONS.map(([label, detail]) => (
            <li key={label}><span className={styles.box} aria-hidden="true" /><b>{label}</b><small>{detail}</small></li>
          ))}
        </ul>
        <p className={styles.sign}>Decided by ____________________ · Date ____________</p>
      </section>
    </AppWorkspaceShell>
  );
}
