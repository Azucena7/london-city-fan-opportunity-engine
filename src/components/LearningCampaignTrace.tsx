"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./LearningCampaignTrace.module.css";

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

type Activity = {
  id: string;
  event_type: "review" | "draft-generated" | "reserve" | "release" | "launch-handoff";
  label: string;
  detail?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export function LearningCampaignTrace({ fixtureId, measured }: { fixtureId: string; measured: boolean }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [events, setEvents] = useState<Activity[]>([]);
  const [decisionEvents, setDecisionEvents] = useState<DecisionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);

  async function loadHistory(clubId: string) {
    setLoading(true);
    setLoadMessage("");
    try {
      const [campaignResponse, decisionResponse] = await Promise.all([
        fetch(`/api/campaign-history/${encodeURIComponent(fixtureId)}?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" }),
        fetch(`/api/decision-history?clubId=${encodeURIComponent(clubId)}&decisionId=${encodeURIComponent("fixture:" + fixtureId)}`, { cache: "no-store" })
      ]);
      const campaignResult = await campaignResponse.json() as { events?: Activity[] };
      const decisionResult = await decisionResponse.json() as { events?: DecisionEvent[] };
      setEvents(campaignResponse.ok && Array.isArray(campaignResult.events) ? campaignResult.events : []);
      setDecisionEvents(decisionResponse.ok && Array.isArray(decisionResult.events) ? decisionResult.events : []);
      if (!campaignResponse.ok || !decisionResponse.ok) {
        setLoadMessage("Some shared decision history could not be loaded. Missing evidence is not inferred.");
      }
    } catch {
      setEvents([]);
      setDecisionEvents([]);
      setLoadMessage("Shared decision history is unreachable. Learning will not infer execution or approval.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const result = await response.json() as { configured?: boolean; authenticated?: boolean; clubs?: Club[] };
        setConfigured(Boolean(result.configured));
        const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
        setClubs(nextClubs);

        if (result.authenticated && nextClubs.length) {
          setActiveClubId(nextClubs[0].id);
          await loadHistory(nextClubs[0].id);
        } else {
          setLoading(false);
        }
      } catch {
        setConfigured(true);
        setClubs([]);
        setLoading(false);
        setLoadMessage("Account state could not be loaded. Shared learning history remains unavailable.");
      }
    })();
  }, [fixtureId]); // eslint-disable-line react-hooks/exhaustive-deps -- reload account state when the selected fixture changes

  const trace = useMemo(() => {
    const activityTypes = new Set(events.map((event) => event.event_type));
    const latestReservationEvent = events.find((event) => event.event_type === "reserve" || event.event_type === "release");
    const latest = (types: DecisionEvent["event_type"][]) =>
      [...decisionEvents].reverse().find((event) => types.includes(event.event_type)) ?? null;
    return {
      recommended: latest(["recommended", "changed"]),
      decided: latest(["reviewed", "approved", "rejected", "committed"]),
      executed: latest(["executed"]),
      learned: latest(["learned"]),
      measuredEvent: latest(["measured"]),
      produced: activityTypes.has("draft-generated"),
      reserved: latestReservationEvent?.event_type === "reserve",
      reopened: latestReservationEvent?.event_type === "release",
      handoff: activityTypes.has("launch-handoff")
    };
  }, [events, decisionEvents]);

  if (configured === false) {
    return (
      <section className={styles.empty}>
        <span>Execution trace</span>
        <strong>Club campaign history is not connected in this environment.</strong>
        <p>Learning continues to show measured public and club outcomes, but cannot yet compare them with shared campaign activity.</p>
      </section>
    );
  }

  if (!loading && !clubs.length) {
    return (
      <section className={styles.empty}>
        <span>Execution trace</span>
        <strong>Sign in to compare campaign activity with outcomes.</strong>
        <p>Shared execution history is restricted to authorised club members and is never inferred from public evidence.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-label="Campaign execution trace">
      <div className={styles.head}>
        <div>
          <span>Execution trace</span>
          <h2>What AVELA recommended, what the club decided, what actually executed and what happened next.</h2>
          <p>The trace separates recommendation, human decision, operational handoff, verified execution and outcome evidence. Missing stages stay missing rather than being inferred.</p>
        </div>
        {clubs.length > 1 ? (
          <label>
            Club
            <select value={activeClubId} onChange={(event) => {
              setActiveClubId(event.target.value);
              void loadHistory(event.target.value);
            }}>
              {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      <div className={styles.decisionTrace}>
        <article data-state={trace.recommended ? "recorded" : "missing"}>
          <span>01 · AVELA recommendation</span>
          <strong>{trace.recommended?.label ?? "No shared recommendation record"}</strong>
          <p>{trace.recommended?.detail ?? "Recommendation evidence has not been recorded in shared history."}</p>
        </article>
        <article data-state={trace.decided ? "recorded" : "missing"}>
          <span>02 · Club decision</span>
          <strong>{trace.decided ? trace.decided.event_type.replaceAll("-", " ") + " · " + trace.decided.label : "No recorded human decision"}</strong>
          <p>{trace.decided?.detail ?? "Learning does not assume that a recommendation was accepted."}</p>
        </article>
        <article data-state={trace.executed ? "recorded" : trace.handoff ? "partial" : "missing"}>
          <span>03 · Execution</span>
          <strong>{trace.executed?.label ?? (trace.handoff ? "Launch handoff prepared · execution not proven" : "No execution evidence")}</strong>
          <p>{trace.executed?.detail ?? (trace.handoff ? "A handoff exists, but no executed decision event proves that an external system or operator completed the action." : "No connector or user execution record is available.")}</p>
        </article>
        <article data-state={measured || trace.measuredEvent ? "recorded" : "missing"}>
          <span>04 · Outcome</span>
          <strong>{measured ? "Observed club outcome connected" : trace.measuredEvent?.label ?? "Outcome not measured"}</strong>
          <p>{measured ? "Authorised aggregate result evidence is available for this fixture." : trace.measuredEvent?.detail ?? "No outcome is promoted from workflow activity alone."}</p>
        </article>
        <article data-state={trace.learned ? "recorded" : "missing"}>
          <span>05 · Learning</span>
          <strong>{trace.learned?.label ?? "No shared learning decision recorded"}</strong>
          <p>{trace.learned?.detail ?? "The next-fixture recommendation may still show modelled learning, but no club learning event has been recorded."}</p>
        </article>
      </div>

      <div className={styles.states}>
        <article><span>Drafts produced</span><strong>{trace.produced ? "Recorded" : "No record"}</strong></article>
        <article><span>Scope lock</span><strong>{trace.reserved ? "Active" : trace.reopened ? "Released" : "No record"}</strong></article>
        <article><span>Launch handoff</span><strong>{trace.handoff ? "Prepared" : "No record"}</strong></article>
        <article><span>Verified execution</span><strong>{trace.executed ? "Recorded" : "No record"}</strong></article>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineHead}>
          <strong>Recorded workspace activity</strong>
          <span>{loading ? "Loading…" : `${events.length} event${events.length === 1 ? "" : "s"}`}</span>
        </div>

        {!loading && !events.length ? (
          <div className={styles.noEvents}>
            <strong>No shared execution events for this fixture.</strong>
            <p>That means Learning should not assume a campaign was executed.</p>
          </div>
        ) : events.map((event) => (
          <article key={event.id}>
            <div>
              <span>{event.event_type.replaceAll("-", " ")}</span>
              <strong>{event.label}</strong>
              {event.detail ? <p>{event.detail}</p> : null}
            </div>
            <small>{new Date(event.created_at).toLocaleString("en-GB")}</small>
          </article>
        ))}
      </div>

      {loadMessage ? <p className={styles.loadMessage} role="status" aria-live="polite">{loadMessage}</p> : null}

      <div className={styles.guardrail}>
        <strong>Interpretation rule</strong>
        <p>Use this trace to confirm product workflow completion. Use ticketing, CRM, scan and revenue evidence to assess outcomes. Use a credible counterfactual before claiming incremental impact.</p>
      </div>
    </section>
  );
}
