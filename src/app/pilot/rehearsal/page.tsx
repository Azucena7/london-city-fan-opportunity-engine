import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { crmTicketingDemo } from "@/lib/data";
import { buildRepeatCohort, summariseCrmTicketing } from "@/lib/crmTicketingMetrics";
import styles from "./rehearsal.module.css";

export const metadata: Metadata = {
  title: "Pilot Rehearsal",
  description: "Synthetic end-to-end rehearsal of the Fan Growth Engine club-data path."
};

const sourceFixtureId = "2026-09-06-mun-h";
const targetFixtureId = "2026-09-26-bha-h";

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value);
}

export default function PilotRehearsalPage() {
  const currentRecords = crmTicketingDemo.records.filter((row) => row.fixture_id === targetFixtureId);
  const summary = summariseCrmTicketing(currentRecords);
  const cohort = buildRepeatCohort(crmTicketingDemo.records, sourceFixtureId, targetFixtureId);
  const repeatRate = cohort.sourceConsentedBuyers > 0
    ? cohort.alreadyPurchasedTarget / cohort.sourceConsentedBuyers
    : null;
  const scanBase = summary.scans + summary.noShows;
  const scanRate = scanBase > 0 ? summary.scans / scanBase : null;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="pilot" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Pilot rehearsal · synthetic data only</span>
          <h1>Prove the data path before a club shares real fan data.</h1>
          <p>
            This rehearsal exercises the same ticket-grain logic used by the pilot, but only with the repository&apos;s
            synthetic Brighton dataset. It proves the workflow, not a London City commercial outcome.
          </p>
        </div>
        <aside className={styles.truthCard}>
          <span>Evidence status</span>
          <strong>Synthetic rehearsal</strong>
          <p>No production claim. No causal claim. No supporter-level data is written into the live club-data slot.</p>
        </aside>
      </header>

      <section className={styles.flow} aria-label="Pilot rehearsal data flow">
        <article>
          <span>01 · INPUT</span>
          <strong>Ticket-grain records</strong>
          <p>Fixture, campaign, consent, paid value and scan state.</p>
        </article>
        <b>→</b>
        <article>
          <span>02 · MATCH</span>
          <strong>Repeat cohort</strong>
          <p>Pseudonymous matching is used only to calculate the cohort.</p>
        </article>
        <b>→</b>
        <article>
          <span>03 · AGGREGATE</span>
          <strong>Decision evidence</strong>
          <p>Only counts, rates and economics are needed by the product layer.</p>
        </article>
        <b>→</b>
        <article>
          <span>04 · INTERPRET</span>
          <strong>Descriptive result</strong>
          <p>Attribution is visible; incrementality remains unproven.</p>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>What the rehearsal produces</span>
          <h2>The same decision ingredients the live pilot will need.</h2>
        </div>
        <div className={styles.metrics}>
          <article>
            <span>Addressable repeat cohort</span>
            <strong>{cohort.addressableConsentedNonReturners}</strong>
            <p>Consented opener buyers who have not purchased Brighton.</p>
          </article>
          <article>
            <span>Campaign-attributed tickets</span>
            <strong>{summary.campaignAttributedTickets}</strong>
            <p>Descriptive attribution from the synthetic current-fixture records.</p>
          </article>
          <article>
            <span>Repeat purchase rate</span>
            <strong>{percent(repeatRate)}</strong>
            <p>Observed in the rehearsal cohort; not an incremental-lift estimate.</p>
          </article>
          <article>
            <span>Gross ticket revenue</span>
            <strong>{currency(summary.grossTicketRevenue)}</strong>
            <p>Synthetic realised ticket value.</p>
          </article>
          <article>
            <span>Scan rate</span>
            <strong>{percent(scanRate)}</strong>
            <p>Based on records with a decided scan state.</p>
          </article>
          <article>
            <span>Raw supporter rows stored</span>
            <strong>0</strong>
            <p>The production bridge persists aggregate evidence only.</p>
          </article>
        </div>
      </section>

      <section className={styles.guardrail}>
        <div>
          <span className={styles.eyebrow}>Interpretation</span>
          <h2>What this proves — and what it does not.</h2>
        </div>
        <div className={styles.guardrailGrid}>
          <article>
            <span>PROVES</span>
            <strong>Data contract and aggregation path</strong>
            <p>The workflow can turn ticket-grain input into repeat, attribution, revenue and attendance-quality evidence.</p>
          </article>
          <article>
            <span>PROVES</span>
            <strong>Privacy boundary</strong>
            <p>The product can work with aggregate club evidence without storing supporter-level records in the repository.</p>
          </article>
          <article>
            <span>DOES NOT PROVE</span>
            <strong>Incremental commercial impact</strong>
            <p>A real pilot still needs authorised club data and a pre-agreed counterfactual if the club wants a causal lift claim.</p>
          </article>
        </div>
      </section>

      <section className={styles.next}>
        <div>
          <span className={styles.eyebrow}>Next step</span>
          <h2>Replace the synthetic input, not the product workflow.</h2>
          <p>
            A pilot club supplies an authorised export outside the repository. The same aggregation contract then feeds
            Opportunity, Impact and Results with measured evidence.
          </p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/pilot/operating-pack">Open Pilot Operating Pack</Link>
          <Link className={styles.secondary} href="/results">See Results & Learning</Link>
        </div>
      </section>
    </main>
  );
}
