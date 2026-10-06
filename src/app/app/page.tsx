import type { Metadata } from "next";
import Link from "next/link";
import { calendar, campaignPlans, currentState, eventLandscape } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildDecisionAlerts, decisionSummary, type DecisionPriority } from "@/lib/decisionIntelligence";
import { getDecisionCenterOpsState } from "@/lib/decisionCenterOverview";
import { buildCalendarRelationships } from "@/lib/calendarIntelligence";
import { getInternalCalendarRelationships } from "@/lib/calendarIntelligenceServer";
import { applyCalendarDecisionPressure } from "@/lib/calendarDecisionPressure";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { DecisionStateBadge, WorkspaceBadge, WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader, type UniversalDecisionState } from "@/components/WorkspaceUI";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Decision Center · AVELA",
  description: "See what changed, what needs attention, why it matters and what AVELA recommends next."
};

const priorityLabel: Record<DecisionPriority, string> = {
  "act-now": "Act now",
  review: "Review",
  blocked: "Blocked",
  "on-track": "On track",
  monitor: "Monitor"
};

const prioritySymbol: Record<DecisionPriority, string> = {
  "act-now": "●",
  review: "●",
  blocked: "■",
  "on-track": "●",
  monitor: "○"
};

function stateForPriority(priority: DecisionPriority): UniversalDecisionState {
  if (priority === "act-now") return "ACT";
  if (priority === "review") return "REVIEW";
  if (priority === "blocked") return "BLOCKED";
  if (priority === "monitor") return "MONITOR";
  return "READY";
}

function shortDate(value: string) {
  if (!value) return "—";
  const parsed = new Date(value.includes("T") ? value : value + "T12:00:00Z");
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export default async function ClubAppHome() {
  const today = currentState.updated_at.slice(0, 10);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a,b) => a.date.localeCompare(b.date))
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
  const calendarRelationships = [...externalCalendarRelationships, ...internalCalendar.relationships];
  const radar = applyCalendarDecisionPressure(opportunityRadar, calendarRelationships);
  const fixtureAlerts = buildDecisionAlerts(
    radar.map((item) => ({ ...item, radarState: item.attentionState }))
  ).map((alert) => {
    const item = alert.fixtureId ? radar.find((candidate) => candidate.fixtureId === alert.fixtureId) : null;
    return item && item.attentionState !== item.radarState
      ? { ...alert, changed: item.attentionReason }
      : alert;
  });

  const horizonEnd = new Date(today + "T00:00:00Z");
  horizonEnd.setUTCDate(horizonEnd.getUTCDate() + 30);
  const horizonEndIso = horizonEnd.toISOString();

  const opsState = await getDecisionCenterOpsState({
    clubId: clubContext?.clubId,
    from: currentState.updated_at,
    to: horizonEndIso
  });

  const priorityWeight: Record<DecisionPriority, number> = {
    blocked: 5,
    "act-now": 4,
    review: 3,
    monitor: 2,
    "on-track": 1
  };
  const alerts = [...opsState.crossAlerts, ...fixtureAlerts]
    .sort((a,b) =>
      priorityWeight[b.priority] - priorityWeight[a.priority]
      || (b.events[0]?.at ?? "").localeCompare(a.events[0]?.at ?? "")
    );
  const summary = decisionSummary(alerts);
  const attention = alerts.filter((item) => ["act-now", "review", "blocked"].includes(item.priority));
  const primary = attention[0] ?? alerts[0] ?? null;
  const recentChanges = alerts
    .flatMap((alert) => alert.events.map((event) => ({ ...event, alert })))
    .sort((a,b) => b.at.localeCompare(a.at))
    .slice(0, 3);

  const activeCampaigns = campaignPlans.campaigns.filter((campaign) =>
    campaign.schedule.some((item) => item.state !== "complete")
  );
  const campaignsAtRisk = activeCampaigns.filter((campaign) =>
    campaign.approvals.some((approval) => approval.state !== "ready")
  ).length;

  const timeline = [
    ...upcoming
      .filter((fixture) => fixture.date <= horizonEndIso.slice(0, 10))
      .map((fixture) => ({
        id: "fixture-" + fixture.id,
        date: fixture.date,
        type: "Fixture",
        title: "London City v " + fixture.opponent,
        detail: fixture.kickoff ? fixture.kickoff + " · " + fixture.venue : fixture.venue
      })),
    ...campaignPlans.campaigns.flatMap((campaign) =>
      campaign.schedule
        .filter((item) => item.date >= today && item.date <= horizonEndIso.slice(0, 10) && item.state !== "complete")
        .map((item, index) => ({
          id: "campaign-" + campaign.fixtureId + "-" + index + "-" + item.date,
          date: item.date,
          type: "Campaign",
          title: item.action.en,
          detail: campaign.title.en
        }))
    ),
    ...calendarRelationships
      .filter((item) => item.date >= today && item.date <= horizonEndIso.slice(0, 10))
      .slice(0, 5)
      .map((item) => ({
        id: "calendar-" + item.id,
        date: item.date,
        type: "Calendar pressure",
        title: item.title,
        detail: item.type.replaceAll("-", " ") + " · " + item.strength
      }))
  ]
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 12);

  const healthTotal = Math.max(1, summary.actNow + summary.review + summary.blocked + summary.onTrack + summary.monitor);
  const actDeg = Math.round((summary.actNow / healthTotal) * 360);
  const reviewDeg = actDeg + Math.round((summary.review / healthTotal) * 360);
  const blockedDeg = reviewDeg + Math.round((summary.blocked / healthTotal) * 360);
  const onTrackDeg = blockedDeg + Math.round((summary.onTrack / healthTotal) * 360);
  const donutBackground = "conic-gradient(#EF8B6C 0deg " + actDeg + "deg,#D78A1E " + actDeg + "deg " + reviewDeg + "deg,#7C8791 " + reviewDeg + "deg " + blockedDeg + "deg,#2F8F83 " + blockedDeg + "deg " + onTrackDeg + "deg,#D8DEE3 " + onTrackDeg + "deg 360deg)";
  const nextFixture = upcoming[0] ?? null;

  return (
    <AppWorkspaceShell
      active="home"
      eyebrow="Decision Center"
      title="Today’s decisions"
      subtitle={summary.attention ? summary.attention + " things need your attention today." : "Everything important is currently under control."}
    >

      <WorkspaceCard className={styles.attentionInbox} tone="action">
        <WorkspaceSectionHeader
          eyebrow="Today"
          title="What needs your attention now"
          action={<span className={styles.inboxCount}>{attention.length} open</span>}
        />
        <div className={styles.attentionList}>
          {attention.slice(0, 5).map((item, index) => (
            <Link href={item.href} key={item.id} className={styles.attentionItem} data-priority={item.priority}>
              <span className={styles.attentionRank}>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.attentionCopy}>
                <div>
                  <strong>{item.title}</strong>
                  <DecisionStateBadge state={stateForPriority(item.priority)} label={priorityLabel[item.priority]} />
                </div>
                <p>{item.recommendation}</p>
                <small>{item.changed}</small>
              </div>
              <div className={styles.attentionMeta}>
                <span>{item.category}</span>
                <strong>{item.deadline}</strong>
                <b>Open →</b>
              </div>
            </Link>
          ))}
          {!attention.length ? <div className={styles.attentionEmpty}>No material decision currently needs intervention.</div> : null}
        </div>
      </WorkspaceCard>

      <section className={`${styles.metricGrid} ${styles.signalStrip}`} aria-label="Decision health summary">
        <WorkspaceCard className={styles.metricCard} tone="action">
          <div><DecisionStateBadge state="ACT" label="Act now" /><span className={styles.metricDelta}>Immediate</span></div>
          <strong>{summary.actNow}</strong>
          <small>Decisions needing action</small>
          <svg viewBox="0 0 100 26" aria-hidden="true"><path d="M2 21 18 18 31 20 45 12 58 15 72 7 98 4"/></svg>
        </WorkspaceCard>
        <WorkspaceCard className={styles.metricCard}>
          <div><DecisionStateBadge state="REVIEW" label="Review" /><span className={styles.metricDelta}>Soon</span></div>
          <strong>{summary.review}</strong>
          <small>Needs a human decision</small>
          <svg viewBox="0 0 100 26" aria-hidden="true"><path d="M2 18 18 17 31 14 45 16 58 11 72 12 98 8"/></svg>
        </WorkspaceCard>
        <WorkspaceCard className={styles.metricCard}>
          <div><DecisionStateBadge state={summary.blocked ? "BLOCKED" : "READY"} label="Blocked" /><span className={styles.metricDelta}>Dependencies</span></div>
          <strong>{summary.blocked}</strong>
          <small>Unresolved blockers</small>
          <svg viewBox="0 0 100 26" aria-hidden="true"><path d="M2 20 18 20 31 18 45 18 58 14 72 14 98 14"/></svg>
        </WorkspaceCard>
        <WorkspaceCard className={styles.metricCard} tone="accent">
          <div><DecisionStateBadge state="READY" label="On track" /><span className={styles.metricDelta}>Healthy</span></div>
          <strong>{summary.onTrack}</strong>
          <small>No intervention required</small>
          <svg viewBox="0 0 100 26" aria-hidden="true"><path d="M2 22 18 19 31 16 45 14 58 12 72 8 98 6"/></svg>
        </WorkspaceCard>
      </section>

      <section className={styles.dashboardGrid}>
        <WorkspaceCard className={`${styles.recommendationCard} ${styles.primaryDecision}`} tone="action">
          <WorkspaceSectionHeader
            eyebrow="Recommendation"
            title="Highest current priority"
            action={primary ? <span className={styles.priorityPill}><DecisionStateBadge state={stateForPriority(primary.priority)} label={priorityLabel[primary.priority]} /></span> : null}
          />
          {primary ? (
            <>
              <div className={styles.recommendationBody}>
                <div>
                  <h2>{primary.title}</h2>
                  <p>{primary.recommendation}</p>
                </div>
                <Link href={primary.href}>Open decision →</Link>
              </div>
              <div className={styles.recommendationMeta}>
                <div><span>Why now</span><strong>{primary.why}</strong></div>
                <div><span>Deadline</span><strong>{primary.deadline}</strong></div>
                <div><span>Impact</span><strong>{primary.impact}</strong></div>
                <div><span>Confidence</span><strong>{primary.confidence}</strong></div>
              </div>
              <details className={styles.inlineExplain}>
                <summary>Why AVELA is recommending this</summary>
                <p><strong>What changed:</strong> {primary.changed}. <strong>Current deadline:</strong> {primary.deadline}.</p>
              </details>
            </>
          ) : <p>No priority decision is currently open.</p>}
        </WorkspaceCard>

        <WorkspaceCard className={styles.attentionCard}>
          <WorkspaceSectionHeader eyebrow="Attention" title="Decision mix" />
          <div className={styles.donutWrap}>
            <div className={styles.donut} style={{ background: donutBackground }}><span><strong>{summary.attention}</strong><small>attention</small></span></div>
            <div className={styles.legend}>
              <span><i data-tone="coral" />Act now <b>{summary.actNow}</b></span>
              <span><i data-tone="warning" />Review <b>{summary.review}</b></span>
              <span><i data-tone="neutral" />Blocked <b>{summary.blocked}</b></span>
              <span><i data-tone="teal" />On track <b>{summary.onTrack}</b></span>
            </div>
          </div>
        </WorkspaceCard>

        <WorkspaceCard className={styles.queueCard}>
          <WorkspaceSectionHeader
            eyebrow="Decision queue"
            title="What should I look at next?"
            action={<Link href="/app/matches">Open full Radar →</Link>}
          />
          <div className={styles.queueList}>
            {alerts.slice(0, 4).map((item) => (
              <Link href={item.href} key={item.id} className={styles.queueRow}>
                <div className={styles.queuePriority}>
                  <span data-state={item.priority}>{prioritySymbol[item.priority]}</span>
                </div>
                <div className={styles.queueMain}>
                  <div><strong>{item.title}</strong><DecisionStateBadge state={stateForPriority(item.priority)} label={priorityLabel[item.priority]} /></div>
                  <p>{item.recommendation}</p>
                </div>
                <div className={styles.queueMeta}>
                  <span>{item.category}</span>
                  <b>{item.deadline}</b>
                </div>
              </Link>
            ))}
          </div>
        </WorkspaceCard>

        <WorkspaceCard className={styles.signalCard}>
          <WorkspaceSectionHeader eyebrow="Signals" title="What changed" action={<Link href="/app/matches">View all →</Link>} />
          <div className={`${styles.signalList} ${styles.changeFeed}`}>
            {recentChanges.map((item) => (
              <Link href={item.alert.href} key={item.id}>
                <span className={styles.signalIcon}>{item.kind.slice(0,1).toUpperCase()}</span>
                <div><strong>{item.label}</strong><small>{item.detail}</small></div>
                <b>{shortDate(item.at)}</b>
              </Link>
            ))}
            {!recentChanges.length ? <p>No recent decision events are available.</p> : null}
          </div>
        </WorkspaceCard>

        <WorkspaceCard className={styles.nextCard} tone="accent">
          <WorkspaceSectionHeader eyebrow="Next opportunity" title={nextFixture ? "London City v " + nextFixture.opponent : "No upcoming home fixture"} action={<Link href="/app/season">Calendar →</Link>} />
          {nextFixture ? (
            <>
              <div className={styles.nextVisual}>
                <span>{shortDate(nextFixture.date)}</span>
                <strong>{nextFixture.kickoff ?? "TBC"}</strong>
                <small>{nextFixture.venue}</small>
              </div>
              <div className={styles.nextTags}>
                <WorkspaceBadge tone="teal">Fixture</WorkspaceBadge>
                <WorkspaceBadge>Audience</WorkspaceBadge>
                <WorkspaceBadge tone="coral">Opportunity</WorkspaceBadge>
              </div>
              <Link className={styles.nextAction} href={"/app/matches/" + nextFixture.id}>Open match workspace →</Link>
            </>
          ) : null}
        </WorkspaceCard>

        <WorkspaceCard className={styles.calendarCard}>
          <WorkspaceSectionHeader eyebrow="Calendar" title="Next 30 days" action={<Link href="/app/season">Month view →</Link>} />
          <div className={styles.calendarStrip}>
            {timeline.slice(0, 7).map((item) => (
              <article key={item.id} data-type={item.type}>
                <time>{shortDate(item.date)}</time>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </article>
            ))}
          </div>
        </WorkspaceCard>

        <div className={styles.readinessWrap}>
          <WorkspaceDrawer label="Club readiness" title="Can the club absorb what is coming?">
            <div className={styles.readinessGrid}>
              <article data-state={opsState.capacity.state}><span>Capacity</span><strong>{opsState.capacity.state}</strong><small>{opsState.capacity.utilisation !== null ? opsState.capacity.utilisation + "% committed" : "Not connected"}</small></article>
              <article data-state={opsState.availability.state}><span>Availability</span><strong>{opsState.availability.state}</strong><small>{opsState.availability.hardUnavailable} hard unavailable</small></article>
              <article data-state={campaignsAtRisk > 0 ? "tight" : "clear"}><span>Campaign execution</span><strong>{activeCampaigns.length} active</strong><small>{campaignsAtRisk} approval risk</small></article>
              <article data-state={opsState.execution.state}><span>Execution sync</span><strong>{opsState.execution.state}</strong><small>{opsState.execution.completedItems}/{opsState.execution.totalItems} items complete</small></article>
              <article data-state={opsState.contracts.state}><span>Verified contracts</span><strong>{opsState.contracts.state}</strong><small>Contract impacts · {opsState.contracts.verifiedClauses} verified clauses</small></article>
              <article data-state={opsState.continuity.state}><span>Team continuity</span><strong>{opsState.continuity.state}</strong><small>{opsState.continuity.openCases} open transitions · Open Team continuity</small></article>
            </div>
          </WorkspaceDrawer>
        </div>
      </section>
    </AppWorkspaceShell>
  );
}
