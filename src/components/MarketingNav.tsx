import Link from "next/link";
import styles from "./MarketingNav.module.css";

export function MarketingNav() {
  return (
    <nav className={styles.nav} aria-label="Product website navigation">
      <Link className={styles.brand} href="/">
        <span className={styles.mark} aria-hidden="true" />
        Fan Growth Engine
      </Link>
      <div className={styles.links}>
        <Link href="/#how-it-works">Product</Link>
        <Link href="/live/london-city">London City live</Link>
        <Link href="/for-clubs">For clubs</Link>
      </div>
      <Link className={styles.app} href="/app/matches">Open club app</Link>
    </nav>
  );
}
