import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./contracts.module.css";

export const metadata: Metadata = {
  title: "Contracts · AVELA",
  description: "Prepare verified sponsor and player contract intelligence without treating extracted text or technical schemas as legal truth."
};

const sponsorFields = [
  "Rights and activation counts",
  "Player appearances",
  "Hospitality and branding",
  "Exclusivity and category restrictions",
  "Approval windows and deadlines",
  "KPIs, make-goods and renewal terms"
];

const playerFields = [
  "Commercial appearances",
  "Image and content rights",
  "Usage restrictions",
  "Fees and bonuses",
  "Club obligations",
  "Season-specific quotas"
];

export default function ContractsPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="contracts" />

      <header className={styles.header}>
        <div>
          <span>AVELA · Contract Intelligence</span>
          <h1>Verified rights and obligations — not extracted text treated as truth.</h1>
          <p>AVELA should use contracts to improve recommendations, alerts and fulfilment, while the club&apos;s legal or document system remains the source of record.</p>
        </div>
        <aside className={styles.state}>
          <span>Current state</span>
          <strong>0 verified legal contracts connected</strong>
          <p>Technical API schemas in the repo are product contracts, not sponsor or player legal agreements.</p>
        </aside>
      </header>

      <section className={styles.flow} aria-label="Contract verification lifecycle">
        <article><span>01</span><strong>Detected / uploaded</strong><p>Document discovered from an approved repository or uploaded by an authorised user.</p></article>
        <article><span>02</span><strong>Extracted</strong><p>AVELA identifies candidate clauses, dates, rights, restrictions and obligations.</p></article>
        <article><span>03</span><strong>Reviewed</strong><p>Authorised staff verify material clauses and correct low-confidence extraction.</p></article>
        <article><span>04</span><strong>Active</strong><p>Only verified fields may drive alerts, fulfilment and recommendations.</p></article>
      </section>

      <section className={styles.boundary}>
        <div>
          <span>Control rule</span>
          <h2>Extracted → Reviewed → Active</h2>
        </div>
        <p>No clause should silently become legal truth. Every material field should retain document, version, section, source fragment, verification status and reviewer.</p>
      </section>

      <section className={styles.grids}>
        <article>
          <span>Sponsor contract intelligence</span>
          <h2>What AVELA should understand.</h2>
          <ul>{sponsorFields.map((field) => <li key={field}>{field}</li>)}</ul>
        </article>
        <article>
          <span>Player contract intelligence</span>
          <h2>What AVELA should understand.</h2>
          <ul>{playerFields.map((field) => <li key={field}>{field}</li>)}</ul>
        </article>
      </section>

      <section className={styles.impact}>
        <div>
          <span>Contract Impact Graph</span>
          <h2>A verified clause should change the decisions it actually affects.</h2>
          <p>Example: a new amendment changes player availability or sponsor exclusivity → AVELA identifies affected campaigns, fixtures and recommendations → those decisions move back to review.</p>
        </div>
        <div className={styles.impactFlow}>
          <span>Document / amendment</span><i>→</i><span>Verified clause</span><i>→</i><span>Affected decision</span><i>→</i><strong>Review required</strong>
        </div>
      </section>

      <section className={styles.empty}>
        <div>
          <span>No legal source connected yet</span>
          <h2>Connect the source before building fulfilment around assumptions.</h2>
          <p>When an approved document repository or upload flow is connected, this workspace can become the verification queue and provenance surface.</p>
        </div>
        <Link href="/app/sources">Review data sources →</Link>
      </section>
    </main>
  );
}
