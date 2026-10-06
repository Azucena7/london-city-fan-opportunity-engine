import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { DecisionContextTrail } from "@/components/DecisionContextTrail";
import { DecisionHandoffStrip } from "@/components/DecisionHandoffStrip";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
import { ImpactScenario } from "@/components/ImpactScenario";
import { MatchSignalControls } from "@/components/MatchSignalControls";
import { ActivationDraft } from "@/components/ActivationDraft";
import { MatchPlanDecision } from "@/components/MatchPlanDecision";
import { CampaignDeliveryPlanner } from "@/components/CampaignDeliveryPlanner";
import { DecisionHistoryPanel } from "@/components/DecisionHistoryPanel";
import { SimilarDecisionsPanel } from "@/components/SimilarDecisionsPanel";
import { AskAvelaPanel } from "@/components/AskAvelaPanel";
import { OperationalHandoffs } from "@/components/OperationalHandoffs";
import { AvailabilityPlanner } from "@/components/AvailabilityPlanner";
import { CalendarSlotFinder } from "@/components/CalendarSlotFinder";
import { OperationalCapacityPanel } from "@/components/OperationalCapacityPanel";
import { MatchdayCompanionWidget } from "@/components/MatchdayCompanionWidget";
import { ExternalWorkPackagePreview } from "@/components/ExternalWorkPackagePreview";
import { ExternalExecutionSync } from "@/components/ExternalExecutionSync";
import { WorkRoutingPlan } from "@/components/WorkRoutingPlan";
import { WorkHandoffConfirmation } from "@/components/WorkHandoffConfirmation";
import { calendar, campaignPlans, currentState } from "@/lib/data";
import { getCurrentImpactDefaults } from "@/lib/productImpactDefaults";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { deriveCampaignWorkPackage } from "@/lib/workSystemOrchestration";
import { routeWorkPackage } from "@/lib/workSystemRouting";
import { getWorkRoutingRules } from "@/lib/workSystemRoutingServer";
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
  const radarItem = buildOpportunityRadar([fixtureId], clubContext)[0] ?? null;
  const clubFit = radarItem?.clubFit ?? null;
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
  const workPackage = campaign
    ? deriveCampaignWorkPackage({ campaign, decisionId: `fixture:${fixture.id}` })
    : null;
  const workRoutingRules = await getWorkRoutingRules(clubContext?.clubId);
  const workRoutingPlan = workPackage
    ? routeWorkPackage({ workPackage, rules: workRoutingRules })
    : null;
  const workDependencyCount = workPackage
    ? workPackage.items.reduce((sum, item) => sum + item.dependencyKeys.length, 0)
    : approvals.length + handoffActivations.length;

  return (
    <AppWorkspaceShell
      active="matches"
      eyebrow="Fixture workspace"
      title={`London City v ${fixture.opponent}`}
      subtitle={`${fixture.date} · ${fixture.kickoff ?? "TBC"} · ${fixture.competition}`}
      actions={<Link className={styles.workspaceAction} href={`/app/executive?fixture=${fixture.id}`}>Executive view</Link>}
    >
      <DecisionContextTrail
        fixtureLabel={"London City v " + fixture.opponent}
        fixtureHref={"/app/matches/" + fixture.id}
        campaignLabel={campaign?.title.en ?? null}
        campaignId={campaign?.id ?? null}
        current="Decision workspace"
      />
      <DecisionHandoffStrip active="decision" fixtureId={fixture.id} campaignId={campaign?.id ?? null} />
      <div className={styles.shell}>

      <div className={styles.backRow}>
        <Link href="/app/matches">← All matches</Link>
        <span>{live.timingLabel}</span>
      </div>

      <nav className={styles.contextNav} aria-label="Opportunity workspace sections">
        <div>
          <span>{fixture.opponent}</span>
          <strong>{live.decisionState} · {live.confidence.label} confidence</strong>
        </div>
        <div className={styles.contextLinks}>
          <Link className={styles.executiveLink} href={`/app/executive?fixture=${fixture.id}`}>Executive view</Link>
          <a href="#decision">01 Decide</a>
          <a href="#readiness">02 Feasibility</a>
          <a href="#execute">03 Build</a>
          <a href="#evidence">04 Evidence</a>
          <a href="#learning">06 Learn</a>
        </div>
      </nav>

      <section id="decision" className={styles.decisionCockpit} aria-label="Decision at a glance">
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
            <span>Commercial objective</span>
            <strong>{campaign?.objective.en ?? live.opportunity}</strong>
            <small>{live.measurementEvidence.label} · {live.measurementEvidence.detail}</small>
          </article>
          <article>
            <span>Why now</span>
            <strong>{live.whyNow}</strong>
            <small>{live.confidence.rationale}</small>
          </article>
          <article>
            <span>Audience to unlock</span>
            <strong>{campaign?.audiences[0]?.label.en ?? live.audience.label}</strong>
            <small>{live.audience.state === "measured" ? "Measured club cohort" : "Requires club data to size precisely"}</small>
          </article>
          <article>
            <span>Recommended play</span>
            <strong>{live.recommendedAction}</strong>
            <small>Next owner · {live.nextAction.owner} · {live.nextAction.deadline}</small>
          </article>
          <article>
            <span>Evidence used</span>
            <strong>{live.liveSignals.length ? live.liveSignals.slice(0, 3).map((signal) => signal.title).join(" · ") : "No fixture-specific sourced signal yet"}</strong>
            <small>{live.liveSignals.length ? "Open the signal review below to inspect sources or run a what-if." : "Recommendation should remain under review until evidence improves."}</small>
          </article>
          <article className={styles.briefRisk}>
            <span>Primary risk / blocker</span>
            <strong>{live.primaryBlocker}</strong>
            <small>{approvals.length ? `${approvals.length} unresolved approval gate${approvals.length === 1 ? "" : "s"}` : "No blocking approval gate currently recorded"}</small>
          </article>
        </div>

        <div className={styles.briefDecision}>
          <div>
            <span>Decision support, not autopilot</span>
            <strong>{live.decisionState === "HOLD" ? "Do not launch yet." : "Ready for human review."}</strong>
          </div>
          <p>{live.decisionState === "HOLD" ? live.primaryBlocker : "The evidence supports review, but club approval still controls activation."}</p>
        </div>

        <details className={styles.changeCourse}>
          <summary>What would make AVELA change this recommendation?</summary>
          <ul>
            {live.whatWouldChangeDecision.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </details>
      </section>

      <details className={styles.phasePanel}>
        <summary><span>02</span><div><strong>Feasibility</strong><small>Availability, timing, capacity and club constraints.</small></div><b>Open phase →</b></summary>
      <section id="readiness" className={styles.phaseIntro} aria-label="Decision readiness">
        <div>
          <span className={styles.phaseNumber}>02</span>
          <div>
            <span className={styles.eyebrow}>Can we actually do it?</span>
            <h2>Check availability, timing and capacity before the club commits.</h2>
          </div>
        </div>
        <p>AVELA should not recommend an attractive idea that cannot survive the club&apos;s real calendar, player constraints or workload.</p>
      </section>

      <AvailabilityPlanner
        fixtureDate={fixture.date}
        fixtureLabel={`London City v ${fixture.opponent}`}
      />

      <CalendarSlotFinder
        fixtureDate={fixture.date}
        fixtureLabel={`London City v ${fixture.opponent}`}
      />

      <OperationalCapacityPanel
        windowStart={currentState.updated_at}
        windowEnd={`${fixture.date}T23:59:59Z`}
        plan={{
          estimatedMinutes: workPackage?.estimatedMinutes ?? Math.max(120, (campaign?.schedule.length ?? 1) * 75 + (campaign?.activations.length ?? 0) * 90),
          taskCount: workPackage?.items.length ?? campaign?.schedule.length ?? Math.max(1, actions.length),
          dependencyCount: workDependencyCount,
          teamCount: Math.max(1, new Set([live.nextAction.owner, ...activationChannels]).size),
          approvalCount: approvals.length,
          daysAvailable: Math.max(0, live.daysToFixture),
          externalParties: handoffActivations.length,
          unknownInputs: Math.min(5, live.missing.length)
        }}
      />

      <MatchdayCompanionWidget
        fixtureId={fixture.id}
        fixtureLabel={`London City v ${fixture.opponent}`}
        venue={fixture.venue}
        fixtureDate={fixture.date}
      />

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

      </details>

      <details className={styles.phasePanel}>
        <summary><span>03</span><div><strong>Build & route</strong><small>Campaign plan, owners, approvals and handoffs.</small></div><b>Open phase →</b></summary>
      <section id="execute" className={styles.phaseIntro} aria-label="Execution plan">
        <div>
          <span className={styles.phaseNumber}>03</span>
          <div>
            <span className={styles.eyebrow}>Make the decision executable</span>
            <h2>Turn the recommendation into a plan, owners and handoffs.</h2>
          </div>
        </div>
        <p>AVELA prepares the work and routes requests, while the club keeps final control over what is committed and launched.</p>
      </section>

      <div id="campaign">
      <CampaignDeliveryPlanner
        objective={campaign?.objective.en ?? live.opportunity}
        audience={campaign?.audiences[0]?.label.en ?? live.audience.label}
        proposition={campaign?.proposition.en ?? live.recommendedAction}
        unresolvedGates={approvals.length}
        fixtureId={fixture.id}
      />
      </div>

      {workPackage ? <ExternalWorkPackagePreview workPackage={workPackage} /> : null}

      {workRoutingPlan ? <WorkRoutingPlan plan={workRoutingPlan} /> : null}

      {workPackage && workRoutingPlan ? (
        <WorkHandoffConfirmation
          decisionId={`fixture:${fixture.id}`}
          workPackage={workPackage}
          plan={workRoutingPlan}
        />
      ) : null}

      <ExternalExecutionSync decisionId={`fixture:${fixture.id}`} />

      <OperationalHandoffs
        decisionId={`fixture:${fixture.id}`}
        fixtureLabel={`London City v ${fixture.opponent}`}
        eventAt={fixture.date ? `${fixture.date}T${fixture.kickoff ?? "12:00"}:00` : null}
        recommendation={campaign?.title.en ?? live.recommendedAction}
      />

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

      </details>

      <details className={styles.phasePanel}>
        <summary><span>04</span><div><strong>Evidence & impact</strong><small>Challenge the signals, assumptions and commercial scenario.</small></div><b>Open phase →</b></summary>
      <section id="evidence" className={styles.phaseIntro} aria-label="Evidence and reasoning">
        <div>
          <span className={styles.phaseNumber}>04</span>
          <div>
            <span className={styles.eyebrow}>Why AVELA thinks this</span>
            <h2>Inspect the evidence, assumptions and missing context behind the recommendation.</h2>
          </div>
        </div>
        <p>The user can challenge the recommendation without losing the original evidence trail.</p>
      </section>

      <section id="signals" className={styles.signalsSection}>
        <details className={styles.reasoningDetails}>
          <summary>
            <div>
              <span className={styles.eyebrow}>Why this plan</span>
              <strong>{live.liveSignals.length} signals · {live.confidence.label} confidence · test the recommendation</strong>
            </div>
            <span>Inspect, exclude & recalculate →</span>
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

      <section id="impact" className={styles.impactSection}>
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

      </details>

      <details className={styles.phasePanel}>
        <summary><span>05</span><div><strong>Human decision</strong><small>Approve, modify or hold before any external launch.</small></div><b>Open phase →</b></summary>
      <section className={styles.phaseIntro} aria-label="Human decision">
        <div>
          <span className={styles.phaseNumber}>05</span>
          <div>
            <span className={styles.eyebrow}>Human decision</span>
            <h2>Approve, modify or hold — then record what actually happened.</h2>
          </div>
        </div>
        <p>Recommendation, club decision and execution stay separate so AVELA can learn from the difference.</p>
      </section>

      <MatchPlanDecision
        decisionState={live.decisionState}
        blockerCount={approvals.length}
        nextApproval={campaign?.nextApproval.en ?? live.primaryBlocker}
        signalCount={live.liveSignals.length}
      />

      </details>

      <details className={styles.phasePanel}>
        <summary><span>06</span><div><strong>Decision memory</strong><small>Preserve what AVELA recommended, what the club chose and what happened.</small></div><b>Open phase →</b></summary>
      <section className={styles.phaseIntro} aria-label="Decision memory">
        <div>
          <span className={styles.phaseNumber}>06</span>
          <div>
            <span className={styles.eyebrow}>Decision memory</span>
            <h2>Preserve the recommendation, the club&apos;s choice and the outcome.</h2>
          </div>
        </div>
        <p>This is the institutional memory that makes the next comparable decision better.</p>
      </section>
      <SimilarDecisionsPanel fixtureId={fixture.id} />

      <DecisionHistoryPanel
        decisionId={`fixture:${fixture.id}`}
        subjectType="fixture"
        subjectId={fixture.id}
        recommendation={campaign?.title.en ?? live.recommendedAction}
      />

      <AskAvelaPanel fixtureId={fixture.id} decisionId={`fixture:${fixture.id}`} />

      </details>

      <section id="learning" className={styles.footerActions}>
        <div>
          <span className={styles.eyebrow}>After matchday</span>
          <h2>The same fixture becomes the learning record.</h2>
        </div>
        <Link href={`/app/learning?fixture=${fixture.id}`}>Open measurement & learning →</Link>
      </section>
      </div>
    </AppWorkspaceShell>
  );
}
