"use client";

import { useMemo, useState } from "react";
import styles from "./CampaignCreditBuilder.module.css";

type Tier = "explorer" | "club" | "club-pro";

type CampaignItem = {
  id: string;
  label: string;
  type: "content" | "channel" | "flow";
  detail: string;
  credits: number;
  recommended: boolean;
};

const tierCredits: Record<Tier, number> = {
  explorer: 0,
  club: 60,
  "club-pro": 160
};

const catalogue: CampaignItem[] = [
  { id: "crm-email", label: "CRM email", type: "content", detail: "One campaign email with subject, body and CTA variants.", credits: 5, recommended: true },
  { id: "vertical-video", label: "Vertical video concept", type: "content", detail: "Short-form video concept, script and platform cut guidance.", credits: 10, recommended: true },
  { id: "social-carousel", label: "Social carousel", type: "content", detail: "Six-frame carousel with copy and visual direction.", credits: 6, recommended: true },
  { id: "story-set", label: "Story set", type: "content", detail: "Three-story sequence with CTA and variants.", credits: 4, recommended: false },
  { id: "paid-social", label: "Paid social deployment pack", type: "channel", detail: "Audience, placements, copy variants and launch configuration.", credits: 8, recommended: true },
  { id: "organic-social", label: "Organic social scheduling", type: "channel", detail: "Channel-specific schedule and publishing handoff.", credits: 3, recommended: true },
  { id: "crm-flow", label: "CRM follow-up flow", type: "flow", detail: "Initial message plus reminder logic and exclusion rules.", credits: 9, recommended: true },
  { id: "landing-copy", label: "Campaign landing copy", type: "content", detail: "Landing-page structure, copy and conversion CTA.", credits: 7, recommended: false },
  { id: "sms", label: "SMS / push variant", type: "channel", detail: "Short-form conversion message and send-window guidance.", credits: 4, recommended: false }
];

export function CampaignCreditBuilder({
  objective,
  audience,
  proposition,
  unresolvedGates
}: {
  objective: string;
  audience: string;
  proposition: string;
  unresolvedGates: number;
}) {
  const [tier, setTier] = useState<Tier>("club");
  const [selected, setSelected] = useState(() => new Set(catalogue.filter((item) => item.recommended).map((item) => item.id)));
  const available = tierCredits[tier];

  const total = useMemo(
    () => catalogue.filter((item) => selected.has(item.id)).reduce((sum, item) => sum + item.credits, 0),
    [selected]
  );
  const remaining = available - total;
  const explorer = tier === "explorer";
  const canLaunch = !explorer && remaining >= 0 && unresolvedGates === 0;

  function toggle(id: string) {
    if (explorer) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className={styles.shell} aria-label="Campaign proposal and credit calculator">
      <div className={styles.head}>
        <div>
          <span>Campaign proposal</span>
          <h2>Turn the match plan into a launchable campaign.</h2>
          <p>The engine proposes the content, channels and flows. Credits are only consumed when production or deployment is selected.</p>
        </div>
        <label>
          Product tier
          <select value={tier} onChange={(event) => setTier(event.target.value as Tier)}>
            <option value="explorer">Explorer · preview only</option>
            <option value="club">Club · 60 credits</option>
            <option value="club-pro">Club Pro · 160 credits</option>
          </select>
        </label>
      </div>

      <div className={styles.brief}>
        <article><span>Objective</span><strong>{objective}</strong></article>
        <article><span>Audience</span><strong>{audience}</strong></article>
        <article><span>Proposition</span><strong>{proposition}</strong></article>
      </div>

      {explorer ? (
        <div className={styles.locked}>
          <span>Explorer preview</span>
          <h3>The campaign builder is visible, but the specific content/channel proposal is locked.</h3>
          <p>Explorer can understand how the workflow works, but cannot inspect the campaign recipe, spend credits or launch.</p>
          <div className={styles.lockedRows}>
            <div><strong>Recommended content mix</strong><span>Upgrade to reveal</span></div>
            <div><strong>Recommended channels</strong><span>Upgrade to reveal</span></div>
            <div><strong>Estimated credit budget</strong><span>Upgrade to reveal</span></div>
          </div>
        </div>
      ) : (
        <div className={styles.calculator}>
          <div className={styles.catalogue}>
            <div className={styles.catalogueHead}>
              <div>
                <span>Campaign builder</span>
                <strong>Add or remove production and deployment items.</strong>
              </div>
              <small>Recommended items start selected.</small>
            </div>

            {catalogue.map((item) => {
              const active = selected.has(item.id);
              return (
                <label key={item.id} className={active ? styles.itemActive : styles.item}>
                  <input type="checkbox" checked={active} onChange={() => toggle(item.id)} />
                  <div>
                    <div className={styles.itemTitle}>
                      <strong>{item.label}</strong>
                      {item.recommended ? <span>Recommended</span> : null}
                    </div>
                    <p>{item.detail}</p>
                    <small>{item.type}</small>
                  </div>
                  <b>{item.credits} cr</b>
                </label>
              );
            })}
          </div>

          <aside className={styles.budget}>
            <span>Estimated campaign budget</span>
            <strong>{total} credits</strong>
            <dl>
              <div><dt>Included</dt><dd>{available} cr</dd></div>
              <div><dt>Campaign</dt><dd>-{total} cr</dd></div>
              <div className={remaining < 0 ? styles.over : ""}><dt>Remaining</dt><dd>{remaining} cr</dd></div>
            </dl>

            {remaining < 0 ? (
              <p className={styles.warning}>This campaign needs {Math.abs(remaining)} additional credits. Remove items or buy another credit pack.</p>
            ) : (
              <p>{remaining} credits remain after this campaign.</p>
            )}

            <div className={styles.launchState}>
              <span>Launch readiness</span>
              <strong>{canLaunch ? "Ready to launch" : "Not ready"}</strong>
              <small>
                {remaining < 0
                  ? "Credit budget exceeded."
                  : unresolvedGates > 0
                    ? `${unresolvedGates} approval gate${unresolvedGates === 1 ? "" : "s"} still unresolved.`
                    : "Credit budget and approval gates are clear."}
              </small>
            </div>

            <button type="button" disabled={!canLaunch}>Launch campaign</button>
            <small className={styles.guardrail}>Prototype state: this button does not publish content, send CRM or spend media yet.</small>
          </aside>
        </div>
      )}
    </section>
  );
}
