import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
import { ImpactScenario } from "@/components/ImpactScenario";
import { MatchSignalControls } from "@/components/MatchSignalControls";
import { ActivationDraft } from "@/components/ActivationDraft";
import { MatchPlanDecision } from "@/components/MatchPlanDecision";
import { CampaignCreditBuilder } from "@/components/CampaignCreditBuilder";
import { calendar, campaignPlans } from "@/lib/data";
import { getCurrentImpactDefaults } from "@/lib/productImpactDefaults";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import styles from "./match-plan.module.css";

export const metadata: Metadata = {
  title: "Opportunity Brief · AVELA",
  description: "One fixture workspace for the opportunity, recommended play, activation, signals, evidence and impact."
};

export default async function MatchPlanPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = await params;
  const fixture = calendar.find((item) => item.id === fixtureId && item.homeAway === "home");
  if (!fixture) notFound();

  const live = getCurrentProductOpportunity(fixtureId);
  if (!live) notFound();

  const campaign = campaignPlans.campaigns.find((item) => item.fixtureId === fixtureId) ?? null;
  const clubContext = await getCurrentClubOperatingContext();
  const clubFit = buildOpportunityRadar([fixtureId], clubContext)[0]?.clubFit ?? null;
  const defaults = getCurrentImpactDefaults(fixtureId);
  const actions = campaign?.schedule.filter((item) => item.state !== "complete").slice(0, 3) ?? [];
  const approvals = campaign?.approvals.filter((item) => item.state !== "ready") ?? [];
  const activationChannels = campaign?.activations.map((item) => item.channel) ?? [];
  const connectedActivationRoutes = clubContext
    ? Array.from(new Set(clubContext.connectedChannels.filter((channel) => {
        const text = activationChannels.join(" ");
        if (channel === "CRM" || channel === "Email") return /crm|email/i.test(text);
        if (channel === "Instagram" || channel === "Facebook" || channel === "TikTok") return /social|organic|video/i.test(text);
        if (channel === "Web") return /web|ticket|owned/i.test(text);
        if (channel === "Push" || channel === "SMS") return /push|sms|reminder/i.test(text);
        return false;
      })))
    : [];
  const handoffActivations = campaign?.activations.filter((activation) => {
    if (!clubContext) return false;
    const channel = activation.channel;
    if (/crm|email/i.test(channel)) return !clubContext.connectedChannels.some((item) => item === "CRM" || item === "Email");
    if (/social|organic|video/i.test(channel)) return !clubContext.connectedChannels.some((item) => ["Instagram", "Facebook", "TikTok"].includes(item));
    if (/web|ticket|owned/i.test(channel)) return !clubContext.connectedChannels.includes("Web");
    return true;
  }) ?? [];

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="matches" />

      <div className={styles.backRow}>
        <Link href="/app/matches">← All matches</Link>
        <span>{live.timingLabel}</span>
      </div>

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Next home match · {fixture.competition}</span>
          <h1>London City <small>v</small> {fixture.opponent}</h1>
          <p>{fixture.date} · {fixture.kickoff ?? "TBC"} · {fixture.venue}</p>
        </div>
        <aside className={`${styles.stateCard} ${live.decisionState === "HOLD" ? styles.holdState : styles.readyState}`}>
          <span>Plan state</span>
          <strong>{live.decisionState}</strong>
          <p>{live.confidence.label} confidence · {live.liveSignals.length} sourced signals</p>
        </aside>
      </header>

      <section className={styles.decisionCockpit} aria-label="Decision at a glance">
        <div className={styles.decisionLead}>
          <span className={styles.eyebrow}>Recommended play</span>
          <h2>{campaign?.title.en ?? live.opportunity}</h2>
          <p>{live.whyNow}</p>
          <a href="#campaign">Build this campaign →</a>
        </div>

        <div className={styles.decisionFacts}>
          <article>
            <span>Opportunity</span>
            <strong>{live.opportunity}</strong>
          </article>
          <article>
            <span>Audience</span>
            <strong>{live.audience.value !== null ? live.audience.value.toLocaleString("en-GB") + " measured fans" : campaign?.audiences[0]?.label.en ?? "Requires club data"}</strong>
          </article>
          <article>
            <span>Confidence</span>
            <strong>{live.confidence.label}</strong>
            <small>{live.liveSignals.length} sourced signals</small>
          </article>
          <article>
            <span>Next action</span>
            <strong>{live.nextAction.label}</strong>
            <small>{approvals.length ? live.primaryBlocker : "No blocking gate"}</small>
          </article>
        </div>
      </section>

      <section className={styles.opportunityBrief} aria-label="Opportunity brief">
        <div className={styles.briefIntro}>
          <span className={styles.eyebrow}>Opportunity brief</span>
          <h2>Why this fixture deserves attention — and what would make us change course.</h2>
          <p>
            AVELA separates the opportunity from the evidence behind it. The brief is designed to support a club decision,
            not to make the decision automatically.
          </p>
        </div>

        <div className={styles.briefGrid}>
          <article>
            <span>Why now</span>
            <strong>{live.whyNow}</strong>
          </article>
          <article>
            <span>Audience to unlock</span>
            <strong>{campaign?.audiences[0]?.label.en ?? live.audience.label}</strong>
            <small>{live.audience.state === "measured" ? "Measured club cohort" : "Requires club data to size precisely"}</small>
          </article>
          <article>
            <span>Recommended play</span>
            <strong>{live.recommendedAction}</strong>
          </article>
          <article className={styles.briefRisk}>
            <span>Primary risk / blocker</span>
            <strong>{live.primaryBlocker}</strong>
            <small>{approvals.length ? `${approvals.length} unresolved approval gate${approvals.length === 1 ? "" : "s"}` : "No blocking approval gate currently recorded"}</small>
          </article>
        </div>

        <details className={styles.changeCourse}>
          <summary>What would make AVELA change this recommendation?</summary>
          <ul>
            {live.whatWouldChangeDecision.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </details>
      </section>

      {clubContext ? (
        <section className={styles.clubExecutionContext} aria-label="Club execution context">
          <div className={styles.clubExecutionIntro}>
            <span className={styles.eyebrow}>Club context · advisory layer</span>
            <h2>How this play fits the club&apos;s real operating setup.</h2>
            <p>
              Evidence still determines the opportunity. Club setup only explains strategic fit, executable routes,
              approval defaults and brand constraints before the campaign is built.
            </p>
          </div>

          <div className={styles.clubExecutionGrid}>
            <article>
              <span>Strategic fit</span>
              <strong>{clubFit?.summary ?? "No saved objective match detected."}</strong>
              <small>Does not change rank or confidence.</small>
            </article>
            <article>
              <span>Connected execution</span>
              <strong>{connectedActivationRoutes.length ? connectedActivationRoutes.join(" · ") : "No connected route inferred"}</strong>
              <small>{handoffActivations.length} activation{handoffActivations.length === 1 ? "" : "s"} still require handoff.</small>
            </article>
            <article>
              <span>Approval default</span>
              <strong>{clubContext.approvalRequired === false ? "Flexible club default" : "Approval required"}</strong>
              <small>{clubContext.approvalOwner ? `Default owner · ${clubContext.approvalOwner}` : "Fixture-specific approval gates still apply."}</small>
            </article>
            <article>
              <span>Brand guardrail</span>
              <strong>{clubContext.brandTone ?? "No saved tone rule"}</strong>
              <small>{clubContext.brandMustAvoid ?? "No saved must-avoid rule"}</small>
            </article>
          </div>

          {handoffActivations.length ? (
            <div className={styles.handoffList}>
              <span>Manual / connector handoff</span>
              <ul>{handoffActivations.map((activation) => <li key={activation.id}>{activation.title.en} · {activation.channel}</li>)}</ul>
            </div>
          ) : null}
        </section>
      ) : (
        <section className={styles.clubExecutionEmpty}>
          <span>Evidence-only brief</span>
          <strong>No authenticated club setup is available for this workspace.</strong>
          <p>The recommended play is still evidence-backed, but execution routes, approval defaults and brand rules cannot be personalised yet.</p>
          <Link href="/app/setup">Configure club setup →</Link>
        </section>
      )}

      <div id="campaign">
      <CampaignCreditBuilder
        objective={campaign?.objective.en ?? live.opportunity}
        audience={campaign?.audiences[0]?.label.en ?? live.audience.label}
        proposition={campaign?.proposition.en ?? live.recommendedAction}
        unresolvedGates={approvals.length}
        fixtureId={fixture.id}
      />
      </div>

      <section className={styles.actionsSection} id="approval-gates">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.eyebrow}>Do now</span>
            <h2>Review the draft, then execute the next actions.</h2>
          </div>
          <span>{approvals.length} unresolved gates</span>
        </div>

        <ActivationDraft
          campaign={campaign}
          fallbackOwner={live.nextAction.owner}
          fallbackMeasurement={live.nextAction.measurement}
        />

        <div className={styles.actionGrid}>
          {(actions.length ? actions : [{
            window: live.timingLabel,
            date: live.fixture.date,
            action: { en: live.nextAction.label, es: live.nextAction.label },
            state: "planned" as const
          }]).map((item, index) => (
            <article key={item.window + item.date}>
              <span>{String(index + 1).padStart(2, "0")} · {item.window}</span>
              <h3>{item.action.en}</h3>
              <p>{item.date}</p>
              <b>{item.state.replaceAll("-", " ")}</b>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.signalsSection}>
        <details className={styles.reasoningDetails}>
          <summary>
            <div>
              <span className={styles.eyebrow}>Why this plan</span>
              <strong>{live.liveSignals.length} signals · {live.confidence.label} confidence</strong>
            </div>
            <span>Review signals and evidence →</span>
          </summary>

          <div className={styles.reasoningBody}>
            <MatchSignalControls
              signals={live.liveSignals}
              baseRecommendation={live.recommendedAction}
            />

            <details className={styles.evidenceDetails}>
              <summary>Inspect evidence, assumptions and missing inputs</summary>
              <ProductDataStateLegend />
              <div className={styles.evidenceGrid}>
                <article><span>Known</span><ul>{live.known.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul></article>
                <article><span>Assumed</span><ul>{live.assumptions.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul></article>
                <article><span>Missing</span><ul>{live.missing.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul></article>
              </div>
              <div className={styles.changeDecision}>
                <span>What would change the recommendation?</span>
                <ul>{live.whatWouldChangeDecision.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </details>
          </div>
        </details>
      </section>

      <section className={styles.impactSection}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.eyebrow}>Commercial impact</span>
            <h2>{live.audience.value !== null ? live.audience.value.toLocaleString("en-GB") + " measured fans in the addressable cohort." : "Commercial impact still needs club data."}</h2>
          </div>
          <span>Scenario, not forecast.</span>
        </div>

        <details className={styles.impactDetails}>
          <summary>Open editable impact scenario</summary>
          <ImpactScenario
            fixtureLabel={`London City vs ${fixture.opponent}`}
            liveAudience={defaults.audience}
            liveAudienceState={defaults.audienceSource === "measured" ? "measured" : "requires-club-data"}
            observedConversionRate={defaults.conversionRate}
            observedConversionLabel={defaults.conversionLabel}
            observedTicketValue={defaults.ticketValue}
            observedTicketValueLabel={defaults.ticketValueLabel}
          />
        </details>
      </section>

      <MatchPlanDecision
        decisionState={live.decisionState}
        blockerCount={approvals.length}
        nextApproval={campaign?.nextApproval.en ?? live.primaryBlocker}
        signalCount={live.liveSignals.length}
      />

      <section className={styles.footerActions}>
        <div>
          <span className={styles.eyebrow}>After matchday</span>
          <h2>The same fixture becomes the learning record.</h2>
        </div>
        <Link href={`/app/learning?fixture=${fixture.id}`}>Open measurement & learning →</Link>
      </section>
    </main>
  );
}
