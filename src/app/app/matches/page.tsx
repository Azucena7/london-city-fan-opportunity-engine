import type { Metadata } from "next";
import Link from "next/link";
import { OpportunityExplorer } from "@/components/OpportunityExplorer";
import { calendar, campaignPlans, currentState, eventLandscape } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildCalendarRelationships } from "@/lib/calendarIntelligence";
import { getInternalCalendarRelationships } from "@/lib/calendarIntelligenceServer";
import { applyCalendarDecisionPressure } from "@/lib/calendarDecisionPressure";
import { AppWorkspaceShell, WorkspaceFilterButton, WorkspaceViewSwitcher } from "@/components/AppWorkspaceShell";
import { WorkspaceBadge, WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./matches.module.css";

export const metadata: Metadata = {
  title: "Opportunity Radar · AVELA",
  description: "Upcoming home fixtures ranked by opportunity potential, confidence and urgency."
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date(value + "T12:00:00"));
}

export default async function MatchesPage() {
  const today = currentState.updated_at.slice(0, 10);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const clubContext = await getCurrentClubOperatingContext();
  const opportunityRadar = buildOpportunityRadar(upcoming.map((fixture) => fixture.id), clubContext);
  const calendarToDate = calendar.map((item) => item.date).sort().at(-1) ?? today;
  const externalCalendarRelationships = buildCalendarRelationships({
    fixtures: calendar,
    campaignPlans,
    eventLandscape,
    fromDate: today
  });
  const internalCalendar = await getInternalCalendarRelationships({
    clubId: clubContext?.clubId,
    fixtures: calendar,
    campaignPlans,
    fromDate: today,
    toDate: calendarToDate
  });
  const radar = applyCalendarDecisionPressure(
    opportunityRadar,
    [...externalCalendarRelationships, ...internalCalendar.relationships]
  );
  const priority = radar[0] ?? null;
  const currentFixture = priority
    ? upcoming.find((fixture) => fixture.id === priority.fixtureId) ?? null
    : null;
  const live = priority ? getCurrentProductOpportunity(priority.fixtureId) : null;
  const radarWithoutCurrent = priority
    ? radar.filter((item) => item.fixtureId !== priority.fixtureId)
    : radar;

  const explorerItems = radar.map((item) => {
    const campaign = campaignPlans.campaigns.find((entry) => entry.fixtureId === item.fixtureId) ?? null;
    const approvalsReady = campaign?.approvals.filter((approval) => approval.state === "ready").length ?? 0;
    const channels = Array.from(new Set((campaign?.activations ?? []).map((activation) => activation.channel)));
    return {
      fixtureId: item.fixtureId,
      opponent: item.opponent,
      date: item.date,
      daysToFixture: item.daysToFixture,
      opportunityScore: item.opportunityScore,
      opportunity: item.opportunity,
      confidence: item.confidence,
      urgency: item.urgency,
      radarState: item.radarState,
      materialSignalCount: item.materialSignalCount,
      recentMaterialSignalCount: item.recentMaterialSignalCount,
      signalCount: item.signalCount,
      decisionState: item.decisionState,
      approvalsReady,
      approvalsTotal: campaign?.approvals.length ?? 0,
      activations: campaign?.activations.length ?? 0,
      channels
    };
  });

  return (
    <AppWorkspaceShell
      active="matches"
      eyebrow="AVELA · Opportunity Radar"
      title="Where should the club act next?"
      subtitle="Fixture opportunity inbox · evidence rank stays separate from calendar pressure."
      actions={<><WorkspaceViewSwitcher value="list" /><WorkspaceFilterButton /></>}
    >
      <p className={styles.contractCopy}>productAppShell · The club does not create a plan first. Fixture → signals → opportunity → recommended play → human review → activation → learning. Monitoring. Upcoming home fixtures are re-prioritised whenever the validated evidence state refreshes.</p>

      <section className={styles.radarSummary} aria-label="Opportunity radar summary">
        <WorkspaceCard><span>Fixtures watched</span><strong>{radar.length}</strong><small>Next home fixtures</small></WorkspaceCard>
        <WorkspaceCard tone="action"><span>Act now</span><strong>{radar.filter((item) => item.attentionState === "Act now").length}</strong><small>Immediate attention</small></WorkspaceCard>
        <WorkspaceCard><span>Review</span><strong>{radar.filter((item) => item.attentionState === "Review").length}</strong><small>Human decision needed</small></WorkspaceCard>
        <WorkspaceCard tone="accent"><span>Monitor</span><strong>{radar.filter((item) => item.attentionState === "Monitor").length}</strong><small>Watch, don’t act yet</small></WorkspaceCard>
        <WorkspaceCard><span>No material opportunity</span><strong>{radar.filter((item) => item.attentionState === "No material opportunity").length}</strong><small>Evidence below threshold</small></WorkspaceCard>
      </section>

      {currentFixture ? (
        <WorkspaceCard className={styles.priorityMatch} tone="action">
          <WorkspaceSectionHeader
            eyebrow="Current engine priority"
            title={"London City v " + currentFixture.opponent}
            action={<WorkspaceBadge tone={priority?.attentionState === "Act now" ? "coral" : priority?.attentionState === "Review" ? "warning" : "teal"}>{priority?.attentionState ?? "Monitor"}</WorkspaceBadge>}
          />
          <div className={styles.priorityGrid}>
            <div className={styles.priorityDecision}>
              <div className={styles.priorityDate}>
                <span>{formatDate(currentFixture.date)}</span>
                <strong>{currentFixture.kickoff ?? "TBC"}</strong>
                <small>{currentFixture.competition} · {currentFixture.venue}</small>
              </div>
              <div>
                <span>Growth opportunity</span>
                <h2>{live?.opportunity ?? "Review current evidence."}</h2>
                <p><b>Do next:</b> {live?.nextAction.label ?? "No action is currently required."}</p>
                <p className={styles.contractInline}><b>Attention driver:</b> {priority?.attentionReason ?? "No calendar pressure adjustment."}</p>
              </div>
              <Link href={`/app/matches/${currentFixture.id}`}>Open opportunity brief →</Link>
            </div>

            <div className={styles.priorityMetrics}>
              <div><span>Opportunity score</span><strong>{priority?.opportunityScore ?? "—"}</strong></div>
              <div><span>Confidence</span><strong>{live?.confidence.label ?? "—"}</strong></div>
              <div><span>Calendar pressure</span><strong>{priority?.calendarPressure.state ?? "—"}</strong></div>
              <div><span>Signal movement</span><strong>{priority?.signalChangeLabel ?? "—"}</strong></div>
            </div>

            <div className={styles.priorityWhy}>
              <div><span>Why now</span><strong>{live?.whyNow ?? "Current fixture evidence is still being assessed."}</strong></div>
              {priority?.clubFit ? (
                <div>
                  <span>Club fit · advisory only</span>
                  <strong>{priority.clubFit.summary}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </WorkspaceCard>
      ) : null}

      <section className={styles.workspaceGrid}>
        <WorkspaceCard className={styles.inboxCard}>
          <WorkspaceSectionHeader
            eyebrow="Next opportunities"
            title="Ranked by what deserves attention now"
            action={<span className={styles.refresh}>Refresh · {new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</span>}
          />
          <div className={styles.radarList}>
            {radarWithoutCurrent.map((item, index) => (
              <Link href={"/app/matches/" + item.fixtureId} className={[styles.radarFixture, styles.futureFixture].join(" ")} key={item.fixtureId}>
                <div className={styles.radarRank}>#{index + 2}</div>
                <div className={styles.radarMatch}>
                  <span>{formatDate(item.date)} · {item.kickoff ?? "TBC"}</span>
                  <strong>{item.opponent}</strong>
                  <small>{item.competition}</small>
                </div>
                <div className={styles.radarOpportunity}>
                  <span>{item.opportunityLabel}</span>
                  <strong>{item.opportunity}</strong>
                  <small>{item.materialSignalCount} material · {item.signalCount} total signals</small>
                </div>
                <div className={styles.radarScoreline}>
                  <div><span>Score</span><strong>{item.opportunityScore ?? "—"}</strong></div>
                  <div><span>Urgency</span><strong>{item.urgency}</strong></div>
                  <div><span>Calendar</span><strong>{item.calendarPressure.state}</strong></div>
                </div>
                <div className={styles.radarState}>
                  <WorkspaceBadge tone={item.attentionState === "Act now" ? "coral" : item.attentionState === "Review" ? "warning" : item.attentionState === "No material opportunity" ? "neutral" : "teal"}>{item.attentionState}</WorkspaceBadge>
                  <small>Opportunity state · {item.radarState}</small>
                  <small>{item.attentionReason}</small>
                </div>
              </Link>
            ))}
          </div>
        </WorkspaceCard>

        <aside className={styles.sideRail}>
          <WorkspaceCard className={styles.clubFitCard}>
            <WorkspaceSectionHeader eyebrow="Club context" title={clubContext ? clubContext.clubName : "Evidence-only mode"} />
            {clubContext ? (
              <>
                <p><strong>Context explains fit. Evidence still sets the priority.</strong></p>
                <p>This context never changes the radar rank, confidence or evidence state.</p>
                <div className={styles.clubFitFacts}>
                  <div><span>Objectives</span><strong>{clubContext.priorityObjectives.length}</strong></div>
                  <div><span>Channels</span><strong>{clubContext.connectedChannels.length}</strong></div>
                  <div><span>Fixture source</span><strong>{clubContext.fixtureSource}</strong></div>
                </div>
              </>
            ) : (
              <>
                <p>Opportunity Radar is running without saved club context.</p>
                <Link href="/app/setup">Open Setup →</Link>
              </>
            )}
          </WorkspaceCard>

          <WorkspaceDrawer label="Visual analysis" title="Opportunity Explorer">
            <OpportunityExplorer items={explorerItems} />
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Specialisation" title="Women’s-football lens">
            <p>AVELA classifies sourced signals into women’s-football-relevant lenses only when evidence supports them.</p>
            <p>Club fit does not affect rank. The lens helps interpretation, not score inflation.</p>
          </WorkspaceDrawer>
        </aside>
      </section>

      <details className={styles.evidenceContract}>
        <summary>How Radar prioritisation works</summary>
        <div>
          <p><strong>Opportunity potential</strong> is evidence-led. <strong>Calendar pressure</strong> can elevate attention without changing opportunity score.</p>
          <p>Signals, confidence, urgency and calendar constraints stay inspectable inside each fixture workspace. The ranking is a decision aid, not an attendance forecast.</p>
        </div>
      </details>
    </AppWorkspaceShell>
  );
}
