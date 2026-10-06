import Link from "next/link";
import styles from "./matchday-state.module.css";

export default function MatchdayNotFound() {
  return (
    <main className={styles.shell}>
      <header><strong>LONDON CITY · MATCHDAY</strong><span>Supporter journey service</span></header>
      <section className={styles.message}>
        <span>Fixture unavailable</span>
        <h1>This matchday page is not available.</h1>
        <p>The fixture may not be a current home match or the public journey surface may not have been published for it.</p>
        <div>
          <Link href="/live/london-city">London City case</Link>
          <Link href="/">AVELA website</Link>
        </div>
      </section>
    </main>
  );
}
