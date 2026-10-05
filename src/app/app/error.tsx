"use client";

import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./route-state.module.css";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav />
      <div className={styles.content} role="alert">
        <span className={styles.eyebrow}>AVELA · Workspace error</span>
        <h1 className={styles.title}>This workspace could not load.</h1>
        <p className={styles.copy}>Your underlying data has not been changed. Retry the view or return to Home and continue from the decision queue.</p>
        <div className={styles.actions}>
          <button type="button" onClick={reset}>Retry</button>
          <Link href="/app">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
