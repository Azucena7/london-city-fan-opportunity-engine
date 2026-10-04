import type { Metadata } from "next";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { partnerCommercialPack, pilotReadiness } from "@/lib/data";
import styles from "./sponsors.module.css";

export const metadata: Metadata = {
  title: "Sponsors · AVELA",
  description: "Prioritise partner opportunities, evidence, blockers and activation readiness without confusing prospecting with verified contract truth."
};

function evidenceSummary(pack: (typeof partnerCommercialPack.packs)[number]) {
  return {
    verified: pack.evidence.filter((item) => item.state === "public-verified").length,
    modelled: pack.evidence.filter((item) => item.state === "modelled-scenario").length,
    missing: pack.evidence.filter((item) => item.state === "requires-measurement" || item.state === "requires-partner").length
  };
}

export default function SponsorsPage() {
  const candidates = partnerCommercialPack.packs
    .map((pack) => {
      const readiness = pilotReadiness.candidates.find((item) => item.packId === pack.id) ?? null;
      return { pack, readiness, evidence: evidenceSummary(pack) };
    })
    .sort((a, b) => (a.readiness?.rank ?? 99) - (b.readiness?.rank ?? 99));

  const recommended = candidates.find((item) => item.readiness?.decision === "recommended-for-review") ?? candidates[0] ?? null;
  const waitingGates = partnerCommercialPack.approvalGates.filter((gate) => gate.state !== "ready");

  return (
    <main className={`\${styles.shell} productAppShell`}>
      <ProductJourneyNav active="sponsors" />

      <header className={styles.header}>
        <div>
          <span>AVELA · Sponsor Intelligence</span>
          <h1>Which partnership opportunity deserves attention next?</h1>
          <p>Use evidence, fixture fit, feasibility and blockers to decide what should advance. Prospecting evidence stays separate from verified contract rights and fulfilment.</p>
        </div>
        <aside className={styles.truthBoundary}>
          <span>Truth boundary</span>
          <strong>Prospecting ≠ contract truth</strong>
          <p>These opportunities are planning and partner-development records. Contract obligations should only become active after verified ingestion and review.</p>
        </aside>
      </header>

      <section className={styles.summary} aria-label="Sponsor opportunity summary">
        <article><span>Opportunities</span><strong>{candidates.length}</strong><small>Current partner concepts</small></article>
        <article><span>Recommended</span><strong>{recommended?.pack.candidate ?? "—"}</strong><small>{recommended?.readiness?.weightedScore ?? "—"} weighted readiness</small></article>
        <article><span>Approval gates</span><strong>{waitingGates.length}</strong><small>Still waiting</small></article>
        <article><span>Measurement</span><strong>{partnerCommercialPack.measurementState.replaceAll("-", " ")}</strong><small>Do not treat missing measurement as zero</small></article>
      </section>

      {recommended ? (
        <section className={styles.primary} aria-label="Recommended sponsor opportunity">
          <div className={styles.primaryCopy}>
            <span>Recommended for review</span>
            <h2>{recommended.pack.candidate}</h2>
            <strong>{recommended.pack.title.en}</strong>
            <p>{recommended.readiness?.rationale.en ?? recommended.pack.whyFit.en}</p>
          </div>
          <div className={styles.primaryFacts}>
            <div><span>Commercial ask</span><strong>{recommended.pack.commercialAsk.en}</strong></div>
            <div><span>Fixture fit</span><strong>{recommended.pack.recommendedFixtureIds.length} recommended fixture{recommended.pack.recommendedFixtureIds.length === 1 ? "" : "s"}</strong></div>
            <div><span>Evidence</span><strong>{recommended.evidence.verified} verified · {recommended.evidence.modelled} modelled · {recommended.evidence.missing} unresolved</strong></div>
            <div><span>Decision</span><strong>{recommended.readiness?.decision.replaceAll("-", " ") ?? "Review"}</strong></div>
          </div>
        </section>
      ) : null}

      <section className={styles.queue}>
        <div className={styles.sectionHead}>
          <div>
            <span>Opportunity queue</span>
            <h2>Compare partner opportunities before outreach.</h2>
          </div>
          <p>Ranking is only a decision aid. It does not imply a relationship, inventory commitment or agreed commercial terms.</p>
        </div>

        <div className={styles.cards}>
          {candidates.map(({ pack, readiness }) => (
            <article key={pack.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span>#{readiness?.rank ?? "—"} · {pack.category.replaceAll("-", " ")}</span>
                <small>{pack.relationshipState.replaceAll("-", " ")}</small>
              </div>
              <h3>{pack.candidate}</h3>
              <strong>{pack.title.en}</strong>
              <p>{pack.proposition.en}</p>
              <div className={styles.cardFacts}>
                <div><span>Readiness</span><strong>{readiness?.weightedScore ?? "—"}</strong></div>
                <div><span>Decision</span><strong>{readiness?.decision.replaceAll("-", " ") ?? "Review"}</strong></div>
                <div><span>Fixtures</span><strong>{pack.recommendedFixtureIds.length}</strong></div>
              </div>
              <details>
                <summary>Why this could fit</summary>
                <p>{pack.whyFit.en}</p>
                <ul>
                  {pack.activationAssets.slice(0, 3).map((asset) => <li key={asset.en}>{asset.en}</li>)}
                </ul>
              </details>
              <details>
                <summary>Evidence & unknowns</summary>
                <div className={styles.evidenceList}>
                  {pack.evidence.map((item) => (
                    <div key={item.id}>
                      <span data-state={item.state}>{item.state.replaceAll("-", " ")}</span>
                      <strong>{item.label.en}</strong>
                      <p>{item.detail.en}</p>
                    </div>
                  ))}
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.gates}>
        <div className={styles.sectionHead}>
          <div>
            <span>Before anything becomes real</span>
            <h2>What must be true first?</h2>
          </div>
          <p>AVELA should move from prospecting → partner review → verified contract, never silently from an idea to a legal or delivery obligation.</p>
        </div>
        <div className={styles.gateList}>
          {partnerCommercialPack.approvalGates.map((gate) => (
            <article key={gate.id} data-state={gate.state}>
              <span>{gate.state}</span>
              <strong>{gate.label.en}</strong>
              <small>{gate.owner.en}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
