import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import styles from "./opportunity.module.css";

export const metadata: Metadata = {
  title: "Opportunity Workspace",
  description: "One workspace for the current fixture opportunity: action, evidence, impact and next decision."
};

export default function OpportunityPage() {
  const live = getCurrentProductOpportunity();
  const blocked = (live?.blockers.length ?? 0) > 0;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="opportunity" />

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            {live ? "London City · " + live.fixture.opponent + " · " + live.fixture.date : "Current fixture"}
          </span>
          <h1>{live?.opportunity ?? "No current opportunity is available."}</h1>
          <p>{live?.whyNow ?? "Waiting for current engine evidence."}</p>
        </div>

        <aside className={styles.state}>
          <span>Opportunity state</span>
          <strong>{live?.opportunityLabel ?? "Under review"}</strong>
          <div className={styles.stateMeta}>
            <span className={blocked ? styles.blocked : styles.ready}>{live?.decisionState ?? "HOLD"}</span>
            <span className={styles.confidence}>{live?.confidence.label ?? "—"} confidence</span>
          </div>
        </aside>
      </header>

      <ProductDataStateLegend />

      <nav className={styles.localNav} aria-label="Opportunity workspace sections">
        <a href="#summary">Summary</a>
        <a href="#action">Action</a>
        <a href="#evidence">Evidence</a>
        <a href="#impact">Impact</a>
      </nav>

      <section className={styles.summary} id="summary">
        <article>
          <span>Opportunity</span>
          <strong>{live?.opportunityLabel ?? "Under review"}</strong>
          <p>{live?.score !== null && live?.score !== undefined ? "Model score " + live.score + "/100" : "Score unavailable"}</p>
        </article>
        <article>
          <span>Audience</span>
          <strong>{live?.audience.value ? live.audience.value.toLocaleString("en-GB") : "Not connected"}</strong>
          <p>{live?.audience.value ? live.audience.label : "CRM / ticketing required · we do not estimate this value"}</p>
        </article>
        <article>
          <span>Readiness</span>
          <strong>{live?.readiness.label ?? "—"}</strong>
          <p>{live?.primaryBlocker ?? "No blocker loaded"}</p>
        </article>
        <article>
          <span>Measurement</span>
          <strong>{live?.measurementEvidence.label ?? "Missing"}</strong>
          <p>{live?.measurementEvidence.detail ?? "No measurement state available."}</p>
        </article>
      </section>

      <section className={styles.actionSection} id="action">
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Action</span>
          <h2>What should the club do next?</h2>
        </div>

        <article className={styles.actionCard}>
          <div>
            <span>Recommended action</span>
            <h3>{live?.recommendedAction ?? "No current action."}</h3>
          </div>
          <div className={styles.actionMeta}>
            <div><span>Owner</span><strong>{live?.nextAction.owner ?? "Pending"}</strong></div>
            <div><span>Due</span><strong>{live?.nextAction.deadline ?? "Pending"}</strong></div>
            <div><span>Measure</span><strong>{live?.nextAction.measurement ?? "Pending"}</strong></div>
          </div>
        </article>
      </section>

      <section className={styles.evidenceSection} id="evidence">
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Evidence</span>
          <h2>What do we know, assume and still need?</h2>
        </div>

        <div className={styles.evidenceGrid}>
          <article>
            <div className={styles.evidenceHead}>
              <span className={styles.confirmed}>Confirmed</span>
              <strong>{live?.known.length ?? 0}</strong>
            </div>
            <ul>{(live?.known ?? []).slice(0,3).map((item)=><li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <div className={styles.evidenceHead}>
              <span className={styles.assumed}>Assumptions</span>
              <strong>{live?.assumptions.length ?? 0}</strong>
            </div>
            <ul>{(live?.assumptions ?? []).slice(0,3).map((item)=><li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <div className={styles.evidenceHead}>
              <span className={styles.missing}>Missing</span>
              <strong>{live?.missing.length ?? 0}</strong>
            </div>
            <ul>{(live?.missing ?? []).slice(0,3).map((item)=><li key={item}>{item}</li>)}</ul>
          </article>
        </div>

        <div className={styles.deepLinkRow}>
          <Link href="/decision-room">Open full Decision Room →</Link>
          <span>Review blockers, decision-change conditions and evidence lineage.</span>
        </div>
      </section>

      <Link className={styles.mobileAction} href="/decision-room">Review Decision →</Link>

      <section className={styles.impactSection} id="impact">
        <div>
          <span className={styles.eyebrow}>Impact</span>
          <h2>{live?.impact.ticketsLow !== null && live?.impact.ticketsLow !== undefined ? live.impact.ticketsLow + " ticket opportunity" : "Commercial impact still needs club data."}</h2>
          <p>The workspace does not invent an impact range when the addressable audience and conversion evidence are not connected.</p>
        </div>
        <div className={styles.impactActions}>
          <Link className={styles.primary} href="/impact">Open Impact Model</Link>
          <Link className={styles.secondary} href="/results">See Results & Learning</Link>
        </div>
      </section>
    </main>
  );
}
