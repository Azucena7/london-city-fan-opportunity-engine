import Link from "next/link";
import styles from "./MarketingNav.module.css";

export function MarketingNav() {
  return (
    <nav className={styles.nav} aria-label="AVELA marketing and commercial product navigation">
      <Link className={styles.brand} href="/">
        <span className={styles.mark} aria-hidden="true" />
        AVELA
      </Link>
      <div className={styles.links}>
        <Link href="/#integrations">How it fits</Link>
        <Link href="/live/london-city">Live case</Link>
        <Link href="/#faq">FAQ</Link>
      </div>
      <div className={styles.actions}>
        <Link className={styles.login} href="/app/demo">Open workspace</Link>
        <Link className={styles.demo} href="/for-clubs#demo">Club pilot</Link>
      </div>
    </nav>
  );
}
