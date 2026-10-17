"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import styles from "./CampaignViews.module.css";

export type CampaignListRow = {
  id: string;
  title: string;
  kind: "Fixture" | "Commercial";
  /** Lifecycle stage for fixture campaigns; commercial briefs carry no approval state yet. */
  stage: string | null;
  when: string;
  whenLabel: string;
  owner: string | null;
  next: string;
  href: string;
};

/**
 * The campaign board and a sortable-by-date list over the same campaigns, so every campaign —
 * fixture or commercial — can be scanned and filtered in one table.
 */
export function CampaignViews({ rows, board }: { rows: CampaignListRow[]; board: ReactNode }) {
  const [view, setView] = useState<"board" | "list">("board");
  const [kind, setKind] = useState("");
  const [stage, setStage] = useState("");
  const [query, setQuery] = useState("");

  const stages = useMemo(() => Array.from(new Set(rows.map((row) => row.stage).filter((value): value is string => Boolean(value)))), [rows]);
  const visible = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return rows
      .filter((row) => (!kind || row.kind === kind) && (!stage || row.stage === stage))
      .filter((row) => terms.every((term) => [row.title, row.owner ?? "", row.next].join(" ").toLowerCase().includes(term)))
      .sort((a, b) => a.when.localeCompare(b.when));
  }, [rows, kind, stage, query]);

  return (
    <div>
      <div className={styles.switch} role="group" aria-label="Campaign view">
        <button type="button" aria-pressed={view === "board"} onClick={() => setView("board")}>Board</button>
        <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>List</button>
      </div>

      {view === "board" ? board : (
        <section aria-label="Campaign list">
          <div className={styles.filters}>
            <label><span>Search</span><input type="search" value={query} placeholder="Campaign, owner, next step…" onChange={(event) => setQuery(event.target.value)} /></label>
            <label><span>Type</span>
              <select value={kind} onChange={(event) => setKind(event.target.value)}>
                <option value="">All campaigns</option>
                <option value="Fixture">Fixture</option>
                <option value="Commercial">Commercial calendar</option>
              </select>
            </label>
            <label><span>Stage</span>
              <select value={stage} onChange={(event) => setStage(event.target.value)}>
                <option value="">Any stage</option>
                {stages.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <p className={styles.count} role="status">{visible.length === rows.length ? `${rows.length} campaigns` : `${visible.length} of ${rows.length} campaigns`}, by date</p>
          {visible.length ? (
            <div className={styles.tableWrap} tabIndex={0} aria-label="Campaigns, scrollable">
              <table className={styles.table}>
                <thead><tr><th scope="col">Campaign</th><th scope="col">Type</th><th scope="col">Stage</th><th scope="col">When</th><th scope="col">Owner</th><th scope="col">Next step</th></tr></thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.kind + row.id}>
                      <th scope="row"><Link href={row.href}>{row.title}</Link></th>
                      <td>{row.kind}</td>
                      <td>{row.stage ?? <span className={styles.muted}>No approval state</span>}</td>
                      <td><time dateTime={row.when}>{row.whenLabel}</time></td>
                      <td>{row.owner ?? <span className={styles.muted}>Not assigned</span>}</td>
                      <td>{row.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No campaign matches these filters.</p>
              <button type="button" onClick={() => { setKind(""); setStage(""); setQuery(""); }}>Clear filters</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
