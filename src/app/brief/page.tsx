import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { currentState } from "@/lib/data";
import styles from "./brief.module.css";

export const metadata: Metadata = {
  title: "Club Morning Brief",
  description: "A concise daily decision brief for the next home fixture."
};

export default function BriefPage() {
  const live = getCurrentProductOpportunity();
  const publicChanges = Number(currentState.public_signal_changes ?? 0);
  const sourceFailures = Array.isArray(currentState.source_failures) ? currentState.source_failures.length : 0;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="brief" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Club Morning Brief</span>
          <h1>What needs attention before the next home fixture?</h1>
          <p>
            A decision-first view for commercial, ticketing and marketing leads. The brief shows only what changed,
            what is blocked and what action deserves attention now.
          </p>
          <div className={styles.statusLine}>
            <span className={styles.liveChip}>Live engine</span>
            <span className={live?.blockers.length ? styles.dangerChip : styles.liveChip}>{live?.blockers.length ?? 0} blockers</span>
            <span className={styles.warningChip}>{live?.confidence.label ?? "—"} confidence</span>
          </div>
        </div>
        <aside className={styles.fixtureCard}>
          <span>Next home fixture</span>
          <strong>{live ? "London City vs " + live.fixture.opponent : "No current fixture"}</strong>
          <p>{live ? live.fixture.date + (live.fixture.kickoff ? " · " + live.fixture.kickoff : "") : "Waiting for engine data"}</p>
        </aside>
      </header>

      <section className={styles.alerts}>
        <article>
          <span>Priority opportunity</span>
          <strong>{live ? "1" : "0"}</strong>
          <p>{live?.opportunityLabel ?? "No opportunity loaded"}</p>
        </article>
        <article>
          <span>Decision blockers</span>
          <strong>{live?.blockers.length ?? 0}</strong>
          <p>{live?.primaryBlocker ?? "No blocker loaded"}</p>
        </article>
        <article>
          <span>Public signal changes</span>
          <strong>{publicChanges}</strong>
          <p>Changes since the latest public-signal refresh.</p>
        </article>
        <article>
          <span>Source issues</span>
          <strong>{sourceFailures}</strong>
          <p>{sourceFailures ? "One or more sources need attention." : "No source failures recorded."}</p>
        </article>
      </section>

      <section className={styles.focus}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Today&apos;s decision</span>
          <h2>{live?.opportunity ?? "No current opportunity is available."}</h2>
        </div>

        <div className={styles.decisionGrid}>
          <article>
            <span>Why now</span>
            <strong>{live?.whyNow ?? "Waiting for live engine data."}</strong>
          </article>
          <article>
            <span>Recommended action</span>
            <strong>{live?.recommendedAction ?? "No current action."}</strong>
          </article>
          <article>
            <span>Confidence</span>
            <strong>{live?.confidence.label ?? "—"}</strong>
            <div className={styles.confidenceLine}>
              <div className={styles.confidenceTrack}><span /></div>
              <small>{live?.liveSignals.length ?? 0} signals</small>
            </div>
            <p>{live?.confidence.rationale ?? ""}</p>
          </article>
          <article>
            <span>Readiness</span>
            <strong>{live?.readiness.label ?? "—"}</strong>
            <p>{live?.decisionState ?? "HOLD"}</p>
          </article>
        </div>
      </section>

      <section className={styles.doNext}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Do next</span>
          <h2>Turn the decision gap into explicit work.</h2>
        </div>
        <div className={styles.actions}>
          <article className={styles.primaryAction}>
            <span>01 · Highest priority</span>
            <h3>{live?.nextAction.label ?? "Review current evidence."}</h3>
            <div className={styles.meta}>
              <div><small>Owner</small><strong>{live?.nextAction.owner ?? "Pending"}</strong></div>
              <div><small>Due</small><strong>{live?.nextAction.deadline ?? "Pending"}</strong></div>
              <div><small>Measure</small><strong>{live?.nextAction.measurement ?? "Pending"}</strong></div>
            </div>
          </article>

          <article className={styles.secondaryAction}>
            <span>02 · Strategic recommendation</span>
            <h3>{live?.recommendedAction ?? "No strategic recommendation is available."}</h3>
            <Link href="/opportunity">Open Opportunity →</Link>
          </article>

          <article className={styles.secondaryAction}>
            <span>03 · Value case</span>
            <h3>Test the commercial scenario once the audience input is available.</h3>
            <Link href="/impact">Open Impact Model →</Link>
          </article>
        </div>
      </section>

      <Link className={styles.mobileAction} href="/opportunity">Open Opportunity →</Link>

      <section className={styles.evidence}>
        <div>
          <span className={styles.eyebrow}>Evidence freshness</span>
          <h2>{live?.updatedAt ? "Engine refreshed " + new Date(live.updatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" }) : "Refresh time unavailable"}</h2>
          <p>{live ? live.liveSignals.length + " current signals feed the product opportunity." : "No live signal lineage is available."}</p>
        </div>
        <Link className={styles.button} href="/today">Open Analyst view</Link>
      </section>
    </main>
  );
}
