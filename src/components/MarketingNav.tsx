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
        <Link href="/live/london-city?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=live_case&utm_content=desktop">Live case</Link>
        <Link href="/#faq">FAQ</Link>
      </div>
      <div className={styles.actions}>
        <Link className={styles.login} href="/app/demo?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=desktop">Open workspace</Link>
        <Link className={styles.demo} href="/for-clubs?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=desktop#demo">Request pilot</Link>
      </div>
      <details className={styles.mobileMenu}>
        <summary>Menu</summary>
        <div className={styles.mobilePanel}>
          <Link href="/#integrations">How it fits</Link>
          <Link href="/live/london-city?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=live_case&utm_content=mobile">Live case</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/app/demo?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=mobile">Open workspace</Link>
          <Link href="/for-clubs?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=mobile#demo">Request pilot</Link>
        </div>
      </details>
    </nav>
  );
}
