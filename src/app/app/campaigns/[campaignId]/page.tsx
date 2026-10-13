import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { campaignPlans } from "@/lib/data";
import { demoCommercialCampaigns } from "@/lib/clubStrategy";
import styles from "./campaign-record.module.css";

export const metadata: Metadata = {
  title: "Campaign record",
  description: "One record per campaign: objective, window, owner, channel, budget and the player assets it needs."
};

function formatDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function label(value: string) {
  return value.replaceAll("-", " ");
}

// Every campaign has one address. A fixture campaign's record is its Opportunity Brief, so its
// address forwards there; a commercial-calendar campaign has its own record here.
export default async function CampaignRecordPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;

  const fixtureCampaign = campaignPlans.campaigns.find((item) => item.id === campaignId);
  if (fixtureCampaign) redirect(`/app/matches/${encodeURIComponent(fixtureCampaign.fixtureId)}#execute`);

  const campaign = demoCommercialCampaigns.find((item) => item.id === campaignId);
  if (!campaign) notFound();

  const facts = [
    { label: "Campaign window", value: `${formatDate(campaign.start)} – ${formatDate(campaign.end)}` },
    { label: "Activation date", value: formatDate(campaign.activationDate) },
    { label: "Owner", value: label(campaign.owner) },
    { label: "Channel", value: label(campaign.channel) },
    { label: "Territory", value: campaign.territory },
    { label: "Category", value: label(campaign.category) },
    { label: "Planned budget", value: `£${campaign.budget.toLocaleString("en-GB")}` },
    { label: "Player assets needed", value: String(campaign.playerNeed) }
  ];

  return (
    <AppWorkspaceShell
      active="campaigns"
      eyebrow={`Commercial calendar · ${label(campaign.type)}`}
      title={campaign.name}
      subtitle={campaign.objective}
      actions={<Link className={styles.back} href="/app/campaigns">← All campaigns</Link>}
    >
      <p className={styles.boundary}>
        <strong>Synthetic demo brief.</strong> This campaign, its budget and its player needs are demonstration data, not a
        London City plan. Nothing here is committed or launched.
      </p>

      <section className={styles.facts} aria-label="Campaign facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </section>

      <section className={styles.next} aria-labelledby="campaign-next">
        <h2 id="campaign-next">Move this campaign forward</h2>
        <div className={styles.actions}>
          <Link href={`/app/players?campaign=${encodeURIComponent(campaign.id)}`}>
            <span>Player assets</span>
            <strong>Choose the {campaign.playerNeed} player{campaign.playerNeed === 1 ? "" : "s"} this campaign needs →</strong>
          </Link>
          <Link href="/app/season">
            <span>Calendar</span>
            <strong>Check the window against fixtures and other campaigns →</strong>
          </Link>
          <Link href="/app/learning">
            <span>Learning</span>
            <strong>Plan how the outcome will be measured →</strong>
          </Link>
        </div>
      </section>
    </AppWorkspaceShell>
  );
}
