import type { Metadata } from "next";
import Link from "next/link";
import styles from "./results.module.css";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";

export const metadata: Metadata = {
  title: "Results & Learning",
  description: "Close the loop after matchday: measure the action, capture the learning and update the next fixture decision."
};

export default function ResultsLearningPage() {
  return (
    <main className={styles.shell}>
      <ProductJourneyNav active="results" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Results & Learning · post-match loop</span>
          <h1>What happened after the recommendation?</h1>
          <p>
            The product should not stop at the action. It should show the result, explain what we learned
            and update the next decision with club-specific evidence.
          </p>
        </div>
        <aside className={styles.resultCard}>
          <span>Campaign outcome</span>
          <strong>Illustrative post-match example</strong>
          <p>Figures below demonstrate the product workflow only. They are replaced by measured club data in a live pilot.</p>
        </aside>
      </header>

      <section className={styles.kpis}>
        <article><span>Audience activated</span><strong>1,420</strong><p>Matched opener non-returners</p></article>
        <article><span>Tickets attributed</span><strong>386</strong><p>Illustrative measured outcome</p></article>
        <article><span>Repeat rate</span><strong>27%</strong><p>Among the activated cohort</p></article>
        <article><span>Revenue</span><strong>£5,790</strong><p>Illustrative ticket revenue</p></article>
      </section>

      <section className={styles.loop}>
        <article className={styles.loopBlock}>
          <span>01 · ORIGINAL HYPOTHESIS</span>
          <h2>Recent first-time attendees will respond better to a repeat-visit message than a cold audience.</h2>
          <p>We define the hypothesis before launch so the post-match result can actually teach us something.</p>
        </article>

        <div className={styles.arrow}>↓</div>

        <article className={styles.loopBlock}>
          <span>02 · OBSERVED RESULT</span>
          <h2>The repeat cohort converted strongly enough to justify keeping retention ahead of cold acquisition.</h2>
          <p>In a live deployment, this block would use actual ticketing attribution, cost and control-group data.</p>
        </article>

        <div className={styles.arrow}>↓</div>

        <article className={styles.learning}>
          <span>03 · CLUB LEARNING</span>
          <h2>Repeat-attendance propensity is now evidence, not only an assumption.</h2>
          <div className={styles.learningGrid}>
            <div><small>Before</small><strong>Hypothesis</strong></div>
            <div><small>After</small><strong>Measured signal</strong></div>
            <div><small>Confidence</small><strong>Medium → High</strong></div>
          </div>
        </article>

        <div className={styles.arrow}>↓</div>

        <article className={styles.nextDecision}>
          <span>04 · APPLY TO NEXT FIXTURE</span>
          <h2>Prioritise the repeat-attendance cohort earlier in the next home-fixture cycle.</h2>
          <p>The result becomes an input to the next opportunity score, audience priority and channel plan.</p>
        </article>
      </section>

      <section className={styles.compare}>
        <div>
          <span className={styles.eyebrow}>Why this matters</span>
          <h2>Most dashboards report. This loop is designed to improve the next decision.</h2>
        </div>
        <div className={styles.compareGrid}>
          <article><span>Traditional reporting</span><strong>What happened?</strong></article>
          <article><span>Fan Growth Engine</span><strong>What did we learn, and what changes next?</strong></article>
        </div>
      </section>

      <section className={styles.footerCard}>
        <div>
          <span className={styles.eyebrow}>Closed loop</span>
          <h2>Discover → Act → Measure → Learn → Decide again.</h2>
        </div>
        <Link className={styles.button} href="/pilot">See the 90-day pilot</Link>
      </section>
    </main>
  );
}
