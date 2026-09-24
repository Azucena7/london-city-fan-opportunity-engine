import type { Metadata } from "next";
import Link from "next/link";
import styles from "./results.module.css";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";

export const metadata: Metadata = {
  title: "Results & Learning",
  description: "Close the loop after matchday: measure the action, capture the learning and update the next fixture decision."
};

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function currency(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value);
}

export default function ResultsLearningPage() {
  const live = getCurrentProductOpportunity();
  const results = getCurrentProductResults();
  const measured = results?.state === "measured";

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="results" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Results & Learning</span>
          <h1>{live?.fixturePhase === "pre-match" ? "Measurement starts after matchday." : "What did the action actually change?"}</h1>
          <p>
            {live?.fixturePhase === "pre-match"
              ? "The fixture is still ahead. This screen keeps the measurement plan explicit now, then switches to observed outcomes when authorised post-match evidence arrives."
              : "Results are only useful when they change the next decision. This view separates measured outcomes from assumptions and keeps the learning loop visible."}
          </p>
        </div>
        <aside className={styles.stateCard}>
          <span>{live?.timingLabel ?? "Measurement"} · Current measurement state</span>
          <strong>{measured ? "Club ticketing data connected" : live?.fixturePhase === "pre-match" ? "Pre-match · outcome not available yet" : "Awaiting club conversion data"}</strong>
          <p>
            {measured
              ? `Measured export for ${live?.fixture.opponent ?? "the current fixture"}${results?.extractedAt ? ` · extracted ${new Date(results.extractedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}` : ""}.`
              : live?.nextAction.measurement ?? "Matched ticket conversion is not connected yet."}
          </p>
        </aside>
      </header>

      <ProductDataStateLegend />

      <section className={styles.kpis}>
        <article>
          <span>Addressable repeat cohort</span>
          <strong>{results?.addressableRepeatCohort?.toLocaleString("en-GB") ?? "—"}</strong>
          <p>{measured ? "Consented previous-home buyers who have not purchased this fixture." : "Requires matched club CRM/ticketing data."}</p>
        </article>
        <article>
          <span>Campaign-attributed tickets</span>
          <strong>{results?.campaignAttributedTickets?.toLocaleString("en-GB") ?? "—"}</strong>
          <p>{measured ? "Tickets with a campaign id in the authorised export." : "Requires matched purchase attribution."}</p>
        </article>
        <article>
          <span>Repeat purchase rate</span>
          <strong>{percent(results?.repeatPurchaseRate ?? null)}</strong>
          <p>{measured ? "Share of consented previous-home buyers who purchased the current fixture." : "Requires a multi-fixture supporter cohort."}</p>
        </article>
        <article>
          <span>Ticket revenue</span>
          <strong>{currency(results?.grossTicketRevenue ?? null)}</strong>
          <p>{measured ? `Scan rate ${percent(results?.scanRate ?? null)} · no-show ${percent(results?.noShowRate ?? null)}` : "Requires realised ticket value and scan status."}</p>
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
            <strong>Repeat recent attendees are more valuable to activate than a cold audience.</strong>
            <p>Defined before execution.</p>
          </article>
          <article>
            <span>02 · MEASURE</span>
            <strong>Match audience → campaign → purchase → scan → repeat.</strong>
            <p>{measured ? "Current fixture purchase and scan evidence is connected." : "Blocked until club CRM/ticketing data is connected."}</p>
          </article>
          <article>
            <span>03 · LEARN</span>
            <strong>{measured ? "Use measured repeat, attribution and attendance quality to test the hypothesis." : "Promote the hypothesis only when the result supports it."}</strong>
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
          <span className={styles.eyebrow}>{measured ? "Measured state" : "What happens when data arrives"}</span>
          <h2>{measured ? "The product has moved from hypothesis to observed outcome." : "Measured results replace placeholders automatically."}</h2>
          <p>
            {measured
              ? "The values above come from the authorised club CRM/ticketing slot. They can now strengthen, weaken or redirect the next fixture decision."
              : "The product never presents illustrative outcomes as if they happened. Until attribution exists, the honest result state is “not measured yet”."}
          </p>
        </div>
        <div className={styles.stateList}>
          <div><span>Current</span><strong>{measured ? "Observed result" : "Hypothesis"}</strong></div>
          <div><span>Evidence state</span><strong>{measured ? "Live club data" : "Missing club data"}</strong></div>
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
