import type { Metadata } from "next";
import Link from "next/link";
import styles from "./decision-room.module.css";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "Decision Room",
  description: "A football club decision view showing evidence, assumptions, blockers and what would change the decision."
};

function ItemList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <ul><li>{empty}</li></ul>;
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function DecisionRoomPage() {
  const live = getCurrentProductOpportunity();

  return (
    <main className={styles.shell}>
      <ProductJourneyNav active="decision" />

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Decision Room · {live ? "London City vs " + live.fixture.opponent : "London City"}
          </span>
          <h1>{live ? "Should the club act on the current " + live.opportunityLabel.toLowerCase() + "?" : "No current decision is available."}</h1>
          <p>
            This view is generated from the same live fixture, campaign and signal data as the engine.
            It separates what is known from what is assumed and keeps missing CRM/ticket evidence explicit.
          </p>
        </div>
        <aside className={styles.statusCard}>
          <span>Current decision state</span>
          <strong>{live?.decisionState ?? "HOLD"}</strong>
          <p>{live?.primaryBlocker ?? "Waiting for a current product opportunity."}</p>
        </aside>
      </header>

      <section className={styles.summaryGrid}>
        <article>
          <span>Opportunity</span>
          <strong>{live?.opportunityLabel ?? "Under review"}</strong>
          <p>{live?.opportunity ?? "No current opportunity."}</p>
        </article>
        <article>
          <span>Potential impact</span>
          <strong>{live?.impact.ticketsLow !== null && live?.impact.ticketsLow !== undefined ? live.impact.ticketsLow + " tickets" : "Requires club data"}</strong>
          <p>No impact range is asserted until cohort size and conversion evidence are connected.</p>
        </article>
        <article>
          <span>Decision confidence</span>
          <strong>{live?.confidence.label ?? "—"}</strong>
          <p>{live?.confidence.rationale ?? "No confidence rationale is available."}</p>
        </article>
        <article>
          <span>Readiness</span>
          <strong>{live?.readiness.label ?? "—"}</strong>
          <p>{live?.updatedAt ? "Engine updated " + new Date(live.updatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" }) : "Update time unavailable"}</p>
        </article>
      </section>

      <section className={styles.board}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTag}>EVIDENCE</span>
            <strong>What supports the decision</strong>
          </div>
          <ItemList items={live?.known ?? []} empty="No confirmed evidence loaded." />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTagAmber}>ASSUMPTIONS</span>
            <strong>What we currently believe</strong>
          </div>
          <ItemList items={live?.assumptions ?? []} empty="No assumptions loaded." />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTagRed}>BLOCKERS</span>
            <strong>What must be resolved</strong>
          </div>
          <ItemList items={live?.blockers ?? []} empty="No blocking approval gate is currently recorded." />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTagBlue}>WHAT WOULD CHANGE THE DECISION</span>
            <strong>Conditions that invalidate the current plan</strong>
          </div>
          <ItemList items={live?.whatWouldChangeDecision ?? []} empty="No decision-change conditions loaded." />
        </article>
      </section>

      <section className={styles.actionSection}>
        <div className={styles.actionCopy}>
          <span className={styles.eyebrow}>Next required action</span>
          <h2>{live?.recommendedAction ?? "No current action is available."}</h2>
          <p>
            The product does not promote this to a ready state until the blocking approval and measurement gaps are resolved.
          </p>
        </div>
        <div className={styles.actionMeta}>
          <div><span>Owner</span><strong>{live?.nextAction.owner ?? "Pending"}</strong></div>
          <div><span>Due</span><strong>{live?.nextAction.deadline ?? "Pending"}</strong></div>
          <div><span>Measure</span><strong>{live?.nextAction.measurement ?? "Pending"}</strong></div>
        </div>
      </section>

      <section className={styles.footerCard}>
        <div>
          <span className={styles.eyebrow}>Live lineage</span>
          <h2>{live ? live.liveSignals.length + " engine signals currently feed this decision view." : "No live signal lineage is available."}</h2>
        </div>
        <div className={styles.navActions}>
          <Link className={styles.textLink} href="/demo">Back to guided demo</Link>
          <Link className={styles.button} href="/impact">Open Impact Model</Link>
        </div>
      </section>
    </main>
  );
}
