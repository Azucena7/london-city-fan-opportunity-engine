"use client";

import { useMemo, useState } from "react";
import styles from "./CampaignCreditBuilder.module.css";

type Tier = "explorer" | "club" | "club-pro";
type CreditCategory = "creation" | "adaptation" | "automation" | "deployment";

type CampaignItem = {
  id: string;
  label: string;
  category: CreditCategory;
  detail: string;
  baseCredits: number;
  recommended: boolean;
  supportsVariants?: boolean;
};

const tierCredits: Record<Tier, number> = {
  explorer: 0,
  club: 60,
  "club-pro": 160
};

const creditPacks = [
  { id: "small", label: "+25 credits", price: "£175" },
  { id: "medium", label: "+75 credits", price: "£450" },
  { id: "large", label: "+200 credits", price: "£1,000" }
] as const;

const catalogue: CampaignItem[] = [
  { id: "crm-email", label: "CRM email", category: "creation", detail: "Subject line, body copy, CTA and one approval-ready version.", baseCredits: 5, recommended: true, supportsVariants: true },
  { id: "vertical-video", label: "Vertical video", category: "creation", detail: "Concept, script, shot list and short-form edit direction.", baseCredits: 10, recommended: true, supportsVariants: true },
  { id: "social-carousel", label: "Social carousel", category: "creation", detail: "Six-frame carousel with copy and visual direction.", baseCredits: 6, recommended: true, supportsVariants: true },
  { id: "story-set", label: "Story set", category: "adaptation", detail: "Adapt the core campaign into a three-story sequence.", baseCredits: 4, recommended: false, supportsVariants: true },
  { id: "landing-copy", label: "Landing page copy", category: "creation", detail: "Campaign page structure, copy and conversion CTA.", baseCredits: 7, recommended: false },
  { id: "channel-adaptation", label: "Channel adaptation pack", category: "adaptation", detail: "Resize/rewrite the core idea for one additional social channel.", baseCredits: 3, recommended: true, supportsVariants: true },
  { id: "crm-flow", label: "CRM follow-up flow", category: "automation", detail: "Initial message, reminder logic, suppression and exclusion rules.", baseCredits: 9, recommended: true },
  { id: "organic-scheduling", label: "Organic scheduling", category: "deployment", detail: "Prepare and schedule approved organic assets for one channel.", baseCredits: 3, recommended: true },
  { id: "paid-social", label: "Paid social launch pack", category: "deployment", detail: "Audience, placements, creative variants and launch configuration.", baseCredits: 8, recommended: true, supportsVariants: true },
  { id: "sms-push", label: "SMS / push deployment", category: "deployment", detail: "Short-form message, timing and approved send configuration.", baseCredits: 4, recommended: false }
];

const categoryLabels: Record<CreditCategory, string> = {
  creation: "Creation",
  adaptation: "Adaptation",
  automation: "Automation",
  deployment: "Deployment"
};

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
  const [variants, setVariants] = useState<Record<string, number>>(() => Object.fromEntries(catalogue.map((item) => [item.id, 1])));
  const [extraCredits, setExtraCredits] = useState(0);

  const includedCredits = tierCredits[tier];
  const available = includedCredits + extraCredits;

  const pricedItems = useMemo(
    () => catalogue.filter((item) => selected.has(item.id)).map((item) => {
      const count = item.supportsVariants ? Math.max(1, Math.min(4, variants[item.id] ?? 1)) : 1;
      const variantCredits = item.supportsVariants ? Math.max(0, count - 1) * Math.ceil(item.baseCredits * 0.45) : 0;
      return { ...item, count, totalCredits: item.baseCredits + variantCredits };
    }),
    [selected, variants]
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<CreditCategory, number> = { creation: 0, adaptation: 0, automation: 0, deployment: 0 };
    pricedItems.forEach((item) => { totals[item.category] += item.totalCredits; });
    return totals;
  }, [pricedItems]);

  const total = pricedItems.reduce((sum, item) => sum + item.totalCredits, 0);
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

  function changeVariants(id: string, value: number) {
    const safe = Math.max(1, Math.min(4, Number.isFinite(value) ? value : 1));
    setVariants((current) => ({ ...current, [id]: safe }));
  }

  return (
    <section className={styles.shell} aria-label="Campaign proposal and credit calculator">
      <div className={styles.head}>
        <div>
          <span>Campaign proposal</span>
          <h2>Turn the match plan into a launchable campaign.</h2>
          <p>The engine proposes the campaign recipe first. The club then decides what to produce, adapt, automate and deploy before any credits are committed.</p>
        </div>
        <label>
          Product tier
          <select value={tier} onChange={(event) => { setTier(event.target.value as Tier); setExtraCredits(0); }}>
            <option value="explorer">Explorer · preview only</option>
            <option value="club">Club · 60 included credits</option>
            <option value="club-pro">Club Pro · 160 included credits</option>
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
          <h3>The workflow is visible, but the specific campaign recipe is locked.</h3>
          <p>Explorer can understand how the engine moves from match plan to campaign, but cannot inspect the recommended content/channel mix, calculate credits or launch.</p>
          <div className={styles.lockedRows}>
            <div><strong>Recommended content mix</strong><span>Upgrade to reveal</span></div>
            <div><strong>Recommended channels</strong><span>Upgrade to reveal</span></div>
            <div><strong>Automation plan</strong><span>Upgrade to reveal</span></div>
            <div><strong>Estimated credit budget</strong><span>Upgrade to reveal</span></div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.creditExplainer}>
            {(["creation", "adaptation", "automation", "deployment"] as CreditCategory[]).map((category) => (
              <article key={category}>
                <span>{categoryLabels[category]}</span>
                <strong>{categoryTotals[category]} cr</strong>
                <small>
                  {category === "creation" ? "Net-new campaign assets."
                    : category === "adaptation" ? "Variants and channel-specific versions."
                      : category === "automation" ? "Rules, flows and sequencing."
                        : "Publishing, scheduling and channel setup."}
                </small>
              </article>
            ))}
          </div>

          <div className={styles.calculator}>
            <div className={styles.catalogue}>
              <div className={styles.catalogueHead}>
                <div>
                  <span>Campaign builder</span>
                  <strong>Add, remove or resize the proposed campaign.</strong>
                </div>
                <small>Extra variants cost less than the first asset because they reuse the core campaign concept.</small>
              </div>

              {catalogue.map((item) => {
                const active = selected.has(item.id);
                const count = Math.max(1, variants[item.id] ?? 1);
                const rowTotal = item.baseCredits + (item.supportsVariants ? Math.max(0, count - 1) * Math.ceil(item.baseCredits * 0.45) : 0);
                return (
                  <div key={item.id} className={active ? styles.itemActive : styles.item}>
                    <label className={styles.itemToggle}>
                      <input type="checkbox" checked={active} onChange={() => toggle(item.id)} />
                      <div>
                        <div className={styles.itemTitle}>
                          <strong>{item.label}</strong>
                          {item.recommended ? <span>Recommended</span> : null}
                        </div>
                        <p>{item.detail}</p>
                        <small>{categoryLabels[item.category]} · base {item.baseCredits} cr</small>
                      </div>
                    </label>

                    <div className={styles.itemCost}>
                      {item.supportsVariants && active ? (
                        <label>
                          Variants
                          <select value={count} onChange={(event) => changeVariants(item.id, Number(event.target.value))}>
                            {[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}
                          </select>
                        </label>
                      ) : null}
                      <b>{active ? rowTotal : 0} cr</b>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className={styles.budget}>
              <span>Estimated campaign budget</span>
              <strong>{total} credits</strong>
              <dl>
                <div><dt>Plan allowance</dt><dd>{includedCredits} cr</dd></div>
                <div><dt>Extra credits</dt><dd>{extraCredits} cr</dd></div>
                <div><dt>Campaign</dt><dd>-{total} cr</dd></div>
                <div className={remaining < 0 ? styles.over : ""}><dt>Remaining</dt><dd>{remaining} cr</dd></div>
              </dl>

              <div className={styles.breakdown}>
                {(["creation", "adaptation", "automation", "deployment"] as CreditCategory[]).map((category) => (
                  <div key={category}><span>{categoryLabels[category]}</span><strong>{categoryTotals[category]} cr</strong></div>
                ))}
              </div>

              {remaining < 0 ? (
                <p className={styles.warning}>This campaign needs {Math.abs(remaining)} additional credits. Reduce scope or add a credit pack.</p>
              ) : (
                <p>{remaining} credits remain after this campaign.</p>
              )}

              <div className={styles.creditPacks}>
                <span>Add credits</span>
                {creditPacks.map((pack) => (
                  <button key={pack.id} type="button" onClick={() => setExtraCredits(Number(pack.label.match(/\d+/)?.[0] ?? 0))}>
                    <strong>{pack.label}</strong><small>{pack.price}</small>
                  </button>
                ))}
                {extraCredits > 0 ? <button type="button" onClick={() => setExtraCredits(0)}>Remove extra pack</button> : null}
              </div>

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

              <button className={styles.launch} type="button" disabled={!canLaunch}>Launch campaign</button>
              <small className={styles.guardrail}>Prototype state: launch does not yet publish content, send CRM or spend media. Connected channels will replace this guardrail over time.</small>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
