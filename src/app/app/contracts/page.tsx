import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { ContractReviewQueue } from "@/components/ContractReviewQueue";
import { ContractImpactGraph } from "@/components/ContractImpactGraph";
import styles from "./contracts.module.css";

export const metadata: Metadata = {
  title: "Contracts · AVELA",
  description: "Review extracted sponsor and player clauses with provenance before verified contract intelligence can affect club decisions."
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
          <p>AVELA can use reviewed contract intelligence to improve recommendations, alerts and fulfilment while the club&apos;s legal or document system remains the source of record.</p>
        </div>
        <aside className={styles.state}>
          <span>Truth boundary</span>
          <strong>Extraction is candidate evidence.</strong>
          <p>Only clauses explicitly verified by authorised governance users may become contract truth inside AVELA.</p>
        </aside>
      </header>

      <section className={styles.flow} aria-label="Contract verification lifecycle">
        <article><span>01</span><strong>Detected / uploaded</strong><p>Document discovered from an approved repository or uploaded by an authorised user.</p></article>
        <article><span>02</span><strong>Extracted</strong><p>AVELA identifies candidate clauses, dates, rights, restrictions and obligations.</p></article>
        <article><span>03</span><strong>Reviewed</strong><p>Authorised staff verify, reject or escalate material clauses with provenance visible.</p></article>
        <article><span>04</span><strong>Active</strong><p>Only verified fields from an approved contract version may drive alerts, fulfilment or recommendations.</p></article>
      </section>

      <section className={styles.boundary}>
        <div>
          <span>Control rule</span>
          <h2>Extracted → Reviewed → Active</h2>
        </div>
        <p>Every material field retains document, version, section, source fragment, confidence, verification state and reviewer. Active and verified truth is versioned rather than silently overwritten.</p>
      </section>

      <ContractReviewQueue />

      <ContractImpactGraph />

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
          <h2>A verified clause should change only the decisions it actually affects.</h2>
          <p>A verified amendment can identify affected sponsors, players, campaigns, fixtures and season instances so those decisions move back to review instead of silently changing underneath the club.</p>
        </div>
        <div className={styles.impactFlow}>
          <span>Document / amendment</span><i>→</i><span>Verified clause</span><i>→</i><span>Affected decision</span><i>→</i><strong>Review required</strong>
        </div>
      </section>

      <section className={styles.empty}>
        <div>
          <span>Source of record stays external</span>
          <h2>Connect documents; do not rebuild legal document management.</h2>
          <p>AVELA should detect, extract, verify and operationalise clauses while retaining a reference back to the approved source document and version.</p>
        </div>
        <Link href="/app/sources">Review data sources →</Link>
      </section>
    </main>
  );
}
