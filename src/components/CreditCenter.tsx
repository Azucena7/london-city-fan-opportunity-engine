"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CreditCenter.module.css";

type Club = { id: string; name: string; role: string };
type CreditEvent = {
  id: string;
  fixture_id?: string | null;
  item_id?: string | null;
  event_type: "commit" | "release" | "consume" | "adjust";
  credits: number;
  note?: string | null;
  created_at: string;
};

export function CreditCenter() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [events, setEvents] = useState<CreditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLedger(clubId: string) {
    setLoading(true);
    const response = await fetch(`/api/credit-ledger?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
    const result = await response.json() as { events?: CreditEvent[] };
    setEvents(response.ok && Array.isArray(result.events) ? result.events : []);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as { configured?: boolean; authenticated?: boolean; clubs?: Club[] };
      setConfigured(Boolean(result.configured));
      const next = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(next);

      if (result.authenticated && next.length) {
        setActiveClubId(next[0].id);
        await loadLedger(next[0].id);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    return events.reduce((acc, event) => {
      if (event.event_type === "commit") acc.committed += event.credits;
      if (event.event_type === "consume") acc.consumed += event.credits;
      if (event.event_type === "release") acc.released += event.credits;
      if (event.event_type === "adjust") acc.adjusted += event.credits;
      return acc;
    }, { committed: 0, consumed: 0, released: 0, adjusted: 0 });
  }, [events]);

  const outstanding = Math.max(0, totals.committed - totals.consumed - totals.released);

  if (configured === false) {
    return (
      <section className={styles.empty}>
        <span>Credit Center</span>
        <h1>Club credit history is ready for the pilot database.</h1>
        <p>Until Supabase is configured, campaign budgeting and generated drafts continue to work with device-level persistence.</p>
      </section>
    );
  }

  if (!clubs.length && !loading) {
    return (
      <section className={styles.empty}>
        <span>Credit Center</span>
        <h1>Sign in from a campaign workspace to view club credit history.</h1>
        <p>The ledger is scoped by club membership and is not exposed to unauthenticated users.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span>Credit Center</span>
          <h1>Understand what the club has committed and used.</h1>
          <p>Credit events are recorded independently from campaign estimates so production spend stays auditable.</p>
        </div>
        {clubs.length ? (
          <label>
            Club
            <select value={activeClubId} onChange={(event) => {
              setActiveClubId(event.target.value);
              void loadLedger(event.target.value);
            }}>
              {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
            </select>
          </label>
        ) : null}
      </header>

      <div className={styles.summary}>
        <article><span>Committed</span><strong>{totals.committed} cr</strong><small>Reserved by generated work.</small></article>
        <article><span>Outstanding</span><strong>{outstanding} cr</strong><small>Committed but not consumed or released.</small></article>
        <article><span>Consumed</span><strong>{totals.consumed} cr</strong><small>Completed production/execution.</small></article>
        <article><span>Released</span><strong>{totals.released} cr</strong><small>Commitments returned before execution.</small></article>
      </div>

      <div className={styles.ledger}>
        <div className={styles.ledgerHead}>
          <strong>Recent credit events</strong>
          <span>{loading ? "Loading…" : `${events.length} event${events.length === 1 ? "" : "s"}`}</span>
        </div>
        {!loading && !events.length ? (
          <div className={styles.noEvents}>
            <strong>No credit events yet.</strong>
            <p>Generate a supported campaign draft to create the first commitment.</p>
          </div>
        ) : events.map((event) => (
          <article key={event.id}>
            <div>
              <span>{event.event_type}</span>
              <strong>{event.item_id?.replaceAll("-", " ") ?? "Credit adjustment"}</strong>
              <small>{event.fixture_id ?? "Club account"} · {new Date(event.created_at).toLocaleString("en-GB")}</small>
              {event.note ? <p>{event.note}</p> : null}
            </div>
            <b>{event.credits} cr</b>
          </article>
        ))}
      </div>
    </section>
  );
}
