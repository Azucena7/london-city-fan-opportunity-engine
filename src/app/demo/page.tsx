import type { Metadata } from "next";
import Link from "next/link";
import styles from "./demo.module.css";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "London City Guided Demo",
  description: "A guided walkthrough of how Fan Growth Engine turns a live fixture opportunity into an action and measurement plan."
};

const steps = [
  {
    number: "01",
    label: "DISCOVER",
    title: "Find the opportunity",
    body: "The engine connects fixture context, fan behaviour, territory and market signals to surface the decision that deserves attention now."
  },
  {
    number: "02",
    label: "UNDERSTAND",
    title: "See why it matters",
    body: "Evidence is separated from assumptions, so the club can see what is known, what is inferred and what still needs checking."
  },
  {
    number: "03",
    label: "ACT",
    title: "Turn it into a plan",
    body: "The recommendation becomes an audience, channel, owner, deadline and measurement plan — not another insight waiting in a dashboard."
  },
  {
    number: "04",
    label: "DECIDE",
    title: "Know what could block it",
    body: "Decision conditions and blockers show whether the club can act now or whether missing evidence still matters."
  },
  {
    number: "05",
    label: "LEARN",
    title: "Close the loop",
    body: "After matchday, the result is compared with the original hypothesis so the next fixture starts with better club-specific knowledge."
  }
];

export default function GuidedDemoPage() {
  const live = getCurrentProductOpportunity();

  return (
    <main className={styles.shell}>
      <ProductJourneyNav active="demo" />

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>London City · live guided product demo</span>
          <h1>From one fixture opportunity to one clear club action.</h1>
          <p>
            The visible opportunity below is now derived from the same fixture, campaign and signal data used by the full engine.
            Missing CRM and ticketing evidence stays visibly missing rather than being replaced with demo precision.
          </p>
        </div>

        <aside className={styles.summaryCard}>
          <div className={styles.cardTop}>
            <span>{live ? "London City vs " + live.fixture.opponent : "London City"}</span>
            <span className={styles.demoTag}>{live ? "Live engine data" : "Demo unavailable"}</span>
          </div>
          <p className={styles.cardLabel}>Priority opportunity</p>
          <h2>{live?.opportunity ?? "No current product opportunity is available."}</h2>
          <div className={styles.metrics}>
            <div><span>Addressable audience</span><strong>{live?.audience.value ? live.audience.value.toLocaleString("en-GB") : "Requires club data"}</strong></div>
            <div><span>Opportunity score</span><strong>{live?.score !== null && live?.score !== undefined ? live.score + "/100" : "—"}</strong></div>
            <div><span>Confidence</span><strong>{live?.confidence.label ?? "—"}</strong></div>
          </div>
          <p className={styles.disclaimer}>
            Live public and engine signals are used where available. CRM cohort size and ticket impact remain unfilled until authorised club data is connected.
          </p>
        </aside>
      </header>

      <section className={styles.decisionStrip} aria-label="Opportunity action impact summary">
        <article className={styles.decisionBlock}>
          <span>OPPORTUNITY</span>
          <strong>{live?.opportunityLabel ?? "Opportunity under review"}</strong>
          <p>{live?.whyNow ?? "Waiting for a current engine opportunity."}</p>
        </article>
        <div className={styles.decisionArrow} aria-hidden="true">→</div>
        <article className={styles.decisionBlock}>
          <span>ACTION</span>
          <strong>{live?.recommendedAction ?? "Define the next action from current evidence."}</strong>
          <p>{live ? live.nextAction.owner + " · " + live.nextAction.deadline : "Owner and timing pending"}</p>
        </article>
        <div className={styles.decisionArrow} aria-hidden="true">→</div>
        <article className={styles.decisionBlock}>
          <span>IMPACT</span>
          <strong>{live?.impact.ticketsLow !== null && live?.impact.ticketsLow !== undefined ? live.impact.ticketsLow + " tickets" : "Requires club data"}</strong>
          <p>No ticket-impact range is asserted until the audience and conversion evidence are connected.</p>
        </article>
      </section>

      <section className={styles.readinessBar}>
        <div>
          <span>Decision confidence</span>
          <strong>{live?.confidence.label ?? "—"}</strong>
        </div>
        <div>
          <span>Readiness</span>
          <strong>{live?.readiness.label ?? "—"}</strong>
        </div>
        <div>
          <span>Primary blocker</span>
          <strong>{live?.primaryBlocker ?? "No live blocker available"}</strong>
        </div>
      </section>

      <section className={styles.story}>
        {steps.map((step, index) => (
          <article className={styles.step} key={step.number}>
            <div className={styles.stepRail}>
              <span>{step.number}</span>
              {index < steps.length - 1 ? <i aria-hidden="true" /> : null}
            </div>
            <div className={styles.stepBody}>
              <span className={styles.stepLabel}>{step.label}</span>
              <h2>{step.title}</h2>
              <p>{step.body}</p>

              {step.number === "01" ? (
                <div className={styles.productMoment}>
                  <div>
                    <span>Opportunity</span>
                    <strong>{live?.opportunity ?? "Waiting for current engine data"}</strong>
                  </div>
                  <div>
                    <span>Why now</span>
                    <strong>{live?.whyNow ?? "Waiting for current engine data"}</strong>
                  </div>
                </div>
              ) : null}

              {step.number === "02" ? (
                <div className={styles.evidenceGrid}>
                  <div className={styles.evidenceGood}><span>KNOWN</span><strong>{live?.known[0] ?? "No confirmed evidence loaded"}</strong></div>
                  <div className={styles.evidenceWarn}><span>ASSUMED</span><strong>{live?.assumptions[0] ?? "No assumptions loaded"}</strong></div>
                  <div className={styles.evidenceNeutral}><span>MISSING</span><strong>{live?.missing[0] ?? "No missing evidence loaded"}</strong></div>
                </div>
              ) : null}

              {step.number === "03" ? (
                <div className={styles.actionCard}>
                  <span>Recommended action</span>
                  <h3>{live?.recommendedAction ?? "No current action is available."}</h3>
                  <div className={styles.actionMeta}>
                    <div><small>Owner</small><strong>{live?.nextAction.owner ?? "Pending"}</strong></div>
                    <div><small>Deadline</small><strong>{live?.nextAction.deadline ?? "Pending"}</strong></div>
                    <div><small>Measure</small><strong>{live?.nextAction.measurement ?? "Pending"}</strong></div>
                  </div>
                </div>
              ) : null}

              {step.number === "04" ? (
                <div className={styles.decisionCard}>
                  <div className={styles.decisionStatus}>{live?.decisionState ?? "HOLD"}</div>
                  <ul>
                    <li><strong>Readiness:</strong> {live?.readiness.label ?? "Not available"}</li>
                    <li><strong>Blocker:</strong> {live?.primaryBlocker ?? "Not available"}</li>
                    <li><strong>Would change the decision:</strong> {live?.whatWouldChangeDecision[0] ?? "Not available"}</li>
                  </ul>
                  <Link className={styles.decisionLink} href="/opportunity">Open Opportunity workspace →</Link>
                </div>
              ) : null}

              {step.number === "05" ? (
                <div className={styles.learningCard}>
                  <div><span>Result</span><strong>Measure conversion, revenue and repeat rate after matchday</strong></div>
                  <div className={styles.arrow}>→</div>
                  <div><span>Learning</span><strong>Update the next fixture recommendation with measured evidence</strong></div>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className={styles.next}>
        <div>
          <span className={styles.eyebrow}>Under the hood</span>
          <h2>Want to see the full intelligence layer?</h2>
          <p>The London City engine remains available with signals, territories, fixtures, evidence and operational detail.</p>
        </div>
        <Link className={styles.button} href="/today">Open Analyst view</Link>
      </section>
    </main>
  );
}
