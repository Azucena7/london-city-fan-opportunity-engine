import type { Metadata } from "next";
import Link from "next/link";
import styles from "./results.module.css";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "Results & Learning",
  description: "Close the loop after matchday: measure the action, capture the learning and update the next fixture decision."
};

export default function ResultsLearningPage() {
  const live = getCurrentProductOpportunity();

  return (
    <main className={styles.shell}>
      <ProductJourneyNav active="results" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Results & Learning</span>
          <h1>What did the action actually change?</h1>
          <p>
            Results are only useful when they change the next decision. This view separates measured outcomes from
            examples and keeps the learning loop visible.
          </p>
        </div>
        <aside className={styles.stateCard}>
          <span>Current measurement state</span>
          <strong>Awaiting club conversion data</strong>
          <p>{live?.nextAction.measurement ?? "Matched ticket conversion is not connected yet."}</p>
        </aside>
      </header>

      <section className={styles.kpis}>
        <article>
          <span>Audience activated</span>
          <strong>—</strong>
          <p>Requires campaign audience export.</p>
        </article>
        <article>
          <span>Tickets attributed</span>
          <strong>—</strong>
          <p>Requires matched purchase attribution.</p>
        </article>
        <article>
          <span>Repeat rate</span>
          <strong>—</strong>
          <p>Requires cohort-level outcome data.</p>
        </article>
        <article>
          <span>Revenue</span>
          <strong>—</strong>
          <p>Requires attributed ticket value.</p>
        </article>
      </section>

      <section className={styles.learningLoop}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Learning loop</span>
          <h2>From hypothesis to the next fixture decision.</h2>
        </div>

        <div className={styles.timeline}>
          <article>
            <span>01 · HYPOTHESIS</span>
            <strong>Repeat opener attendees are more valuable to activate than a cold audience.</strong>
            <p>Defined before execution.</p>
          </article>
          <article>
            <span>02 · MEASURE</span>
            <strong>Match audience → campaign → purchase → scan → repeat.</strong>
            <p>Blocked until club CRM/ticketing data is connected.</p>
          </article>
          <article>
            <span>03 · LEARN</span>
            <strong>Promote the hypothesis only when the result supports it.</strong>
            <p>No confidence uplift without evidence.</p>
          </article>
          <article>
            <span>04 · APPLY</span>
            <strong>Change the next fixture audience, timing or investment decision.</strong>
            <p>The learning must affect a real choice.</p>
          </article>
        </div>
      </section>

      <section className={styles.resultState}>
        <div>
          <span className={styles.eyebrow}>What happens when data arrives</span>
          <h2>Measured results replace placeholders automatically.</h2>
          <p>
            The product should never present illustrative outcomes as if they happened. Until attribution exists,
            the honest result state is “not measured yet”.
          </p>
        </div>
        <div className={styles.stateList}>
          <div><span>Current</span><strong>Hypothesis</strong></div>
          <div><span>After measurement</span><strong>Observed signal</strong></div>
          <div><span>Decision effect</span><strong>Confidence changes only if supported</strong></div>
        </div>
      </section>

      <section className={styles.next}>
        <div>
          <span className={styles.eyebrow}>Close the loop</span>
          <h2>Results should send the user back to the next opportunity, not to a report archive.</h2>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/brief">Back to Morning Brief</Link>
          <Link className={styles.secondary} href="/today">Inspect measurement layer</Link>
        </div>
      </section>
    </main>
  );
}
