"use client";

import { fetchClubSession } from "@/lib/clubSessionClient";
import { useEffect, useState } from "react";
import styles from "./PreparedMoveCard.module.css";

type Club = { id: string; name: string };
type DraftEvent = { state?: string | null; label: string; detail?: string | null; created_at: string };

// Adopting an engine draft makes it the club's working plan for the fixture; setting it aside
// keeps the reason. Both are decision-history events, not the club's verdict (step 05), and
// neither sends, launches or commits anything.
export const DRAFT_STATES = {
  adopted: { eventType: "recommended", state: "draft-adopted", label: "Engine draft adopted as the working plan" },
  dismissed: { eventType: "context-added", state: "draft-dismissed", label: "Engine draft set aside" }
} as const;

export function PreparedMoveAdoption({ fixtureId, move, ownerRole, gates }: { fixtureId: string; move: string; ownerRole: string; gates: string[] }) {
  const decisionId = `fixture:${fixtureId}`;
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState("");
  const [checked, setChecked] = useState(false);
  const [latest, setLatest] = useState<DraftEvent | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadLatest(id: string) {
    const response = await fetch(`/api/decision-history?clubId=${encodeURIComponent(id)}&decisionId=${encodeURIComponent(decisionId)}`, { cache: "no-store" });
    const result = await response.json().catch(() => null) as { events?: DraftEvent[] } | null;
    const events = response.ok && Array.isArray(result?.events) ? result.events : [];
    setLatest(events.filter((event) => event.state === DRAFT_STATES.adopted.state || event.state === DRAFT_STATES.dismissed.state).at(-1) ?? null);
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetchClubSession();
        const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
        const next = result.authenticated && Array.isArray(result.clubs) ? result.clubs : [];
        setClubs(next);
        if (next.length) {
          setClubId(next[0].id);
          await loadLatest(next[0].id);
        }
      } catch {
        setClubs([]);
      } finally {
        setChecked(true);
      }
    })();
  }, [fixtureId]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when the fixture changes

  async function record(kind: keyof typeof DRAFT_STATES) {
    if (!clubId || busy) return;
    if (kind === "dismissed" && !reason.trim()) {
      setMessage("Add a short reason before setting the draft aside.");
      return;
    }
    const config = DRAFT_STATES[kind];
    setBusy(true);
    setMessage("");
    const now = new Date().toISOString();
    try {
      const response = await fetch("/api/decision-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          decisionId,
          subjectType: "fixture",
          subjectId: fixtureId,
          eventType: config.eventType,
          sourceType: kind === "adopted" ? "engine" : "user",
          eventKey: `${decisionId}:${config.state}:${now}`,
          state: config.state,
          label: config.label,
          detail: kind === "dismissed" ? reason.trim() : move,
          metadata: { move, ownerRole, gates }
        })
      });
      if (response.ok) {
        setReason("");
        setMessage(kind === "adopted"
          ? "Adopted as the working plan. The gates above stay open; nothing has been sent or launched."
          : "Set aside with your reason. The fixture keeps its signals.");
        await loadLatest(clubId);
      } else {
        setMessage("This could not be recorded. No club history was changed.");
      }
    } catch {
      setMessage("The club workspace is unreachable. No club history was changed.");
    } finally {
      setBusy(false);
    }
  }

  const adopted = latest?.state === DRAFT_STATES.adopted.state;

  if (!checked) return null;
  if (!clubs.length) {
    return <p className={styles.adoptSignedOut}>Sign in with club access to adopt this draft as the working plan. <a href="/app/access">Sign in</a></p>;
  }

  return (
    <div className={styles.adopt} aria-label="Adopt or set aside the engine draft">
      {latest ? (
        <p className={styles.adoptStatus} data-state={latest.state ?? undefined}>
          <strong>{latest.label}</strong> · {new Date(latest.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {latest.state === DRAFT_STATES.dismissed.state && latest.detail ? <small> · {latest.detail}</small> : null}
        </p>
      ) : null}
      {clubs.length > 1 ? (
        <label>Club
          <select value={clubId} onChange={(event) => { setClubId(event.target.value); void loadLatest(event.target.value); }}>
            {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
          </select>
        </label>
      ) : null}
      <label>
        Reason (required to set it aside)
        <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Ticketing already has a bundle journey live." />
      </label>
      <div className={styles.adoptActions}>
        <button type="button" className={styles.adoptPrimary} disabled={busy || adopted} onClick={() => void record("adopted")}>
          {busy ? "Saving…" : adopted ? "Adopted as working plan" : "Use as the working plan"}
        </button>
        <button type="button" className={styles.adoptSecondary} disabled={busy} onClick={() => void record("dismissed")}>Set aside</button>
      </div>
      {message ? <p className={styles.adoptMessage} role="status" aria-live="polite">{message}</p> : null}
    </div>
  );
}
