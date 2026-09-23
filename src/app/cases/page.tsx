import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getFeaturedProductCases } from "@/lib/productCases";
import styles from "./cases.module.css";

export const metadata: Metadata = {
  title: "Opportunity Cases",
  description: "Three different fixture decisions showing how Fan Growth Engine adapts to different commercial contexts."
};

export default function CasesPage() {
  const cases = getFeaturedProductCases();

  return (
    <main className={styles.shell}>
      <ProductJourneyNav active="cases" />

      <header className={styles.hero}>
        <span className={styles.eyebrow}>Use cases</span>
        <h1>Different fixtures should produce different commercial decisions.</h1>
        <p>
          The engine should not recommend “push harder” every week. These cases show retention, core protection and acquisition contexts from the existing fixture planning model.
        </p>
      </header>

      <section className={styles.tableWrap}>
        <div className={styles.tableHead}>
          <span>Fixture</span>
          <span>Opportunity</span>
          <span>Mode</span>
          <span>Score</span>
          <span>Evidence</span>
        </div>

        {cases.map((item) => (
          <article className={styles.caseRow} key={item.date + item.opponent}>
            <div className={styles.fixture}>
              <small>{item.date}</small>
              <strong>{item.opponent}</strong>
            </div>
            <div className={styles.opportunity}>
              <strong>{item.opportunityType}</strong>
              <small>{item.product}</small>
            </div>
            <div><span className={styles.mode}>{item.decision}</span></div>
            <div className={styles.score}>{item.planningScore}<small>/100</small></div>
            <div>
              <span className={item.evidenceState === "live-decision-case" ? styles.live : styles.model}>
                {item.evidenceState === "live-decision-case" ? "Live decision case" : "Planning model"}
              </span>
            </div>

            <div className={styles.detailStrip}>
              <div><span>Channel</span><strong>{item.channel}</strong></div>
              <div><span>Message</span><strong>{item.message}</strong></div>
              <div><span>Territory</span><strong>{item.territory}</strong></div>
              <div className={styles.detailAction}>
                {item.evidenceState === "live-decision-case" ? (
                  <Link href="/opportunity">Open live opportunity →</Link>
                ) : (
                  <span>Planning case only</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.read}>
        <div>
          <span className={styles.eyebrow}>The product point</span>
          <h2>Growth is not always attack.</h2>
          <p>
            A high-opportunity derby may justify acquisition. A weaker fixture may need core protection. A post-opener fixture may favour retention.
            The user should see that difference before opening any detailed evidence.
          </p>
        </div>
        <div className={styles.legend}>
          <div><span className={styles.legendRepeat}>01</span><strong>Retain</strong><small>Convert recent attendees again</small></div>
          <div><span className={styles.legendDefend}>02</span><strong>Defend</strong><small>Protect utilisation of the core</small></div>
          <div><span className={styles.legendAcquire}>03</span><strong>Acquire</strong><small>Use fixture appeal to grow reach</small></div>
        </div>
      </section>

      <section className={styles.footerRow}>
        <Link className={styles.textLink} href="/brief">← Morning Brief</Link>
        <Link className={styles.button} href="/opportunity">Open current Opportunity →</Link>
      </section>
    </main>
  );
}
