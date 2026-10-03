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

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="campaigns" />
      <div className={styles.assetShortcut}><span>Need player talent for an activation?</span><Link href="/app/players">Optimise player pack →</Link></div>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AVELA · Campaigns</span>
          <h1>Turn accepted opportunities into reviewable work.</h1>
          <p>Campaigns can start from a fixture or a commercial calendar moment such as season tickets, Christmas, retail, community or sponsor activity. AVELA can propose channels, assets, talent and timing, but approval and launch remain with the club.</p>
        </div>
        <div className={styles.summary}><span>Drafts</span><strong>{campaigns.length + demoCommercialCampaigns.length}</strong></div>
      </header>
      <section className={styles.list} aria-label="Campaign drafts">
        {campaigns.map((campaign) => {
          const approvalCount = campaign.approvals?.filter((item) => item.state === "ready").length ?? 0;
          const approvalTotal = campaign.approvals?.length ?? 0;
          return (
            <article key={campaign.id} className={styles.card}>
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
      <section className={styles.seasonal} aria-label="Seasonal commercial campaigns">
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
