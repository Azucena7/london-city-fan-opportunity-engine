import Link from "next/link";
import styles from "./MarketingFooter.module.css";

export function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerColumns}>
        <p><strong>Product</strong> The Opportunity Engine for football club marketing & commercial teams.</p>
        <p><strong>Proof</strong> London City Live is an independent public case study.</p>
        <nav aria-label="Footer">
          <Link href="/for-clubs">For clubs</Link>
          <Link href="/pilot">Pilot</Link>
          <Link href="/case-study">Case study</Link>
          <Link href="/app/demo">Guided demo</Link>
        </nav>
      </div>
      <p className={styles.wordmark} aria-hidden="true">AVELA</p>
    </footer>
  );
}
