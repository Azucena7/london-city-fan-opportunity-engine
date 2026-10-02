import type { CampaignPlan } from "@/lib/models";
import styles from "./ActivationDraft.module.css";

function stateLabel(state: string) {
  return state.replaceAll("-", " ");
}

export function ActivationDraft({
  campaign,
  fallbackOwner,
  fallbackMeasurement
}: {
  campaign: CampaignPlan | null;
  fallbackOwner: string;
  fallbackMeasurement: string;
}) {
  if (!campaign) {
    return (
      <section className={styles.empty}>
        <span>Activation draft</span>
        <strong>No campaign draft is linked to this fixture yet.</strong>
        <p>The engine can still recommend the next action, but audience, channel and message need a fixture campaign draft before review.</p>
      </section>
    );
  }

  const primaryAudience = campaign.audiences[0];
  const primaryActivation = campaign.activations[0];
  const primaryMeasurement = campaign.measurement.find((item) => item.id === "purchase-scan-repeat") ?? campaign.measurement[0];
  const nextSchedule = campaign.schedule.find((item) => item.state !== "complete");

  return (
    <section className={styles.draft} aria-label="Activation draft">
      <div className={styles.head}>
        <div>
          <span>Activation draft · review before approval</span>
          <h3>{campaign.title.en}</h3>
        </div>
        <b>{campaign.status}</b>
      </div>

      <div className={styles.grid}>
        <article>
          <span>Audience</span>
          <strong>{primaryAudience?.label.en ?? "Audience requires review"}</strong>
          <p>{primaryAudience ? stateLabel(primaryAudience.state) : "missing"}</p>
        </article>
        <article>
          <span>Channel</span>
          <strong>{primaryActivation?.channel ?? "Channel requires review"}</strong>
          <p>{primaryActivation?.title.en ?? "No activation drafted"}</p>
        </article>
        <article>
          <span>Message</span>
          <strong>{campaign.message.en}</strong>
          <p>{campaign.proposition.en}</p>
        </article>
        <article>
          <span>Timing</span>
          <strong>{nextSchedule ? `${nextSchedule.window} · ${nextSchedule.date}` : "Before activation"}</strong>
          <p>{nextSchedule?.action.en ?? "Review before launch"}</p>
        </article>
        <article>
          <span>Owner</span>
          <strong>{fallbackOwner}</strong>
          <p>Club owner must confirm before activation.</p>
        </article>
        <article>
          <span>Measurement</span>
          <strong>{primaryMeasurement?.label.en ?? fallbackMeasurement}</strong>
          <p>{primaryMeasurement?.target.en ?? "Define measurement before launch."}</p>
        </article>
      </div>

      <div className={styles.review}>
        <div>
          <span>Offer / proposition</span>
          <strong>{campaign.offer.description.en}</strong>
          <p>{stateLabel(campaign.offer.state)}</p>
        </div>
        <div>
          <span>Next approval</span>
          <strong>{campaign.nextApproval.en}</strong>
          <p>{campaign.approvals.filter((item) => item.state !== "ready").length} unresolved gates</p>
        </div>
      </div>

      <details className={styles.details}>
        <summary>Review all drafted activations</summary>
        <div className={styles.activationList}>
          {campaign.activations.map((activation) => (
            <article key={activation.id}>
              <div>
                <span>{stateLabel(activation.state)} · {activation.channel}</span>
                <h4>{activation.title.en}</h4>
                <p>{activation.role.en}</p>
              </div>
              <small>{activation.asset.en}</small>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
