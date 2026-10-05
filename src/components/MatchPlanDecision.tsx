"use client";

import { useState } from "react";
import styles from "./MatchPlanDecision.module.css";

export function MatchPlanDecision({
  decisionState,
  blockerCount,
  nextApproval,
  signalCount
}: {
  decisionState: "READY FOR REVIEW" | "HOLD";
  blockerCount: number;
  nextApproval: string;
  signalCount: number;
}) {
  const [reviewed, setReviewed] = useState(false);
  const blocked = decisionState === "HOLD" || blockerCount > 0;

  return (
    <aside className={styles.bar} aria-label="Match plan review status">
      <div className={styles.status}>
        <span>{blocked ? "Review required" : reviewed ? "Reviewed in this session" : "Ready for review"}</span>
        <strong>
          {blocked
            ? `${blockerCount} gate${blockerCount === 1 ? "" : "s"} must be resolved before handoff.`
            : reviewed
              ? "Draft reviewed locally. No approval has been written to the club system."
              : `${signalCount} signals support the current draft.`}
        </strong>
      </div>

      <div className={styles.next}>
        <span>Next decision</span>
        <strong>{blocked ? nextApproval : reviewed ? "Continue to the execution workflow when the club records its real approval." : "Review the draft before the club records its real approval."}</strong>
      </div>

      {blocked ? (
        <a className={styles.primary} href="#approval-gates">Review blockers</a>
      ) : (
        <button
          className={reviewed ? styles.approved : styles.primary}
          type="button"
          onClick={() => setReviewed((value) => !value)}
        >
          {reviewed ? "Reviewed locally ✓" : "Mark as reviewed locally"}
        </button>
      )}

      <p>
        Local review state only. This browser action is not a persisted club approval and does not send campaigns, commit spend or execute club actions.
      </p>
    </aside>
  );
}
