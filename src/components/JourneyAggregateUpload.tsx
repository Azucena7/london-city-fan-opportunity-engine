"use client";

import { useEffect, useState } from "react";
import { fetchClubSession } from "@/lib/clubSessionClient";
import { aggregateCrmRecords } from "../../scripts/lib/crm-ticketing-aggregate.mjs";
import type { CrmTicketingLiveDataset } from "@/lib/models";
import styles from "./JourneyAggregateUpload.module.css";

type Club = { id: string; name: string; role: string };
type Stored = { extracted_at: string | null; uploaded_at: string; dataset: CrmTicketingLiveDataset } | null;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "unknown");

// Turns the club's authorised ticketing/access export into an aggregate inside this browser and
// uploads only the aggregate. Supporter, order and ticket keys never leave the device.
export function JourneyAggregateUpload({ kickoffs }: { kickoffs: Record<string, { date: string; kickoff: string }> }) {
  const [club, setClub] = useState<Club | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [stored, setStored] = useState<Stored>(null);
  const [storage, setStorage] = useState<"club" | "unavailable" | "repository">("club");
  const [preview, setPreview] = useState<CrmTicketingLiveDataset | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadStored(clubId: string) {
    try {
      const response = await fetch(`/api/journey-aggregate?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
      const result = await response.json() as { persistence?: "club" | "unavailable" | "repository"; aggregate?: Stored };
      setStorage(result.persistence ?? "club");
      setStored(result.aggregate ?? null);
    } catch {
      setStorage("unavailable");
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const result = await (await fetchClubSession()).json() as { authenticated?: boolean; clubs?: Club[] };
        const first = result.authenticated && Array.isArray(result.clubs) ? result.clubs[0] ?? null : null;
        setSignedIn(Boolean(first));
        setClub(first);
        if (first) await loadStored(first.id);
      } catch {
        setSignedIn(false);
      }
    })();
  }, []);

  async function readExport(file: File) {
    setPreview(null);
    setErrors([]);
    setStatus("");
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const records = Array.isArray(parsed) ? parsed : (parsed as { records?: unknown[] })?.records;
      if (!Array.isArray(records)) throw new Error("The file must be the contract's JSON: an array of ticket rows, or { records: [...] }.");
      setPreview(aggregateCrmRecords(records, { kickoffs }));
      setStatus(`${records.length.toLocaleString("en-GB")} ticket rows read in this browser. Nothing has been uploaded yet.`);
    } catch (error) {
      setErrors(String(error instanceof Error ? error.message : error).split("\n").slice(0, 6));
    }
  }

  async function upload() {
    if (!club || !preview || uploading) return;
    setUploading(true);
    setStatus("Uploading the aggregate…");
    try {
      const response = await fetch("/api/journey-aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: club.id, dataset: preview })
      });
      const result = await response.json().catch(() => ({})) as { error?: string; errors?: string[] };
      if (response.ok) {
        setStatus("Aggregate stored for the club. Learning and the brief now read it.");
        setPreview(null);
        await loadStored(club.id);
      } else {
        setStatus(result.error ?? "The aggregate could not be stored.");
        setErrors(result.errors ?? []);
      }
    } catch {
      setStatus("The club workspace is unreachable. Nothing was stored.");
    } finally {
      setUploading(false);
    }
  }

  const canUpload = club?.role === "admin" && storage === "club";
  return (
    <section className={styles.wrap} aria-label="Ticketing and access aggregate">
      <div className={styles.head}>
        <div>
          <span>Ticketing, season tickets and stadium access</span>
          <strong>Club supporter-journey aggregate</strong>
        </div>
        <a href="/api/contracts/crm-ticketing" target="_blank" rel="noreferrer">Export contract (JSON schema) ↗</a>
      </div>
      <p className={styles.lead}>
        The authorised export is read in this browser and turned into counts. Only the aggregate is uploaded: supporter, order and ticket keys never leave this device, and groups under 10 are withheld.
      </p>

      {signedIn === false ? <p className={styles.state}>Sign in as a club administrator to upload the club&apos;s aggregate.</p> : null}
      {signedIn && storage === "unavailable" ? <p className={styles.state}>Club storage for journey aggregates needs a database update before uploads can be stored.</p> : null}
      {signedIn && storage === "club" ? (
        <p className={styles.state}>
          {stored
            ? `Latest upload ${date(stored.uploaded_at)} · export extracted ${date(stored.extracted_at)} · ${plural(stored.dataset.fixtureSummaries.length, "fixture")} · ${plural(stored.dataset.audienceDefinitions?.length ?? 0, "audience")}`
            : "No aggregate uploaded for this club yet."}
        </p>
      ) : null}

      {signedIn ? (
        <div className={styles.actions}>
          <label>Authorised export (JSON)<input type="file" accept="application/json,.json" disabled={!canUpload} onChange={(event) => { const file = event.target.files?.[0]; if (file) void readExport(file); }} /></label>
          {preview ? (
            <div className={styles.preview} aria-label="Aggregate preview">
              <span>{plural(preview.fixtureSummaries.length, "fixture")} · {plural(preview.audienceDefinitions?.length ?? 0, "audience")} · extracted {date(preview.extractedAt)}</span>
              <button type="button" disabled={!canUpload || uploading} onClick={() => void upload()}>{uploading ? "Uploading…" : "Upload aggregate"}</button>
            </div>
          ) : null}
          {!canUpload && storage === "club" ? <small>Uploading needs the club administrator role.</small> : null}
        </div>
      ) : null}

      {status ? <p role="status" className={styles.state}>{status}</p> : null}
      {errors.length ? <ul className={styles.errors} aria-label="Export problems">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
    </section>
  );
}
