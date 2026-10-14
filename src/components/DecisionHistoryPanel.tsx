"use client";

import { fetchClubSession } from "@/lib/clubSessionClient";
import { useEffect, useMemo, useState } from "react";
import styles from "./DecisionHistoryPanel.module.css";
import { DECISION_RECORDED_EVENT, HUMAN_DECISION_STATES } from "./MatchPlanDecision";

type Club = { id: string; name: string; role: string };
type DecisionEvent = {
  id: string;
  event_type: "detected" | "recommended" | "changed" | "reviewed" | "approved" | "rejected" | "committed" | "executed" | "measured" | "learned" | "context-added" | "blocked" | "unblocked";
  state?: string | null;
  label: string;
  detail?: string | null;
  source_type: "engine" | "user" | "connector" | "contract" | "historical";
  created_at: string;
};

const labels: Record<DecisionEvent["event_type"], string> = {
  detected: "Detected",
  recommended: "Recommended",
  changed: "Changed",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
  committed: "Committed",
  executed: "Executed",
  measured: "Measured",
  learned: "Learned",
  "context-added": "Context added",
  blocked: "Blocked",
  unblocked: "Unblocked"
};

export function DecisionHistoryPanel({
  decisionId,
  subjectType,
  subjectId,
  recommendation
}: {
  decisionId: string;
  subjectType: "fixture" | "campaign" | "sponsor" | "player" | "contract" | "operations" | "learning";
  subjectId: string;
  recommendation: string;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load(clubId: string) {
    const response = await fetch(`/api/decision-history?clubId=${encodeURIComponent(clubId)}&decisionId=${encodeURIComponent(decisionId)}`, { cache: "no-store" });
    const result = await response.json() as { events?: DecisionEvent[] };
    setEvents(response.ok && Array.isArray(result.events) ? result.events : []);
  }

  useEffect(() => {
    void (async () => {
      const response = await fetchClubSession();
      const result = await response.json() as { configured?: boolean; authenticated?: boolean; clubs?: Club[] };
      setConfigured(Boolean(result.configured));
      const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(nextClubs);
      if (result.authenticated && nextClubs.length) {
        setActiveClubId(nextClubs[0].id);
        await load(nextClubs[0].id);
      }
    })();
  }, [decisionId]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when decision changes

  useEffect(() => {
    if (!activeClubId) return;
    const reload = () => void load(activeClubId);
    window.addEventListener(DECISION_RECORDED_EVENT, reload);
    return () => window.removeEventListener(DECISION_RECORDED_EVENT, reload);
  }, [activeClubId]); // eslint-disable-line react-hooks/exhaustive-deps -- load only depends on the active club

  const state = useMemo(() => {
    const types = new Set(events.map((event) => event.event_type));
    // The club's verdict is recorded once, in the Human decision step (MatchPlanDecision).
    // Legacy "committed" events from the earlier flow still count as a decision.
    const decision = [...events].reverse().find((event) => (event.state && HUMAN_DECISION_STATES.has(event.state)) || event.event_type === "committed") ?? null;
    return {
      decision,
      executed: types.has("executed"),
      measured: types.has("measured"),
      learned: types.has("learned")
    };
  }, [events]);

  async function recordExecution() {
    if (!activeClubId || busy) return;
    setBusy(true);
    setMessage("");
    const now = new Date().toISOString();
    try {
      const response = await fetch("/api/decision-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          decisionId,
          subjectType,
          subjectId,
          eventType: "executed",
          sourceType: "user",
          eventKey: `${decisionId}:executed:${now}`,
          state: "executed-confirmed",
          label: "Execution confirmed",
          detail: detail.trim() || "Club user confirmed what actually went live.",
          metadata: { recommendation }
        })
      });
      if (response.ok) {
        setDetail("");
        setMessage("Execution recorded in the club workspace.");
        await load(activeClubId);
      } else {
        setMessage("This update could not be recorded. No club history was changed.");
      }
    } catch {
      setMessage("The club workspace is unreachable. No club history was changed.");
    } finally {
      setBusy(false);
    }
  }

  if (configured === false) return null;

  if (!clubs.length) {
    return (
      <section className={styles.empty}>
        <span>Decision history</span>
        <strong>Sign in to build the club&apos;s operational memory.</strong>
        <p>Recommendations remain visible without authentication. Confirmed decisions and execution history are restricted to authorised club members.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-label="Decision history and execution confirmation">
      <div className={styles.head}>
        <div>
          <span>Decision memory</span>
          <h2>Recommended → decided → executed → learned.</h2>
          <p>Record what the club committed to and what happened, kept apart from what AVELA recommended.</p>
        </div>
        {clubs.length > 1 ? (
          <label>Club
            <select value={activeClubId} onChange={(event) => { setActiveClubId(event.target.value); void load(event.target.value); }}>
              {clubs.map((club) => <option value={club.id} key={club.id}>{club.name}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      <div className={styles.stages}>
        <div className={styles.stageComplete}><span>1</span><strong>Recommended</strong><small>Current AVELA recommendation</small></div>
        <div className={state.decision ? styles.stageComplete : styles.stageActive}><span>2</span><strong>Decided</strong><small>{state.decision ? state.decision.label : <a href="#human-decision">Decide in step 05</a>}</small></div>
        <div className={state.executed ? styles.stageComplete : state.decision ? styles.stageActive : styles.stagePending}><span>3</span><strong>Executed</strong><small>{state.executed ? "Actual execution recorded" : "Record what went live"}</small></div>
        <div className={state.measured || state.learned ? styles.stageComplete : styles.stagePending}><span>4</span><strong>Learned</strong><small>{state.learned ? "Learning recorded" : state.measured ? "Outcome measured" : "Waiting for outcome"}</small></div>
      </div>

      <div className={styles.capture}>
        <div>
          <span>Current recommendation</span>
          <strong>{recommendation}</strong>
        </div>
        <label>
          What actually went live?
          <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="e.g. We launched CRM + Instagram on 8 Oct with two players instead of three." rows={3} />
        </label>
        <div className={styles.captureActions}>
          <button type="button" disabled={busy} aria-busy={busy} onClick={() => void recordExecution()}>{busy ? "Saving…" : "Record what went live"}</button>
        </div>
        {message ? <p className={styles.message}>{message}</p> : null}
      </div>

      <details className={styles.history} open={events.length > 0}>
        <summary>View full decision history <span>{events.length} event{events.length === 1 ? "" : "s"}</span></summary>
        <div className={styles.timeline}>
          {!events.length ? <p>No confirmed club events yet.</p> : events.map((event) => (
            <article key={event.id}>
              <i aria-hidden="true" />
              <div>
                <span>{labels[event.event_type]} · {event.source_type}</span>
                <strong>{event.label}</strong>
                {event.detail ? <p>{event.detail}</p> : null}
              </div>
              <time>{new Date(event.created_at).toLocaleString("en-GB")}</time>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
