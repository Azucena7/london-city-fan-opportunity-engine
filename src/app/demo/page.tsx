import type { Metadata } from "next";
import Link from "next/link";
import styles from "./demo.module.css";

export const metadata: Metadata = {
  title: "London City Guided Demo",
  description: "A guided walkthrough of how Fan Growth Engine turns a fixture opportunity into an action and measurement plan."
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
    body: "Decision conditions and blockers show whether the club can act now or whether one missing piece of evidence still matters."
  },
  {
    number: "05",
    label: "LEARN",
    title: "Close the loop",
    body: "After matchday, the result is compared with the original hypothesis so the next fixture starts with better club-specific knowledge."
  }
];

export default function GuidedDemoPage() {
  return (
    <main className={styles.shell}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/">Fan Growth Engine</Link>
        <div className={styles.navActions}>
          <Link className={styles.textLink} href="/today">Open full engine</Link>
          <Link className={styles.button} href="/">Product home</Link>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>London City · guided product demo</span>
          <h1>From one fixture opportunity to one clear club action.</h1>
          <p>
            This walkthrough shows the product experience we are building for football clubs:
            simple enough for a commercial director to understand quickly, with the underlying evidence available when needed.
          </p>
        </div>

        <aside className={styles.summaryCard}>
          <div className={styles.cardTop}>
            <span>London City vs Brighton</span>
            <span className={styles.demoTag}>Illustrative demo</span>
          </div>
          <p className={styles.cardLabel}>Priority opportunity</p>
          <h2>Convert first-time attendees into repeat visitors.</h2>
          <div className={styles.metrics}>
            <div><span>Addressable audience</span><strong>1,420</strong></div>
            <div><span>Potential</span><strong>+280–420 tickets</strong></div>
            <div><span>Confidence</span><strong>Medium</strong></div>
          </div>
          <p className={styles.disclaimer}>
            Audience and impact figures are illustrative until club CRM and ticketing data are connected.
          </p>
        </aside>
      </header>

      <section className={styles.decisionStrip} aria-label="Opportunity action impact summary">
        <article className={styles.decisionBlock}>
          <span>OPPORTUNITY</span>
          <strong>Retain opener attendees before Brighton.</strong>
          <p>Prioritise the repeat-attendance window created by the opening fixture.</p>
        </article>
        <div className={styles.decisionArrow} aria-hidden="true">→</div>
        <article className={styles.decisionBlock}>
          <span>ACTION</span>
          <strong>Build the non-returner cohort and activate CRM.</strong>
          <p>Audience, owner, timing and measurement are defined before execution.</p>
        </article>
        <div className={styles.decisionArrow} aria-hidden="true">→</div>
        <article className={styles.decisionBlock}>
          <span>IMPACT</span>
          <strong>+280–420 tickets</strong>
          <p>Illustrative potential only — replaced by a club-specific model when live data is connected.</p>
        </article>
      </section>

      <section className={styles.readinessBar}>
        <div>
          <span>Decision confidence</span>
          <strong>Medium</strong>
        </div>
        <div>
          <span>Readiness</span>
          <strong>2 of 3 gates ready</strong>
        </div>
        <div>
          <span>Primary blocker</span>
          <strong>CRM cohort not yet matched to Brighton buyers</strong>
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
                    <strong>Repeat attendance before the next home fixture</strong>
                  </div>
                  <div>
                    <span>Why now</span>
                    <strong>A high-attention opener creates a time-sensitive retention window.</strong>
                  </div>
                </div>
              ) : null}

              {step.number === "02" ? (
                <div className={styles.evidenceGrid}>
                  <div className={styles.evidenceGood}><span>KNOWN</span><strong>Fixture, venue and current campaign context</strong></div>
                  <div className={styles.evidenceWarn}><span>ASSUMED</span><strong>First-time visitors are contactable and have not repurchased</strong></div>
                  <div className={styles.evidenceNeutral}><span>MISSING</span><strong>CRM cohort size and matched Brighton purchase status</strong></div>
                </div>
              ) : null}

              {step.number === "03" ? (
                <div className={styles.actionCard}>
                  <span>Recommended action</span>
                  <h3>Build the opener non-returner cohort and launch a repeat-visit CRM campaign.</h3>
                  <div className={styles.actionMeta}>
                    <div><small>Owner</small><strong>CRM / Marketing</strong></div>
                    <div><small>Deadline</small><strong>Thursday</strong></div>
                    <div><small>Measure</small><strong>Matched ticket sales</strong></div>
                  </div>
                </div>
              ) : null}

              {step.number === "04" ? (
                <div className={styles.decisionCard}>
                  <div className={styles.decisionStatus}>GO WITH CONDITIONS</div>
                  <ul>
                    <li><strong>Ready:</strong> ticket inventory and campaign concept</li>
                    <li><strong>Blocker:</strong> audience must be matched against existing Brighton buyers</li>
                    <li><strong>Would change the decision:</strong> if organic repeat purchase is already above the target threshold</li>
                  </ul>
                </div>
              ) : null}

              {step.number === "05" ? (
                <div className={styles.learningCard}>
                  <div><span>Result</span><strong>Measure conversion, revenue and repeat rate</strong></div>
                  <div className={styles.arrow}>→</div>
                  <div><span>Learning</span><strong>Update the next fixture recommendation</strong></div>
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
          <p>The existing London City engine remains available with signals, territories, fixtures, evidence and operational detail.</p>
        </div>
        <Link className={styles.button} href="/today">Open full London City engine</Link>
      </section>
    </main>
  );
}
