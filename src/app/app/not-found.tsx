import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./route-state.module.css";

export default function AppNotFound() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav />
      <div className={styles.content}>
        <span className={styles.eyebrow}>AVELA · Not found</span>
        <h1 className={styles.title}>This workspace does not exist.</h1>
        <p className={styles.copy}>The fixture, campaign or workspace may have moved. Return to Home or Radar to continue.</p>
        <div className={styles.actions}>
          <Link href="/app">Back to Home</Link>
          <Link href="/app/matches">Open Radar</Link>
        </div>
      </div>
    </main>
  );
}
