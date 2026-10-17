import Link from "next/link";
import styles from "./MarketingNav.module.css";

export function MarketingNav({ variant = "light" }: { variant?: "light" | "dark" | "board" }) {
  const tone = variant === "dark" ? styles.dark : variant === "board" ? `${styles.dark} ${styles.board}` : "";
  return (
    <nav className={`${styles.nav} ${tone}`} aria-label="AVELA marketing and commercial product navigation">
      <Link className={styles.brand} href="/">
        <span className={styles.mark} aria-hidden="true" />
        AVELA
      </Link>
      <div className={styles.links}>
        <Link href="/">Product</Link>
        <Link href="/pilot?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=desktop">Pilot</Link>
        <Link href="/case-study?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=proof&utm_content=desktop">Proof</Link>
        <Link href="/#faq">FAQ</Link>
      </div>
      <div className={styles.actions}>
        <Link className={styles.login} href="/app/demo?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=desktop">Open demo</Link>
        <Link className={styles.demo} href="/for-clubs?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=desktop#demo">Request pilot</Link>
      </div>
      <details className={styles.mobileMenu}>
        <summary>Menu</summary>
        <div className={styles.mobilePanel}>
          <Link href="/">Product</Link>
          <Link href="/pilot?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=mobile">Pilot</Link>
          <Link href="/case-study?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=proof&utm_content=mobile">Proof</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/app/demo?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=mobile">Open demo</Link>
          <Link href="/for-clubs?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=mobile#demo">Request pilot</Link>
        </div>
      </details>
    </nav>
  );
}
