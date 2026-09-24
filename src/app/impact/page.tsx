import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
import { ImpactScenario } from "@/components/ImpactScenario";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentImpactDefaults } from "@/lib/productImpactDefaults";
import styles from "./impact.module.css";

export const metadata: Metadata = {
  title: "Impact Scenario",
  description: "A transparent planning model for turning an addressable fan opportunity into a ticket and revenue scenario."
};

export default function ImpactPage() {
  const live = getCurrentProductOpportunity();
  const defaults = getCurrentImpactDefaults();
  const fixtureLabel = live ? "London City vs " + live.fixture.opponent : "Current opportunity unavailable";

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="impact" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Impact model · transparent assumptions</span>
          <h1>Translate a fan opportunity into a commercial scenario.</h1>
          <p>
            Club teams need more than an opportunity score. This layer shows the assumptions behind a potential ticket and revenue outcome
            before money or operational capacity is committed.
          </p>
        </div>
        <aside className={styles.principle}>
          <span>Product rule</span>
          <strong>Scenario ≠ forecast</strong>
          <p>The model makes assumptions editable and visible instead of presenting a precise-looking number without context.</p>
        </aside>
      </header>

      <ProductDataStateLegend />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Try the scenario</span>
          <h2>Change the inputs. See what drives the value case.</h2>
        </div>
        <ImpactScenario
          fixtureLabel={fixtureLabel}
          liveAudience={defaults.audience}
          liveAudienceState={defaults.audienceSource === "measured" ? "measured" : "requires-club-data"}
          observedConversionRate={defaults.conversionRate}
          observedConversionLabel={defaults.conversionLabel}
          observedTicketValue={defaults.ticketValue}
          observedTicketValueLabel={defaults.ticketValueLabel}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Live-club version</span>
          <h2>Each input should eventually be grounded in measured club data.</h2>
        </div>
        <div className={styles.evidenceGrid}>
          <article><span>Audience</span><strong>CRM + ticketing cohort</strong><p>How many eligible, contactable fans actually exist?</p></article>
          <article><span>Conversion</span><strong>Observed range</strong><p>What have similar audiences and offers converted at?</p></article>
          <article><span>Value</span><strong>Ticket economics</strong><p>What is the real average paid value, not the headline price?</p></article>
          <article><span>Cost</span><strong>Incremental activation cost</strong><p>What spend and operational effort are required to execute?</p></article>
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrow}>Decision connection</span>
          <h2>The value case should strengthen or weaken the live opportunity — not sit in a separate spreadsheet.</h2>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/opportunity">Back to Opportunity</Link>
          <Link className={styles.secondary} href="/pilot">See the 90-day pilot</Link>
        </div>
      </section>
    </main>
  );
}
