import Link from "next/link";
import type { CalendarRelationship } from "@/lib/calendarIntelligence";
import styles from "./CalendarRelationshipPanel.module.css";

function label(type: CalendarRelationship["type"]) {
  return type.replaceAll("-", " ");
}

function routeFor(item: CalendarRelationship) {
  if (item.fixtureIds.length === 1) return "/app/matches/" + item.fixtureIds[0];
  return "/app/season";
}

export function CalendarRelationshipPanel({
  relationships,
  internalState,
  externalState
}: {
  relationships: CalendarRelationship[];
  internalState: "connected" | "unavailable";
  externalState: "operational" | "degraded" | "waiting";
}) {
  const conflicts = relationships.filter((item) => item.type === "conflict").length;
  const sequence = relationships.filter((item) => item.type === "sequence").length;
  const high = relationships.filter((item) => item.strength === "high").length;

  return (
    <section className={styles.wrap} aria-label="Calendar Intelligence relationships">
      <div className={styles.head}>
        <div>
          <span>Calendar Intelligence</span>
          <h2>What collides, what can be sequenced, and what should be reused?</h2>
          <p>AVELA derives relationships from dated evidence rather than waiting for a campaign plan to exist first.</p>
        </div>
        <aside>
          <span>Relationship pressure</span>
          <strong>{high} high-priority</strong>
          <small>{conflicts} conflicts · {sequence} sequence opportunities</small>
        </aside>
      </div>

      <div className={styles.coverage}>
        <span data-state="connected">Club fixtures · connected</span>
        <span data-state="connected">Campaign schedule · connected</span>
        <span data-state={externalState === "waiting" ? "missing" : "connected"}>External landscape · {externalState}</span>
        <span data-state={internalState === "connected" ? "connected" : "missing"}>Internal availability · {internalState}</span>
        <span data-state="missing">Men&apos;s team calendar · not connected</span>
        <span data-state="missing">Sponsor event calendar · not connected</span>
      </div>

      <div className={styles.grid}>
        {relationships.slice(0, 18).map((item) => (
          <article key={item.id} data-strength={item.strength}>
            <div className={styles.top}>
              <span>{label(item.type)} · {item.strength}</span>
              <time>{item.endDate && item.endDate !== item.date ? item.date + " → " + item.endDate : item.date}</time>
            </div>
            <h3>{item.title}</h3>
            <p>{item.rationale}</p>
            <div className={styles.tags}>
              {item.secondaryTypes.map((type) => <span key={type}>{label(type)}</span>)}
            </div>
            <details>
              <summary>Evidence</summary>
              <ul>{item.evidence.map((entry) => <li key={entry}>{entry}</li>)}</ul>
              <small>Source · {item.sourceLabel}</small>
            </details>
            <div className={styles.action}>
              <strong>{item.action}</strong>
              <Link href={routeFor(item)}>Open context →</Link>
            </div>
          </article>
        ))}
        {!relationships.length ? (
          <div className={styles.empty}>
            <strong>No material calendar relationship is currently derived.</strong>
            <p>This does not mean there are no conflicts: disconnected calendar layers remain explicitly unknown.</p>
          </div>
        ) : null}
      </div>

      <div className={styles.rule}>
        <strong>Relationship ≠ automatic decision.</strong>
        <p>Calendar Intelligence changes what AVELA asks the club to review; it does not silently move dates, contact people or alter the official campaign.</p>
      </div>
    </section>
  );
}
