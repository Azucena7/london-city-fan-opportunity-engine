import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.shell}>
      <MarketingNav />
      <section className={styles.content}>
        <span className={styles.eyebrow}>404 · AVELA</span>
        <h1>This route is no longer part of the product.</h1>
        <p>AVELA has been consolidated around a smaller set of canonical surfaces. Use the current product or return to the commercial site.</p>
        <div className={styles.actions}>
          <Link href="/app">Open AVELA</Link>
          <Link href="/">AVELA website</Link>
        </div>
      </section>
    </main>
  );
}
