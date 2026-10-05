import type { RoutedWorkPackage } from "@/lib/workSystemRouting";
import styles from "./WorkRoutingPlan.module.css";

export function WorkRoutingPlan({ plan }: { plan: RoutedWorkPackage }) {
  return (
    <section className={styles.wrap} aria-label="Work-system routing plan">
      <div>
        <span>Routing plan</span>
        <strong>{plan.destinationSystem ? `Route to ${plan.destinationSystem}` : "No route configured"}</strong>
        <p>{plan.rationale}</p>
      </div>
      <aside data-state={plan.destinationSystem ? "configured" : "missing"}>
        <span>Confirmation</span>
        <strong>{plan.requireConfirmation ? "Required" : "Not required"}</strong>
        <small>{plan.destinationSystem ? `${plan.unroutedItemKeys.length} unrouted item${plan.unroutedItemKeys.length === 1 ? "" : "s"}` : "Preview only"}</small>
      </aside>
      {plan.destinationSystem ? (
        <div className={styles.detail}>
          <span>Destination system <b>{plan.destinationSystem}</b></span>
          <span>Connection <b>{plan.connectionRef ?? "Unknown"}</b></span>
          <span>Rule <b>{plan.matchedRuleId ?? "Unknown"}</b></span>
        </div>
      ) : null}
      {plan.unroutedItemKeys.length ? (
        <details>
          <summary>Items outside the selected rule</summary>
          <ul>{plan.unroutedItemKeys.map((key) => <li key={key}>{key}</li>)}</ul>
        </details>
      ) : null}
      <p className={styles.guardrail}>AVELA does not dispatch this package automatically. The routing plan is advisory until a user confirms the external handoff.</p>
    </section>
  );
}
