"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CampaignCreditBuilder.module.css";

type Tier = "explorer" | "club" | "club-pro";
type CreditCategory = "creation" | "adaptation" | "automation" | "deployment";
type GeneratableItem = "crm-email" | "vertical-video";
type GeneratedDraft = Record<string, string | string[]>;

type CampaignItem = {
  id: string;
  label: string;
  category: CreditCategory;
  detail: string;
  baseCredits: number;
  recommended: boolean;
  supportsVariants?: boolean;
  channels: string[];
  impact: string;
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
  { id: "crm-email", label: "CRM email", category: "creation", detail: "Subject line, body copy, CTA and one approval-ready version.", baseCredits: 5, recommended: true, supportsVariants: true, channels: ["CRM"], impact: "Removes the direct reactivation route to known supporters." },
  { id: "vertical-video", label: "Vertical video", category: "creation", detail: "Concept, script, shot list and short-form edit direction.", baseCredits: 10, recommended: true, supportsVariants: true, channels: ["Instagram", "TikTok"], impact: "Reduces short-form reach and makes the social campaign less distinctive." },
  { id: "social-carousel", label: "Social carousel", category: "creation", detail: "Six-frame carousel with copy and visual direction.", baseCredits: 6, recommended: true, supportsVariants: true, channels: ["Instagram", "Facebook"], impact: "Removes a low-friction explainer format for the campaign proposition." },
  { id: "story-set", label: "Story set", category: "adaptation", detail: "Adapt the core campaign into a three-story sequence.", baseCredits: 4, recommended: false, supportsVariants: true, channels: ["Instagram"], impact: "Reduces repeat social exposure close to matchday." },
  { id: "landing-copy", label: "Landing page copy", category: "creation", detail: "Campaign page structure, copy and conversion CTA.", baseCredits: 7, recommended: false, channels: ["Web"], impact: "Removes a dedicated conversion destination for the campaign." },
  { id: "channel-adaptation", label: "Channel adaptation pack", category: "adaptation", detail: "Resize/rewrite the core idea for one additional social channel.", baseCredits: 3, recommended: true, supportsVariants: true, channels: ["Social"], impact: "Narrows the number of channels carrying the core idea." },
  { id: "crm-flow", label: "CRM follow-up flow", category: "automation", detail: "Initial message, reminder logic, suppression and exclusion rules.", baseCredits: 9, recommended: true, channels: ["CRM"], impact: "Removes automated follow-up and leaves the campaign as a one-shot send." },
  { id: "organic-scheduling", label: "Organic scheduling", category: "deployment", detail: "Prepare and schedule approved organic assets for one channel.", baseCredits: 3, recommended: true, channels: ["Instagram", "Facebook"], impact: "Assets remain prepared but are not scheduled for organic publishing." },
  { id: "paid-social", label: "Paid social launch pack", category: "deployment", detail: "Audience, placements, creative variants and launch configuration.", baseCredits: 8, recommended: true, supportsVariants: true, channels: ["Instagram", "Facebook"], impact: "Removes paid distribution and limits the campaign to owned reach." },
  { id: "sms-push", label: "SMS / push deployment", category: "deployment", detail: "Short-form message, timing and approved send configuration.", baseCredits: 4, recommended: false, channels: ["SMS", "Push"], impact: "Removes the highest-urgency reminder channel close to kickoff." }
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
  unresolvedGates,
  fixtureId
}: {
  objective: string;
  audience: string;
  proposition: string;
  unresolvedGates: number;
  fixtureId: string;
}) {
  const [tier, setTier] = useState<Tier>("club");
  const [selected, setSelected] = useState(() => new Set(catalogue.filter((item) => item.recommended).map((item) => item.id)));
  const [variants, setVariants] = useState<Record<string, number>>(() => Object.fromEntries(catalogue.map((item) => [item.id, 1])));
  const [extraCredits, setExtraCredits] = useState(0);
  const [drafts, setDrafts] = useState<Partial<Record<GeneratableItem, GeneratedDraft>>>({});
  const [generating, setGenerating] = useState<GeneratableItem | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [workspaceStatus, setWorkspaceStatus] = useState<"draft" | "review-ready">("draft");
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);

  const storageKey = `fan-growth-engine:campaign-workspace:${fixtureId}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const workspace = JSON.parse(stored) as {
          selected?: string[];
          variants?: Record<string, number>;
          extraCredits?: number;
          drafts?: Partial<Record<GeneratableItem, GeneratedDraft>>;
          workspaceStatus?: "draft" | "review-ready";
        };

        if (Array.isArray(workspace.selected)) setSelected(new Set(workspace.selected));
        if (workspace.variants) setVariants(workspace.variants);
        if (typeof workspace.extraCredits === "number") setExtraCredits(workspace.extraCredits);
        if (workspace.drafts) setDrafts(workspace.drafts);
        if (workspace.workspaceStatus === "review-ready") setWorkspaceStatus("review-ready");
      }
    } catch {
      // A corrupt browser workspace should never block the campaign builder.
    } finally {
      setWorkspaceLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!workspaceLoaded) return;

    window.localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      fixtureId,
      selected: Array.from(selected),
      variants,
      extraCredits,
      drafts,
      workspaceStatus,
      savedAt: new Date().toISOString()
    }));
  }, [drafts, extraCredits, fixtureId, selected, storageKey, variants, workspaceLoaded, workspaceStatus]);

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
  const selectedCount = pricedItems.length;
  const activeCategories = (["creation", "adaptation", "automation", "deployment"] as CreditCategory[]).filter((category) => categoryTotals[category] > 0);
  const campaignCoverage = Math.round((activeCategories.length / 4) * 100);
  const allRecommended = catalogue.filter((item) => item.recommended);
  const missingRecommended = allRecommended.filter((item) => !selected.has(item.id));
  const activeChannels = Array.from(new Set(pricedItems.flatMap((item) => item.channels)));
  const recommendedChannels = Array.from(new Set(allRecommended.flatMap((item) => item.channels)));
  const channelCoverage = recommendedChannels.length ? Math.round((activeChannels.filter((channel) => recommendedChannels.includes(channel)).length / recommendedChannels.length) * 100) : 0;
  const launchQuality = missingRecommended.length === 0 ? "Full recommended scope" : missingRecommended.length <= 2 ? "Reduced scope" : "Thin campaign";
  const generatedItems = Object.keys(drafts) as GeneratableItem[];
  const committedCredits = generatedItems.reduce((sum, id) => sum + (catalogue.find((item) => item.id === id)?.baseCredits ?? 0), 0);
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

  async function generateDraft(type: GeneratableItem) {
    if (drafts[type] || generating) return;
    setGenerating(type);
    setGenerationError(null);

    try {
      const response = await fetch("/api/campaign-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, objective, audience, proposition })
      });
      const result = await response.json() as { draft?: GeneratedDraft; error?: string };

      if (!response.ok || !result.draft) {
        throw new Error(result.error || "Draft generation failed.");
      }

      setDrafts((current) => ({ ...current, [type]: result.draft }));
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Draft generation failed.");
    } finally {
      setGenerating(null);
    }
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
          <div className={styles.campaignCanvas}>
            <div>
              <span>Proposed campaign</span>
              <h3>{objective}</h3>
              <p>{proposition}</p>
            </div>
            <div className={styles.campaignStats}>
              <article><span>Audience</span><strong>{audience}</strong></article>
              <article><span>Selected items</span><strong>{selectedCount}</strong></article>
              <article><span>Workflow coverage</span><strong>{campaignCoverage}%</strong></article>
              <article><span>Estimated cost</span><strong>{total} cr</strong></article>
            </div>
            <div className={styles.campaignHealth}>
              <article><span>Channel coverage</span><strong>{channelCoverage}%</strong><small>{activeChannels.length ? activeChannels.join(" · ") : "No channels selected"}</small></article>
              <article><span>Campaign quality</span><strong>{launchQuality}</strong><small>{missingRecommended.length ? missingRecommended.length + " recommended item" + (missingRecommended.length === 1 ? "" : "s") + " removed" : "All recommended items included"}</small></article>
            </div>

            <div className={styles.channelStrip} aria-label="Campaign channels">
              {recommendedChannels.map((channel) => {
                const active = activeChannels.includes(channel);
                return (
                  <span key={channel} className={active ? styles.channelActive : styles.channelInactive}>
                    <b>{active ? "✓" : "–"}</b>{channel}
                  </span>
                );
              })}
            </div>

            <div className={styles.campaignFlow} aria-label="Campaign workflow coverage">
              {(["creation", "adaptation", "automation", "deployment"] as CreditCategory[]).map((category, index) => (
                <div key={category} className={categoryTotals[category] > 0 ? styles.flowActive : styles.flowInactive}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{categoryLabels[category]}</strong>
                  <small>{categoryTotals[category] > 0 ? categoryTotals[category] + " credits" : "Not included"}</small>
                </div>
              ))}
            </div>
          </div>

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
                        <small>{categoryLabels[item.category]} · {item.channels.join(" · ")} · base {item.baseCredits} cr</small>
                      {item.recommended && !active ? <p className={styles.impactWarning}>If removed: {item.impact}</p> : null}
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
                      {active && (item.id === "crm-email" || item.id === "vertical-video") ? (
                        <button
                          className={styles.generateButton}
                          type="button"
                          disabled={Boolean(drafts[item.id as GeneratableItem]) || generating !== null}
                          onClick={() => generateDraft(item.id as GeneratableItem)}
                        >
                          {drafts[item.id as GeneratableItem]
                            ? "Draft generated"
                            : generating === item.id
                              ? "Generating…"
                              : `Generate draft · ${item.baseCredits} cr`}
                        </button>
                      ) : null}
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
                <div><dt>Planned campaign</dt><dd>-{total} cr</dd></div>
                <div><dt>Committed to generated drafts</dt><dd>{committedCredits} cr</dd></div>
                <div className={remaining < 0 ? styles.over : ""}><dt>Remaining after plan</dt><dd>{remaining} cr</dd></div>
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

          <section className={styles.production} aria-label="Generated campaign drafts">
            <div className={styles.productionHead}>
              <div>
                <span>Generative production</span>
                <h3>Approval-ready drafts from the campaign strategy.</h3>
                <p>Generation commits the creation credits shown on the selected item. Campaign choices and generated drafts are automatically saved on this device for this fixture.</p>
              </div>
              <div className={styles.workspaceState}>
                <span>Workspace</span>
                <strong>{workspaceLoaded ? "Saved on this device" : "Loading workspace…"}</strong>
                <small>{workspaceStatus === "review-ready" ? "Marked ready for review" : "Draft in progress"}</small>
              </div>
            </div>

            <div className={styles.productionActions}>
              <span><strong>{committedCredits}</strong> credits committed to generated content</span>
              <button type="button" onClick={() => setWorkspaceStatus((current) => current === "draft" ? "review-ready" : "draft")}>
                {workspaceStatus === "review-ready" ? "Return to draft" : "Mark ready for review"}
              </button>
            </div>

            {generationError ? <p className={styles.generationError}>{generationError}</p> : null}

            {generatedItems.length ? (
              <div className={styles.draftGrid}>
                {generatedItems.map((id) => {
                  const item = catalogue.find((entry) => entry.id === id);
                  const draft = drafts[id];
                  return (
                    <article key={id} className={styles.draftCard}>
                      <div className={styles.draftTop}>
                        <span>{item?.label}</span>
                        <strong>{item?.baseCredits} cr committed</strong>
                      </div>
                      {draft ? Object.entries(draft).map(([key, value]) => (
                        <div className={styles.draftField} key={key}>
                          <span>{key.replaceAll("-", " ")}</span>
                          {Array.isArray(value) ? (
                            <ul>{value.map((line) => <li key={line}>{line}</li>)}</ul>
                          ) : (
                            <p>{value}</p>
                          )}
                        </div>
                      )) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.productionEmpty}>
                <strong>No credits committed yet.</strong>
                <p>Generate the CRM email or vertical video draft from the campaign builder above.</p>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
