"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./OutcomeAggregatePanel.module.css";

type Club = { id: string; name: string; permissions?: string[] };
type Outcome = {
  fixture_id: string;
  evidence_state: "reported" | "verified";
  attendance?: number | null;
  tickets?: number | null;
  scans?: number | null;
  no_shows?: number | null;
  gross_ticket_revenue?: number | null;
  campaign_attributed_tickets?: number | null;
  repeat_cohort_base?: number | null;
  repeat_purchases?: number | null;
  source_label: string;
  source_ref?: string | null;
  observed_at: string;
  updated_at?: string;
};

function numberOrBlank(value: string) {
  return value.trim() === "" ? null : Number(value);
}

export function OutcomeAggregatePanel({
  fixtureId,
  fixtureLabel,
  fixtureDate
}: {
  fixtureId: string;
  fixtureLabel: string;
  fixtureDate: string;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [tickets, setTickets] = useState("");
  const [scans, setScans] = useState("");
  const [noShows, setNoShows] = useState("");
  const [revenue, setRevenue] = useState("");
  const [attributed, setAttributed] = useState("");
  const [repeatBase, setRepeatBase] = useState("");
  const [repeatPurchases, setRepeatPurchases] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [observedAt, setObservedAt] = useState(fixtureDate);

  async function load(id: string) {
    try {
      const response = await fetch(`/api/outcome-aggregate/${encodeURIComponent(fixtureId)}?clubId=${encodeURIComponent(id)}`, { cache: "no-store" });
      const result = await response.json() as { outcome?: Outcome | null; error?: string };
      if (!response.ok) {
        setOutcome(null);
        setStatus(result.error || "Aggregate outcome could not be loaded.");
        return;
      }
      const next = result.outcome ?? null;
      setOutcome(next);
      if (next) {
        setAttendance(next.attendance?.toString() ?? "");
        setTickets(next.tickets?.toString() ?? "");
        setScans(next.scans?.toString() ?? "");
        setNoShows(next.no_shows?.toString() ?? "");
        setRevenue(next.gross_ticket_revenue?.toString() ?? "");
        setAttributed(next.campaign_attributed_tickets?.toString() ?? "");
        setRepeatBase(next.repeat_cohort_base?.toString() ?? "");
        setRepeatPurchases(next.repeat_purchases?.toString() ?? "");
        setSourceLabel(next.source_label ?? "");
        setSourceRef(next.source_ref ?? "");
        setObservedAt(next.observed_at?.slice(0, 10) ?? fixtureDate);
      }
    } catch {
      setOutcome(null);
      setStatus("Outcome service is unreachable. No outcome evidence was changed.");
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
        const next = Array.isArray(result.clubs) ? result.clubs : [];
        setClubs(next);
        if (result.authenticated && next.length) {
          setClubId(next[0].id);
          await load(next[0].id);
        }
      } catch {
        setStatus("Account state could not be loaded. Outcome evidence remains unchanged.");
      }
    })();
  }, [fixtureId]); // eslint-disable-line react-hooks/exhaustive-deps -- outcome follows the selected fixture

  const activeClub = clubs.find((club) => club.id === clubId) ?? null;
  const canAdministerResults = Boolean(activeClub?.permissions?.includes("results:administer"));
  const repeatRate = useMemo(() => {
    if (!outcome?.repeat_cohort_base || outcome.repeat_purchases === null || outcome.repeat_purchases === undefined) return null;
    return outcome.repeat_purchases / outcome.repeat_cohort_base;
  }, [outcome]);

  async function save() {
    if (!clubId || !canAdministerResults || busy || !sourceLabel.trim() || !observedAt) return;
    setBusy(true);
    setStatus("Saving aggregate outcome…");
    try {
      const response = await fetch(`/api/outcome-aggregate/${encodeURIComponent(fixtureId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          attendance: numberOrBlank(attendance),
          tickets: numberOrBlank(tickets),
          scans: numberOrBlank(scans),
          noShows: numberOrBlank(noShows),
          grossTicketRevenue: numberOrBlank(revenue),
          campaignAttributedTickets: numberOrBlank(attributed),
          repeatCohortBase: numberOrBlank(repeatBase),
          repeatPurchases: numberOrBlank(repeatPurchases),
          sourceLabel,
          sourceRef,
          observedAt
        })
      });
      const result = await response.json() as { outcome?: Outcome; message?: string; error?: string };
      if (!response.ok) {
        setStatus(result.error || "Aggregate outcome was not saved. Existing evidence was not changed.");
        return;
      }
      setOutcome(result.outcome ?? null);
      setStatus(result.message || "Club-reported aggregate saved.");
      window.dispatchEvent(new CustomEvent("avela:outcome-aggregate-updated", { detail: { fixtureId } }));
    } catch {
      setStatus("Outcome service is unreachable. Existing evidence was not changed.");
    } finally {
      setBusy(false);
    }
  }

  if (!clubs.length) return null;

  return (
    <section className={styles.wrap} aria-label="Aggregate club outcome">
      <div className={styles.head}>
        <div>
          <span>Aggregate outcome fallback</span>
          <h2>Bring post-match evidence in without supporter-level data.</h2>
          <p>Use authorised aggregate totals when a direct CRM/ticketing connector is not yet available. This records descriptive evidence only.</p>
        </div>
        <div className={styles.state} data-state={outcome?.evidence_state ?? "missing"}>
          <span>{fixtureLabel}</span>
          <strong>{outcome ? "Club-reported aggregate" : "No aggregate recorded"}</strong>
          <small>{outcome ? `${outcome.source_label} · observed ${new Date(outcome.observed_at).toLocaleDateString("en-GB")}` : "Missing values remain unknown, never zero."}</small>
        </div>
      </div>

      {outcome ? (
        <div className={styles.metrics}>
          <article><span>Attendance</span><strong>{outcome.attendance?.toLocaleString("en-GB") ?? "—"}</strong></article>
          <article><span>Tickets</span><strong>{outcome.tickets?.toLocaleString("en-GB") ?? "—"}</strong></article>
          <article><span>Scan rate</span><strong>{outcome.scans !== null && outcome.scans !== undefined && outcome.tickets ? Math.round(outcome.scans / outcome.tickets * 100) + "%" : "—"}</strong></article>
          <article><span>Attributed tickets</span><strong>{outcome.campaign_attributed_tickets?.toLocaleString("en-GB") ?? "—"}</strong></article>
          <article><span>Revenue</span><strong>{outcome.gross_ticket_revenue !== null && outcome.gross_ticket_revenue !== undefined ? "£" + outcome.gross_ticket_revenue.toLocaleString("en-GB") : "—"}</strong></article>
          <article><span>Repeat purchase</span><strong>{repeatRate !== null ? (repeatRate * 100).toFixed(1) + "%" : "—"}</strong></article>
        </div>
      ) : null}

      {canAdministerResults ? (
        <details className={styles.entry}>
          <summary>{outcome ? "Update aggregate outcome" : "Record aggregate outcome"}</summary>
          <div className={styles.form}>
            <label>Attendance<input type="number" min="0" value={attendance} onChange={(event) => setAttendance(event.target.value)} /></label>
            <label>Tickets<input type="number" min="0" value={tickets} onChange={(event) => setTickets(event.target.value)} /></label>
            <label>Scans<input type="number" min="0" value={scans} onChange={(event) => setScans(event.target.value)} /></label>
            <label>No-shows<input type="number" min="0" value={noShows} onChange={(event) => setNoShows(event.target.value)} /></label>
            <label>Gross ticket revenue (£)<input type="number" min="0" step="0.01" value={revenue} onChange={(event) => setRevenue(event.target.value)} /></label>
            <label>Campaign-attributed tickets<input type="number" min="0" value={attributed} onChange={(event) => setAttributed(event.target.value)} /></label>
            <label>Repeat cohort base<input type="number" min="0" value={repeatBase} onChange={(event) => setRepeatBase(event.target.value)} /></label>
            <label>Repeat purchases<input type="number" min="0" value={repeatPurchases} onChange={(event) => setRepeatPurchases(event.target.value)} /></label>
            <label>Source label<input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} placeholder="e.g. Ticketing aggregate export" /></label>
            <label>Source reference<input value={sourceRef} onChange={(event) => setSourceRef(event.target.value)} placeholder="Export ID or authorised report URL" /></label>
            <label>Observed date<input type="date" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} /></label>
          </div>
          <button type="button" disabled={busy || !sourceLabel.trim() || !observedAt} onClick={() => void save()}>
            {busy ? "Saving…" : "Save club-reported aggregate"}
          </button>
          <p>No names, emails, supporter IDs, postcodes, payment details or free-text supporter data are accepted by this endpoint.</p>
        </details>
      ) : (
        <p className={styles.readOnly}>Results administration permission is required to record or update aggregate outcomes.</p>
      )}

      {status ? <p className={styles.status} role="status" aria-live="polite">{status}</p> : null}
    </section>
  );
}
