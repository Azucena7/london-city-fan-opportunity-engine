import styles from "./matchday-state.module.css";

export default function MatchdayLoading() {
  return (
    <main className={styles.shell} aria-busy="true" aria-live="polite">
      <header><strong>LONDON CITY · MATCHDAY</strong><span>Preparing journey guidance…</span></header>
      <section className={styles.hero}>
        <span />
        <span />
      </section>
      <section className={styles.grid}>
        {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
      </section>
      <p>Loading fixture, travel and weather context.</p>
    </main>
  );
}
