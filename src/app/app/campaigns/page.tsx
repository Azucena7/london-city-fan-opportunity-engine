import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { campaignPlans } from "@/lib/data";
import { demoCommercialCampaigns } from "@/lib/clubStrategy";
import styles from "./campaigns.module.css";

export const metadata: Metadata = {
  title: "Campaigns | AVELA",
  description: "Review fixture-led and seasonal campaign drafts, approval state and the next human decision."
};

export default function CampaignsPage() {
  const campaigns = campaignPlans.campaigns ?? [];
  const campaignRows = campaigns.map((campaign) => {
    const approvalCount = campaign.approvals?.filter((item) => item.state === "ready").length ?? 0;
    const approvalTotal = campaign.approvals?.length ?? 0;
    return { campaign, approvalCount, approvalTotal, needsDecision: approvalTotal > 0 && approvalCount < approvalTotal };
  });
  const needsDecision = campaignRows.filter((item) => item.needsDecision);
  const primary = needsDecision[0] ?? campaignRows[0] ?? null;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="campaigns" />
      <div className={styles.assetShortcut}><span>Need player talent for an activation?</span><Link href="/app/players">Optimise player pack →</Link></div>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AVELA · Campaigns</span>
          <h1>What needs a decision before it can move?</h1>
          <p>Campaigns can start from a fixture or a commercial calendar moment such as season tickets, Christmas, retail, community or sponsor activity. AVELA keeps the next approval, blocker and execution path visible; approval and launch remain with the club.</p>
        </div>
        <div className={styles.summary}><span>Needs decision</span><strong>{needsDecision.length}</strong><small>{campaigns.length + demoCommercialCampaigns.length} total campaign drafts</small></div>
      </header>

      {primary ? (
        <section className={styles.primaryDecision} aria-label="Highest priority campaign decision">
          <div className={styles.primaryCopy}>
            <span>{primary.needsDecision ? "Decision required" : "Next campaign"}</span>
            <h2>{primary.campaign.title.en}</h2>
            <p>{primary.campaign.objective.en}</p>
            <strong>Next decision · {primary.campaign.nextApproval?.en ?? "Review required"}</strong>
          </div>
          <div className={styles.primaryFacts}>
            <div><span>Status</span><strong>{primary.campaign.status}</strong></div>
            <div><span>Approvals ready</span><strong>{primary.approvalCount}/{primary.approvalTotal}</strong></div>
            <div><span>Activations</span><strong>{primary.campaign.activations?.length ?? 0}</strong></div>
            <Link href={`/app/matches/${primary.campaign.fixtureId}`}>Open decision workspace →</Link>
          </div>
        </section>
      ) : null}

      <div className={styles.workflowLinks} aria-label="Campaign workflow shortcuts">
        <a href="#fixture-campaigns">Fixture campaigns</a>
        <a href="#commercial-calendar">Commercial calendar</a>
        <Link href="/app/season">Check Calendar pressure →</Link>
      </div>

      <section id="fixture-campaigns" className={styles.list} aria-label="Campaign drafts">
        {campaignRows.map(({ campaign, approvalCount, approvalTotal, needsDecision: rowNeedsDecision }) => {
          return (
            <article key={campaign.id} className={styles.card} data-needs-decision={rowNeedsDecision ? "true" : "false"}>
              <div className={styles.meta}><span>{campaign.status}</span><span>{campaign.fixtureId}</span></div>
              <h2>{campaign.title.en}</h2>
              <p>{campaign.objective.en}</p>
              <div className={styles.progressBar} aria-label={`${approvalCount} of ${approvalTotal} approvals ready`}>
                <span style={{ width: `${approvalTotal ? Math.round((approvalCount / approvalTotal) * 100) : 0}%` }} />
              </div>
              <div className={styles.facts}>
                <div><span>Activations</span><strong>{campaign.activations?.length ?? 0}</strong></div>
                <div><span>Approvals ready</span><strong>{approvalCount}/{approvalTotal}</strong></div>
                <div><span>Next decision</span><strong>{campaign.nextApproval?.en ?? "Review required"}</strong></div>
              </div>
              <Link href={`/app/matches/${campaign.fixtureId}`}>Open fixture campaign →</Link>
            </article>
          );
        })}
      </section>
      <section id="commercial-calendar" className={styles.seasonal} aria-label="Seasonal commercial campaigns">
        <div className={styles.seasonalHead}>
          <div><span>Commercial calendar</span><h2>Campaigns that do not need a fixture to exist.</h2></div>
          <Link href="/app/players">Plan player assets →</Link>
        </div>
        <div className={styles.seasonalGrid}>
          {demoCommercialCampaigns.map((campaign) => (
            <article key={campaign.id}>
              <div><span>{campaign.type.replaceAll("-", " ")}</span><strong>{campaign.playerNeed} player{campaign.playerNeed === 1 ? "" : "s"}</strong></div>
              <h3>{campaign.name}</h3>
              <p>{campaign.objective}</p>
              <small>{campaign.start} → {campaign.end} · activation {campaign.activationDate}</small>
              <Link href="/app/players">Optimise pack →</Link>
            </article>
          ))}
        </div>
      </section>
      <footer className={styles.principle}><span>Operating rule</span><strong>AVELA drafts. The club approves.</strong></footer>
    </main>
  );
}
