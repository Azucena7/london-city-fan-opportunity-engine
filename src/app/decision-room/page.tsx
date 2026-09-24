import type { Metadata } from "next";
import Link from "next/link";
import styles from "./decision-room.module.css";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
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
  const blocked = (live?.blockers.length ?? 0) > 0;
  const confidenceWidth = live?.confidence.label === "High" ? "88%" : live?.confidence.label === "Medium" ? "60%" : "32%";

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="decision" />

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            {live ? "London City · " + live.fixture.opponent : "London City"} · Decision
          </span>
          <h1>{live ? "Should the club act on this " + live.opportunityLabel.toLowerCase() + "?" : "No current decision is available."}</h1>
          <p>
            The recommendation stays conditional until the evidence, assumptions and missing inputs are explicit enough for a human decision owner to act.
          </p>
          <div className={styles.headerStatus}>
            <span className={blocked ? styles.holdChip : styles.readyChip}>{live?.decisionState ?? "HOLD"}</span>
            <span className={styles.confidenceChip}>{live?.confidence.label ?? "—"} confidence</span>
            <span className={styles.signalChip}>{live?.liveSignals.length ?? 0} signals</span>
          </div>
        </div>

        <aside className={styles.questionCard}>
          <span>Primary blocker</span>
          <strong>{live?.primaryBlocker ?? "Waiting for a current product opportunity."}</strong>
          <Link href="#next-action">Resolve next →</Link>
        </aside>
      </header>

      <ProductDataStateLegend />

      <section className={styles.summaryStrip}>
        <article>
          <span>Opportunity</span>
          <strong>{live?.opportunityLabel ?? "Under review"}</strong>
          <p>{live?.opportunity ?? "No current opportunity."}</p>
        </article>
        <article>
          <span>Confidence</span>
          <strong>{live?.confidence.label ?? "—"}</strong>
          <div className={styles.confidenceTrack}><span style={{ width: confidenceWidth }} /></div>
          <p>{live?.confidence.rationale ?? "No confidence rationale is available."}</p>
        </article>
        <article>
          <span>Measurement</span>
          <strong>{live?.measurementEvidence.label ?? "—"}</strong>
          <p>{live?.measurementEvidence.detail ?? "No measurement state available."}</p>
        </article>
        <article>
          <span>Impact</span>
          <strong>{live?.impact.ticketsLow !== null && live?.impact.ticketsLow !== undefined ? live.impact.ticketsLow + " tickets" : "Requires club data"}</strong>
          <p>No impact range is asserted until cohort size and conversion evidence are connected.</p>
        </article>
      </section>

      <section className={styles.decisionBody}>
        <div className={styles.evidenceColumn}>
          <div className={styles.sectionTitle}>
            <span>Why the recommendation exists</span>
            <h2>Evidence quality at a glance</h2>
          </div>

          <article className={styles.evidenceBlock}>
            <div className={styles.blockHead}>
              <span className={styles.evidenceTag}>CONFIRMED</span>
              <strong>{live?.known.length ?? 0}</strong>
            </div>
            <ItemList items={live?.known ?? []} empty="No confirmed evidence loaded." />
          </article>

          <article className={styles.evidenceBlock}>
            <div className={styles.blockHead}>
              <span className={styles.assumptionTag}>ASSUMPTIONS</span>
              <strong>{live?.assumptions.length ?? 0}</strong>
            </div>
            <ItemList items={live?.assumptions ?? []} empty="No assumptions loaded." />
          </article>

          <article className={styles.evidenceBlock}>
            <div className={styles.blockHead}>
              <span className={styles.missingTag}>MISSING</span>
              <strong>{live?.missing.length ?? 0}</strong>
            </div>
            <ItemList items={live?.missing ?? []} empty="No missing evidence loaded." />
          </article>
        </div>

        <aside className={styles.decisionColumn}>
          <div className={styles.sectionTitle}>
            <span>Decision control</span>
            <h2>What can stop or change this?</h2>
          </div>

          <article className={styles.blockerPanel}>
            <span>Current blockers</span>
            <ItemList items={live?.blockers ?? []} empty="No blocking approval gate is currently recorded." />
          </article>

          <article className={styles.changePanel}>
            <span>What would change the decision</span>
            <ItemList items={live?.whatWouldChangeDecision ?? []} empty="No decision-change conditions loaded." />
          </article>

          <article className={styles.lineagePanel}>
            <span>Evidence lineage</span>
            <strong>{live ? live.liveSignals.length + " live engine signals" : "No live lineage"}</strong>
            <p>{live?.updatedAt ? "Engine updated " + new Date(live.updatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" }) : "Update time unavailable"}</p>
            <Link href="/today">Inspect analyst view →</Link>
          </article>
        </aside>
      </section>

      <section className={styles.actionSection} id="next-action">
        <div className={styles.actionCopy}>
          <span className={styles.eyebrow}>Next required action</span>
          <h2>{live?.recommendedAction ?? "No current action is available."}</h2>
          <p>The decision cannot become ready until the primary blocker and measurement gap are resolved.</p>
        </div>
        <div className={styles.actionMeta}>
          <div><span>Owner</span><strong>{live?.nextAction.owner ?? "Pending"}</strong></div>
          <div><span>Due</span><strong>{live?.nextAction.deadline ?? "Pending"}</strong></div>
          <div><span>Measure</span><strong>{live?.nextAction.measurement ?? "Pending"}</strong></div>
        </div>
      </section>

      <section className={styles.footerRow}>
        <Link className={styles.textLink} href="/brief">← Back to Morning Brief</Link>
        <Link className={styles.button} href="/impact">Test commercial scenario →</Link>
      </section>
    </main>
  );
}
