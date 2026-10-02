"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./LearningCampaignTrace.module.css";

type Club = { id: string; name: string; role: string };
type Activity = {
  id: string;
  event_type: "review" | "draft-generated" | "reserve" | "release" | "launch-handoff";
  label: string;
  detail?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export function LearningCampaignTrace({ fixtureId }: { fixtureId: string }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState<boolean | null>(null);

  async function loadHistory(clubId: string) {
    setLoading(true);
    const response = await fetch(`/api/campaign-history/${encodeURIComponent(fixtureId)}?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
    const result = await response.json() as { events?: Activity[] };
    setEvents(response.ok && Array.isArray(result.events) ? result.events : []);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
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
    })();
  }, [fixtureId]); // eslint-disable-line react-hooks/exhaustive-deps -- reload account state when the selected fixture changes

  const trace = useMemo(() => {
    const types = new Set(events.map((event) => event.event_type));
    return {
      reviewed: types.has("review"),
      produced: types.has("draft-generated"),
      reserved: types.has("reserve") && !types.has("release"),
      reopened: types.has("release"),
      handoff: types.has("launch-handoff")
    };
  }, [events]);

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
          <h2>What actually happened inside the campaign workspace?</h2>
          <p>This is operational evidence, not outcome evidence. A review, generated draft or launch handoff does not prove that supporters received a message or that a campaign caused a result.</p>
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

      <div className={styles.states}>
        <article><span>Reviewed</span><strong>{trace.reviewed ? "Recorded" : "No record"}</strong></article>
        <article><span>Drafts produced</span><strong>{trace.produced ? "Recorded" : "No record"}</strong></article>
        <article><span>Credits reserved</span><strong>{trace.reserved ? "Active" : trace.reopened ? "Released" : "No record"}</strong></article>
        <article><span>Launch handoff</span><strong>{trace.handoff ? "Prepared" : "No record"}</strong></article>
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

      <div className={styles.guardrail}>
        <strong>Interpretation rule</strong>
        <p>Use this trace to confirm product workflow completion. Use ticketing, CRM, scan and revenue evidence to assess outcomes. Use a credible counterfactual before claiming incremental impact.</p>
      </div>
    </section>
  );
}
