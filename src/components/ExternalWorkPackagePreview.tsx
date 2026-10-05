import type { WorkPackage } from "@/lib/workSystemOrchestration";
import styles from "./ExternalWorkPackagePreview.module.css";

function hours(minutes: number) {
  const value = minutes / 60;
  return value < 10 ? value.toFixed(1) + "h" : Math.round(value) + "h";
}

export function ExternalWorkPackagePreview({ workPackage }: { workPackage: WorkPackage }) {
  const blocked = workPackage.items.filter((item) => item.state === "blocked").length;

  return (
    <section className={styles.wrap} aria-label="External work package preview">
      <div className={styles.head}>
        <div>
          <span>Execution orchestration</span>
          <h2>What work would AVELA hand off to the club&apos;s system?</h2>
          <p>AVELA derives the work package and keeps decision context. Asana, Monday, Jira, Notion or another system should remain the operational task surface.</p>
        </div>
        <aside>
          <span>Adapter state</span>
          <strong>Not connected</strong>
          <small>Preview only · no external task has been created.</small>
        </aside>
      </div>

      <div className={styles.summary}>
        <article><span>Derived items</span><strong>{workPackage.items.length}</strong></article>
        <article><span>Estimated effort</span><strong>{hours(workPackage.estimatedMinutes)}</strong></article>
        <article><span>Blocked</span><strong>{blocked}</strong></article>
        <article><span>Work package</span><strong>Proposed</strong></article>
      </div>

      <div className={styles.items}>
        {workPackage.items.map((item, index) => (
          <article key={item.key} data-state={item.state}>
            <div className={styles.index}>{String(index + 1).padStart(2, "0")}</div>
            <div>
              <span>{item.category} · {item.ownerHint}</span>
              <strong>{item.title}</strong>
              <small>
                {hours(item.estimatedMinutes)}
                {item.dueDate ? " · due " + item.dueDate : ""}
                {item.dependencyKeys.length ? " · " + item.dependencyKeys.length + " dependenc" + (item.dependencyKeys.length === 1 ? "y" : "ies") : ""}
              </small>
            </div>
            <b>{item.state}</b>
          </article>
        ))}
      </div>

      <div className={styles.boundary}>
        <strong>AVELA orchestrates; it does not replace project management.</strong>
        <p>Future adapters should create/update external work and sync back only assignee, due date, status, blockers and workload signals needed for decision intelligence.</p>
      </div>
    </section>
  );
}
