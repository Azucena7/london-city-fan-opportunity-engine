import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./route-state.module.css";

export default function AppLoading() {
  return (
    <main className={`${styles.shell} productAppShell`} aria-busy="true" aria-label="Loading AVELA workspace">
      <ProductJourneyNav />
      <div className={styles.content}>
        <span className={styles.eyebrow}>AVELA · Loading workspace</span>
        <h1 className={styles.title}>Preparing the next decision.</h1>
        <p className={styles.copy}>AVELA is loading the latest fixture, campaign and evidence context.</p>
        <div className={styles.skeleton} aria-hidden="true"><span /><span /><span /></div>
      </div>
    </main>
  );
}
