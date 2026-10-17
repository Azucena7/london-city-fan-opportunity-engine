"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DecisionStateBadge, type UniversalDecisionState } from "@/components/WorkspaceUI";
import {
  emptyInboxFilter,
  filterInbox,
  inboxCounts,
  inboxOptions,
  isFiltered,
  type InboxFilter,
  type InboxItem,
  type InboxPriority,
  type InboxTab
} from "@/lib/decisionInbox";
import styles from "./DecisionInbox.module.css";

export type DecisionInboxItem = InboxItem & {
  href: string;
  deadline: string;
  impact: string;
  confidence: string;
  events: Array<{ id: string; at: string; label: string; detail: string }>;
};

const priorityLabel: Record<InboxPriority, string> = {
  "act-now": "Act now",
  review: "Review",
  blocked: "Blocked",
  monitor: "Monitor",
  "on-track": "On track"
};

const priorityState: Record<InboxPriority, UniversalDecisionState> = {
  "act-now": "ACT",
  review: "REVIEW",
  blocked: "BLOCKED",
  monitor: "MONITOR",
  "on-track": "READY"
};

const categoryLabel: Record<string, string> = {
  fixture: "Fixture",
  campaign: "Campaign",
  contract: "Contract",
  player: "Player",
  operations: "Operations",
  learning: "Learning"
};

const tabs: Array<[InboxTab, string]> = [
  ["all", "All open"],
  ["act-now", "Act now"],
  ["review", "Review"],
  ["blocked", "Blocked or on hold"]
];

function eventDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function Detail({ item }: { item: DecisionInboxItem }) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <span>{categoryLabel[item.category] ?? item.category}</span>
        <h3>{item.title}</h3>
        <div className={styles.badges}>
          <DecisionStateBadge state={priorityState[item.priority]} label={priorityLabel[item.priority]} />
          {item.onHold ? <DecisionStateBadge state="BLOCKED" label="HOLD" /> : null}
        </div>
      </div>
      <dl className={styles.facts}>
        <div><dt>AVELA recommends</dt><dd>{item.recommendation}</dd></div>
        <div><dt>Why it matters</dt><dd>{item.why}</dd></div>
        <div><dt>What changed</dt><dd>{item.changed}</dd></div>
      </dl>
      <dl className={styles.meta}>
        <div><dt>Owner</dt><dd>{item.owner ?? "Not assigned"}</dd></div>
        <div><dt>When</dt><dd>{item.deadline}</dd></div>
        <div><dt>Impact</dt><dd>{item.impact}</dd></div>
        <div><dt>Confidence</dt><dd>{item.confidence}</dd></div>
      </dl>
      {item.events.length ? (
        <div className={styles.events}>
          <strong>Recent evidence</strong>
          <ul>
            {item.events.slice(0, 3).map((event) => (
              <li key={event.id}><time dateTime={event.at}>{eventDate(event.at)}</time> {event.label}{event.detail ? <small>{event.detail}</small> : null}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link className={styles.open} href={item.href}>Open to decide →</Link>
      <p className={styles.note}>The decision itself is recorded where its evidence lives, never from this summary.</p>
    </div>
  );
}

/**
 * The attention list as a working inbox: tabs, search and filters narrow what the decision queue
 * already ranked, and a selected row opens its summary beside the list (a sheet on phones).
 */
export function DecisionInbox({ items }: { items: DecisionInboxItem[] }) {
  const [filter, setFilter] = useState<InboxFilter>(emptyInboxFilter);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [narrow, setNarrow] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const counts = useMemo(() => inboxCounts(items), [items]);
  const categories = useMemo(() => inboxOptions(items, "category"), [items]);
  const owners = useMemo(() => inboxOptions(items, "owner"), [items]);
  const visible = useMemo(() => filterInbox(items, filter), [items, filter]);
  const selected = visible.find((item) => item.id === selectedId) ?? (narrow ? null : visible[0] ?? null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 899px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  function choose(id: string, button: HTMLButtonElement) {
    setSelectedId(id);
    if (narrow) {
      openerRef.current = button;
      dialogRef.current?.showModal();
    }
  }

  function closeSheet() {
    dialogRef.current?.close();
  }

  const update = (patch: Partial<InboxFilter>) => setFilter((current) => ({ ...current, ...patch }));

  return (
    <section className={styles.inbox} aria-label="Decision inbox">
      <div className={styles.controls}>
        <div className={styles.tabs} role="group" aria-label="Show decisions">
          {tabs.map(([tab, label]) => (
            <button key={tab} type="button" aria-pressed={filter.tab === tab} onClick={() => update({ tab })}>
              {label} <span>{counts[tab]}</span>
            </button>
          ))}
        </div>
        <div className={styles.filters}>
          <label>
            <span>Search</span>
            <input type="search" value={filter.query} placeholder="Opponent, owner, recommendation…" onChange={(event) => update({ query: event.target.value })} />
          </label>
          {categories.length > 1 ? (
            <label>
              <span>Area</span>
              <select value={filter.category} onChange={(event) => update({ category: event.target.value })}>
                <option value="">All areas</option>
                {categories.map((category) => <option key={category} value={category}>{categoryLabel[category] ?? category}</option>)}
              </select>
            </label>
          ) : null}
          {owners.length > 1 ? (
            <label>
              <span>Owner</span>
              <select value={filter.owner} onChange={(event) => update({ owner: event.target.value })}>
                <option value="">Everyone</option>
                {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.list}>
          <p className={styles.resultCount} role="status">
            {visible.length === items.length ? `${items.length} open decisions` : `${visible.length} of ${items.length} open decisions`}
          </p>
          {visible.length ? (
            <ol>
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.row}
                    data-priority={item.priority}
                    aria-current={selected?.id === item.id ? "true" : undefined}
                    onClick={(event) => choose(item.id, event.currentTarget)}
                  >
                    <span className={styles.rowRank}>{String(items.indexOf(item) + 1).padStart(2, "0")}</span>
                    <span className={styles.rowCopy}>
                      <span className={styles.rowTitle}>
                        <strong>{item.title}</strong>
                        <DecisionStateBadge state={priorityState[item.priority]} label={priorityLabel[item.priority]} />
                        {item.onHold ? <DecisionStateBadge state="BLOCKED" label="HOLD" /> : null}
                      </span>
                      <span className={styles.rowRecommendation}>{item.recommendation}</span>
                      <small>{[item.owner ? "Owner: " + item.owner : "", categoryLabel[item.category] ?? item.category, item.deadline].filter(Boolean).join(" · ")}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.empty}>
              {items.length ? <p>No open decision matches these filters.</p> : <p>No material decision currently needs intervention.</p>}
              {isFiltered(filter) ? <button type="button" onClick={() => setFilter(emptyInboxFilter)}>Clear filters</button> : null}
            </div>
          )}
        </div>

        {!narrow ? (
          <aside className={styles.pane} aria-label="Selected decision">
            {selected ? <Detail item={selected} /> : <p className={styles.paneEmpty}>Select a decision to see why it matters and what AVELA recommends.</p>}
          </aside>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.sheet}
        aria-label={selected ? selected.title : "Selected decision"}
        onClose={() => openerRef.current?.focus()}
        onClick={(event) => { if (event.target === event.currentTarget) closeSheet(); }}
      >
        <div className={styles.sheetBar}>
          <span>Decision</span>
          <button type="button" onClick={closeSheet}>Close</button>
        </div>
        {narrow && selected ? <Detail item={selected} /> : null}
      </dialog>
    </section>
  );
}

