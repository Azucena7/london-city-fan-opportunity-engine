"use client";

import { fetchClubSession } from "@/lib/clubSessionClient";
import { useEffect, useState } from "react";
import styles from "./MatchPlanDecision.module.css";

type Club = { id: string; name: string; role: string };
type Verdict = "approve" | "modify" | "hold" | "reject";
type RecordedDecision = { event_type: string; state?: string | null; label: string; detail?: string | null; created_at: string };

// The club's verdict on the recommendation is stored as a decision event through the existing
// decision-history contract. It records a human decision only: nothing is launched or sent.
const verdicts: Record<Verdict, { label: string; eventType: "approved" | "changed" | "reviewed" | "rejected"; state: string; recorded: string; noteRequired: boolean }> = {
  approve: { label: "Approve", eventType: "approved", state: "human-approved", recorded: "Approved by the club", noteRequired: false },
  modify: { label: "Modify", eventType: "changed", state: "human-modified", recorded: "Approved with changes", noteRequired: true },
  hold: { label: "Hold", eventType: "reviewed", state: "human-hold", recorded: "On hold", noteRequired: true },
  reject: { label: "Reject", eventType: "rejected", state: "human-rejected", recorded: "Rejected by the club", noteRequired: true }
};

export const HUMAN_DECISION_STATES: ReadonlySet<string> = new Set(Object.values(verdicts).map((item) => item.state));

export const DECISION_RECORDED_EVENT = "avela:decision-recorded";

export function MatchPlanDecision({
  decisionId,
  subjectId,
  recommendation,
  decisionState,
  blockerCount,
  nextApproval,
  signalCount
}: {
  decisionId: string;
  subjectId: string;
  recommendation: string;
  decisionState: "READY FOR REVIEW" | "HOLD";
  blockerCount: number;
  nextApproval: string;
  signalCount: number;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [latest, setLatest] = useState<RecordedDecision | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Verdict | null>(null);
  const [message, setMessage] = useState("");
  const blocked = decisionState === "HOLD" || blockerCount > 0;

  async function loadLatest(clubId: string) {
    const response = await fetch(`/api/decision-history?clubId=${encodeURIComponent(clubId)}&decisionId=${encodeURIComponent(decisionId)}`, { cache: "no-store" });
    const result = await response.json().catch(() => null) as { events?: RecordedDecision[] } | null;
    const events = response.ok && Array.isArray(result?.events) ? result.events : [];
    setLatest(events.filter((event) => event.state && HUMAN_DECISION_STATES.has(event.state)).at(-1) ?? null);
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetchClubSession();
        const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
        const nextClubs = result.authenticated && Array.isArray(result.clubs) ? result.clubs : [];
        setClubs(nextClubs);
        if (nextClubs.length) {
          setActiveClubId(nextClubs[0].id);
          await loadLatest(nextClubs[0].id);
        }
      } finally {
        setSessionChecked(true);
      }
    })();
  }, [decisionId]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when decision changes

  async function record(verdict: Verdict) {
    const config = verdicts[verdict];
    if (!activeClubId || busy) return;
    if (config.noteRequired && !note.trim()) {
      setMessage(`Add a short reason before choosing ${config.label.toLowerCase()}.`);
      return;
    }
    setBusy(verdict);
    setMessage("");
    const now = new Date().toISOString();
    try {
      const response = await fetch("/api/decision-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          decisionId,
          subjectType: "fixture",
          subjectId,
          eventType: config.eventType,
          sourceType: "user",
          eventKey: `${decisionId}:human-decision:${now}`,
          state: config.state,
          label: config.recorded,
          detail: note.trim() || recommendation,
          metadata: { recommendation, verdict, openGates: blockerCount, signalCount }
        })
      });
      if (response.ok) {
        setNote("");
        setMessage("Club decision recorded. Nothing has been launched or sent.");
        await loadLatest(activeClubId);
        window.dispatchEvent(new CustomEvent(DECISION_RECORDED_EVENT, { detail: { decisionId } }));
      } else {
        setMessage("The decision could not be recorded. No club history was changed.");
      }
    } catch {
      setMessage("The club workspace is unreachable. No club history was changed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <aside className={styles.bar} aria-label="Human decision on the recommendation">
      <div className={styles.status}>
        <span>{latest ? "Club decision recorded" : blocked ? "Review required" : "Ready for review"}</span>
        <strong>
          {latest
            ? `${latest.label} · ${new Date(latest.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
            : blocked
              ? `${blockerCount} gate${blockerCount === 1 ? "" : "s"} must be resolved before approval.`
              : `${signalCount} signals support the current draft.`}
        </strong>
        {latest?.detail ? <small>{latest.detail}</small> : null}
      </div>

      <div className={styles.next}>
        <span>Next decision</span>
        <strong>{blocked ? nextApproval : "Approve, modify, hold or reject the recommended play."}</strong>
        {blocked ? <a href="#approval-gates">Review blockers</a> : null}
      </div>

      {!sessionChecked ? null : clubs.length ? (
        <div className={styles.decide}>
          {clubs.length > 1 ? (
            <label>Club
              <select value={activeClubId} onChange={(event) => { setActiveClubId(event.target.value); void loadLatest(event.target.value); }}>
                {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
              </select>
            </label>
          ) : null}
          <label>
            Reason or change (required to modify, hold or reject)
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="e.g. Approve with two players instead of three." />
          </label>
          <div className={styles.actions}>
            {(Object.keys(verdicts) as Verdict[]).map((verdict) => {
              const approveBlocked = verdict === "approve" && blocked;
              return (
                <button
                  key={verdict}
                  type="button"
                  className={verdict === "approve" ? styles.primary : styles.secondary}
                  disabled={Boolean(busy) || approveBlocked}
                  aria-busy={busy === verdict}
                  title={approveBlocked ? "Resolve the open gates before approving." : undefined}
                  onClick={() => void record(verdict)}
                >
                  {busy === verdict ? "Saving…" : verdicts[verdict].label}
                </button>
              );
            })}
          </div>
          {message ? <p className={styles.message} role="status" aria-live="polite">{message}</p> : null}
        </div>
      ) : (
        <div className={styles.decide}>
          <p className={styles.message}>Sign in with club access to record the club&apos;s decision. <a href="/app/access">Sign in</a></p>
        </div>
      )}

      <p>
        Recording a decision stores it in the club&apos;s decision history only. It does not send campaigns, commit spend or execute club actions.
      </p>
    </aside>
  );
}
