"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./SimilarDecisionsPanel.module.css";

type Club = { id: string; name: string; role: string };
type SimilarDecision = {
  fixtureId: string;
  opponent: string;
  date: string;
  campaign: string;
  score: number;
  reasons: string[];
  memory: {
    type: "executed" | "measured" | "learned";
    label: string;
    detail?: string | null;
    sourceType: string;
    createdAt: string;
  };
};

export function SimilarDecisionsPanel({ fixtureId }: { fixtureId: string }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [items, setItems] = useState<SimilarDecision[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(clubId: string) {
    setLoading(true);
    const response = await fetch(
      `/api/decision-memory/similar?clubId=${encodeURIComponent(clubId)}&fixtureId=${encodeURIComponent(fixtureId)}`,
      { cache: "no-store" }
    );
    const result = await response.json() as { similar?: SimilarDecision[]; reason?: string | null };
    setItems(response.ok && Array.isArray(result.similar) ? result.similar : []);
    setReason(response.ok ? result.reason ?? "" : "Decision memory could not be loaded.");
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
      const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(nextClubs);
      if (result.authenticated && nextClubs.length) {
        setActiveClubId(nextClubs[0].id);
        await load(nextClubs[0].id);
      } else {
        setLoading(false);
      }
    })();
  }, [fixtureId]); // eslint-disable-line react-hooks/exhaustive-deps -- similarity follows the active fixture

  if (!clubs.length) return null;

  return (
    <section className={styles.wrap} aria-label="Similar historical decisions">
      <div className={styles.head}>
        <div>
          <span>Institutional memory</span>
          <h2>Have we made a similar decision before?</h2>
          <p>AVELA only surfaces precedents with recorded execution, measurement or learning. Similarity is based on visible decision dimensions, not an opaque embedding score.</p>
        </div>
        {clubs.length > 1 ? (
          <label>
            Club
            <select value={activeClubId} onChange={(event) => { setActiveClubId(event.target.value); void load(event.target.value); }}>
              {clubs.map((club) => <option value={club.id} key={club.id}>{club.name}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      {loading ? <p className={styles.empty}>Checking decision memory…</p> : null}

      {!loading && items.length ? (
        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.fixtureId}>
              <div className={styles.top}>
                <span>{item.memory.type} · {item.memory.sourceType}</span>
                <strong>{item.score}</strong>
              </div>
              <h3>{item.opponent} · {item.date}</h3>
              <p className={styles.campaign}>{item.campaign}</p>
              <div className={styles.reasons}>
                {item.reasons.map((entry) => <span key={entry}>{entry}</span>)}
              </div>
              <div className={styles.memory}>
                <span>Recorded memory</span>
                <strong>{item.memory.label}</strong>
                {item.memory.detail ? <p>{item.memory.detail}</p> : null}
                <small>{new Date(item.memory.createdAt).toLocaleString("en-GB")}</small>
              </div>
              <Link href={`/app/learning?fixture=${item.fixtureId}`}>Open historical fixture →</Link>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !items.length ? (
        <div className={styles.emptyState}>
          <strong>No comparable executed decision yet.</strong>
          <p>{reason || "AVELA needs at least one comparable executed, measured or learned decision before it can reuse institutional memory."}</p>
        </div>
      ) : null}

      <div className={styles.guardrail}>
        <strong>Memory rule</strong>
        <p>A similar decision is evidence, not a rule. AVELA should explain the common dimensions and let the current context override the precedent.</p>
      </div>
    </section>
  );
}
