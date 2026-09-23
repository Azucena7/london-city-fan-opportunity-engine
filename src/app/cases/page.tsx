import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getFeaturedProductCases } from "@/lib/productCases";
import styles from "./cases.module.css";

export const metadata: Metadata = {
  title: "Opportunity Cases",
  description: "Three different fixture decisions showing how Fan Growth Engine adapts to different commercial contexts."
};

const typeLabels = {
  repeat: "Repeat attendance",
  acquisition: "Acquisition",
  "defend-core": "Defend core",
  yield: "Yield",
  other: "Other"
} as const;

export default function CasesPage() {
  const cases = getFeaturedProductCases();

  return (
    <main className={styles.shell}>
      <ProductJourneyNav active="cases" />

      <header className={styles.hero}>
        <span className={styles.eyebrow}>Opportunity case library</span>
        <h1>The same engine should make different decisions for different fixtures.</h1>
        <p>
          A credible club product cannot be one Brighton story hard-coded three ways. These cases are derived from the fixture planning model,
          with live campaign evidence clearly distinguished from planning-only cases.
        </p>
      </header>

      <section className={styles.grid}>
        {cases.map((item) => (
          <article className={styles.card} key={item.date + item.opponent}>
            <div className={styles.cardTop}>
              <span>{item.date}</span>
              <span className={item.evidenceState === "live-decision-case" ? styles.live : styles.model}>
                {item.evidenceState === "live-decision-case" ? "Live decision case" : "Planning model"}
              </span>
            </div>
            <h2>London City vs {item.opponent}</h2>
            <div className={styles.type}>{typeLabels[item.opportunityType]}</div>

            <div className={styles.scoreRow}>
              <div><span>Planning score</span><strong>{item.planningScore}/100</strong></div>
              <div><span>Decision mode</span><strong>{item.decision}</strong></div>
            </div>

            <div className={styles.detail}>
              <span>Product</span>
              <strong>{item.product}</strong>
            </div>
            <div className={styles.detail}>
              <span>Channel</span>
              <strong>{item.channel}</strong>
            </div>
            <div className={styles.detail}>
              <span>Message</span>
              <strong>{item.message}</strong>
            </div>
            <div className={styles.detail}>
              <span>Target territory</span>
              <strong>{item.territory}</strong>
            </div>

            {item.evidenceState === "live-decision-case" ? (
              <Link className={styles.primary} href="/decision-room">Open live Decision Room →</Link>
            ) : (
              <p className={styles.note}>This case has planning-model inputs only. It should not be presented as an evidence-complete recommendation.</p>
            )}
          </article>
        ))}
      </section>

      <section className={styles.compare}>
        <div>
          <span className={styles.eyebrow}>Why this matters</span>
          <h2>Growth is not always “attack harder”.</h2>
          <p>
            One fixture may justify retention, another selective acquisition, another protection of the core audience.
            The product should make those differences visible instead of forcing every match into the same marketing play.
          </p>
        </div>
        <Link className={styles.button} href="/brief">Open Morning Brief</Link>
      </section>
    </main>
  );
}
