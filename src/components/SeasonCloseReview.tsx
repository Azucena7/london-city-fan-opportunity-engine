import styles from "./SeasonCloseReview.module.css";

export function SeasonCloseReview({
  scheduledFixtures,
  campaignDrafts,
  unresolvedApprovals,
  measuredOutcomes,
  attendanceEvidence
}: {
  scheduledFixtures: number;
  campaignDrafts: number;
  unresolvedApprovals: number;
  measuredOutcomes: number;
  attendanceEvidence: number;
}) {
  const blockers: string[] = [];
  if (scheduledFixtures > 0) blockers.push(`${scheduledFixtures} scheduled home fixture${scheduledFixtures === 1 ? "" : "s"} remain`);
  if (unresolvedApprovals > 0) blockers.push(`${unresolvedApprovals} unresolved campaign approval${unresolvedApprovals === 1 ? "" : "s"} remain`);

  const ready = blockers.length === 0;

  return (
    <section className={styles.wrap} aria-label="Season close review">
      <div className={styles.head}>
        <div>
          <span>Season lifecycle</span>
          <h2>What happens when this season closes?</h2>
          <p>AVELA should freeze a historical snapshot, preserve decision memory and review only the items that genuinely continue into the next season.</p>
        </div>
        <aside data-state={ready ? "ready" : "not-ready"}>
          <span>Close readiness</span>
          <strong>{ready ? "Ready for governance review" : "Not ready to close"}</strong>
          <small>{ready ? "No fixture/campaign blocker detected in the current product data." : blockers.join(" · ")}</small>
        </aside>
      </div>

      <div className={styles.columns}>
        <article>
          <div className={styles.columnHead}>
            <span>Archive</span>
            <strong>Freeze as history</strong>
          </div>
          <ul>
            <li><b>Fixtures and decisions</b><small>Season records remain queryable; they are not reset or deleted.</small></li>
            <li><b>{measuredOutcomes} measured outcome{measuredOutcomes === 1 ? "" : "s"}</b><small>Observed results remain attached to the historical season snapshot.</small></li>
            <li><b>{attendanceEvidence} fixture{attendanceEvidence === 1 ? "" : "s"} with attendance evidence</b><small>Missing attendance remains missing — never converted to zero.</small></li>
          </ul>
        </article>

        <article>
          <div className={styles.columnHead}>
            <span>Carry forward</span>
            <strong>Only persistent truth</strong>
          </div>
          <ul>
            <li><b>Verified multi-year contracts</b><small>Not available yet. Carry-forward must wait for reviewed Contract Intelligence.</small></li>
            <li><b>Persistent obligations / restrictions</b><small>Roll forward only when their source remains valid for the next season.</small></li>
            <li><b>Institutional learning</b><small>Decision memory survives season boundaries and stays traceable to its source decisions.</small></li>
          </ul>
        </article>

        <article>
          <div className={styles.columnHead}>
            <span>Needs review</span>
            <strong>Do not import blindly</strong>
          </div>
          <ul>
            <li><b>{campaignDrafts} current campaign draft{campaignDrafts === 1 ? "" : "s"}</b><small>Open work should be closed, explicitly carried forward or rejected.</small></li>
            <li><b>{unresolvedApprovals} unresolved approval{unresolvedApprovals === 1 ? "" : "s"}</b><small>Unresolved gates cannot silently become next-season commitments.</small></li>
            <li><b>Availability / internal windows</b><small>Off-days, Christmas breaks and personal calendars should carry only when their dates overlap the next season.</small></li>
          </ul>
        </article>
      </div>

      <div className={styles.rule}>
        <div>
          <span>Close rule</span>
          <strong>Active season → immutable snapshot → reviewed rollover → new active season.</strong>
        </div>
        <p>The close action is intentionally not enabled in this prepared UX until lifecycle persistence is applied and governance approval is available.</p>
      </div>
    </section>
  );
}
