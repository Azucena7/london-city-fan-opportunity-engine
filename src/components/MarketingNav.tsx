import Link from "next/link";
import styles from "./MarketingNav.module.css";

export function MarketingNav() {
  return (
    <nav className={styles.nav} aria-label="Product website navigation">
      <Link className={styles.brand} href="/">
        <span className={styles.mark} aria-hidden="true" />
        AVELA
      </Link>
      <div className={styles.links}>
        <Link href="/#how-it-works">Product</Link>
        <Link href="/live/london-city">London City demo</Link>
        <Link href="/#pricing">Pricing</Link>
      </div>
      <div className={styles.actions}>
        <Link className={styles.login} href="/app/demo">Try product</Link>
        <Link className={styles.demo} href="/for-clubs#demo">90-day pilot</Link>
      </div>
    </nav>
  );
}
