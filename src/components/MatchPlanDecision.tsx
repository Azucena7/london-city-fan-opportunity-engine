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
  const [approved, setApproved] = useState(false);
  const blocked = decisionState === "HOLD" || blockerCount > 0;

  return (
    <aside className={styles.bar} aria-label="Match plan review status">
      <div className={styles.status}>
        <span>{blocked ? "Review required" : approved ? "Approved for handoff" : "Ready for review"}</span>
        <strong>
          {blocked
            ? `${blockerCount} gate${blockerCount === 1 ? "" : "s"} must be resolved before handoff.`
            : approved
              ? "Draft reviewed. Ready for the club's execution workflow."
              : `${signalCount} signals support the current draft.`}
        </strong>
      </div>

      <div className={styles.next}>
        <span>Next decision</span>
        <strong>{blocked ? nextApproval : approved ? "Hand off to the execution owner." : "Review the draft and approve the handoff."}</strong>
      </div>

      {blocked ? (
        <a className={styles.primary} href="#approval-gates">Review blockers</a>
      ) : (
        <button
          className={approved ? styles.approved : styles.primary}
          type="button"
          onClick={() => setApproved((value) => !value)}
        >
          {approved ? "Approved for handoff ✓" : "Approve draft for handoff"}
        </button>
      )}

      <p>
        Review state only. This demo environment does not send campaigns, commit spend or execute club actions automatically.
      </p>
    </aside>
  );
}
