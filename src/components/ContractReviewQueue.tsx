"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ContractReviewQueue.module.css";

type Club = { id: string; name: string; role: string };
type DocumentRow = {
  id: string;
  contract_type: "sponsor" | "player" | "other";
  subject_label: string;
  title: string;
  lifecycle_state: "detected" | "extracted" | "reviewed" | "active" | "superseded" | "terminated";
  effective_start?: string | null;
  effective_end?: string | null;
  source_system?: string | null;
  source_ref?: string | null;
  document_hash?: string | null;
  version_label?: string | null;
  supersedes_document_id?: string | null;
  updated_at: string;
};
type ClauseRow = {
  id: string;
  document_id: string;
  clause_type: string;
  label: string;
  extracted_value?: unknown;
  source_section?: string | null;
  source_fragment?: string | null;
  extraction_confidence?: number | null;
  review_state: "extracted" | "needs-review" | "verified" | "rejected";
  material: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
  reviewed_at?: string | null;
  supersedes_clause_id?: string | null;
};

export function ContractReviewQueue() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState("");
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [clauses, setClauses] = useState<ClauseRow[]>([]);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function load(id: string) {
    const response = await fetch("/api/contracts/review?clubId=" + encodeURIComponent(id), { cache: "no-store" });
    const result = await response.json() as {
      enabled?: boolean;
      documents?: DocumentRow[];
      clauses?: ClauseRow[];
      message?: string;
    };
    setEnabled(Boolean(result.enabled));
    setDocuments(response.ok && Array.isArray(result.documents) ? result.documents : []);
    setClauses(response.ok && Array.isArray(result.clauses) ? result.clauses : []);
    setMessage(result.message ?? "");
  }

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
      const next = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(next);
      if (result.authenticated && next.length) {
        setClubId(next[0].id);
        await load(next[0].id);
      }
    })();
  }, []);

  async function review(clauseId: string, reviewState: "needs-review" | "verified" | "rejected") {
    if (!clubId || busy) return;
    setBusy(clauseId + reviewState);
    setMessage("");
    const response = await fetch("/api/contracts/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId, clauseId, reviewState })
    });
    const result = await response.json() as { error?: string };
    if (response.ok) {
      setMessage(reviewState === "verified" ? "Clause verified." : "Clause review state updated.");
      await load(clubId);
    } else {
      setMessage(result.error ?? "Clause could not be updated.");
    }
    setBusy("");
  }

  const counts = useMemo(() => ({
    extracted: clauses.filter((item) => item.review_state === "extracted").length,
    review: clauses.filter((item) => item.review_state === "needs-review").length,
    verified: clauses.filter((item) => item.review_state === "verified").length,
    rejected: clauses.filter((item) => item.review_state === "rejected").length
  }), [clauses]);

  if (!clubs.length) return null;

  if (enabled === false) {
    return (
      <section className={styles.empty}>
        <span>Verification queue</span>
        <strong>Contract persistence is prepared but not enabled in this environment.</strong>
        <p>{message || "Apply the reviewed persistence migration before connecting legal documents or verifying clauses."}</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-label="Contract verification queue">
      <div className={styles.head}>
        <div>
          <span>Verification queue</span>
          <h2>Review extracted clauses before they can influence decisions.</h2>
          <p>Every clause keeps provenance, confidence, version and review state. Verification is an explicit governance action.</p>
        </div>
        {clubs.length > 1 ? (
          <label>
            Club
            <select value={clubId} onChange={(event) => { setClubId(event.target.value); void load(event.target.value); }}>
              {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      <div className={styles.counts}>
        <article><span>Extracted</span><strong>{counts.extracted}</strong></article>
        <article><span>Needs review</span><strong>{counts.review}</strong></article>
        <article><span>Verified</span><strong>{counts.verified}</strong></article>
        <article><span>Rejected</span><strong>{counts.rejected}</strong></article>
      </div>

      <div className={styles.documents}>
        {documents.map((document) => {
          const items = clauses.filter((clause) => clause.document_id === document.id);
          return (
            <article key={document.id} className={styles.document}>
              <header>
                <div>
                  <span>{document.contract_type} · {document.lifecycle_state}</span>
                  <h3>{document.title}</h3>
                  <p>{document.subject_label} · version {document.version_label ?? "unlabelled"}</p>
                </div>
                <small>
                  {document.source_system ?? "source unknown"}
                  {document.source_ref ? " · " + document.source_ref : ""}
                </small>
              </header>

              <div className={styles.provenance}>
                <span>Effective {document.effective_start ?? "?"} → {document.effective_end ?? "?"}</span>
                <span>Hash {document.document_hash ? document.document_hash.slice(0, 12) + "…" : "not recorded"}</span>
                <span>{document.supersedes_document_id ? "Superseding version" : "Base / unknown version chain"}</span>
              </div>

              <div className={styles.clauses}>
                {items.map((clause) => (
                  <div key={clause.id} className={styles.clause} data-state={clause.review_state}>
                    <div className={styles.clauseTop}>
                      <span>{clause.clause_type}{clause.material ? " · material" : ""}</span>
                      <strong>
                        {clause.extraction_confidence === null || clause.extraction_confidence === undefined
                          ? "confidence unknown"
                          : Math.round(clause.extraction_confidence * 100) + "% confidence"}
                      </strong>
                    </div>
                    <h4>{clause.label}</h4>
                    <p>{typeof clause.extracted_value === "string" ? clause.extracted_value : JSON.stringify(clause.extracted_value ?? {})}</p>

                    <details>
                      <summary>Provenance</summary>
                      <p><b>Section:</b> {clause.source_section ?? "not recorded"}</p>
                      <p><b>Source fragment:</b> {clause.source_fragment ?? "not recorded"}</p>
                      <p><b>Validity:</b> {clause.valid_from ?? "?"} → {clause.valid_to ?? "?"}</p>
                    </details>

                    <div className={styles.actions}>
                      <span>{clause.review_state.replaceAll("-", " ")}</span>
                      {clause.review_state === "verified" ? (
                        <small>Verified {clause.reviewed_at ? new Date(clause.reviewed_at).toLocaleString("en-GB") : ""}</small>
                      ) : (
                        <>
                          <button type="button" disabled={Boolean(busy)} onClick={() => void review(clause.id, "needs-review")}>Needs review</button>
                          <button type="button" disabled={Boolean(busy)} onClick={() => void review(clause.id, "rejected")}>Reject</button>
                          <button type="button" disabled={Boolean(busy)} onClick={() => void review(clause.id, "verified")}>
                            {busy === clause.id + "verified" ? "Verifying…" : "Verify clause"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {!items.length ? <p className={styles.noClauses}>No extracted clauses are recorded for this document.</p> : null}
              </div>
            </article>
          );
        })}

        {!documents.length ? (
          <div className={styles.noDocuments}>
            <strong>No legal documents connected.</strong>
            <p>AVELA will not create fulfilment truth from prospecting, technical schemas or assumptions.</p>
          </div>
        ) : null}
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}
    </section>
  );
}
