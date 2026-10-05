import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { calendar, campaignPlans, currentState, eventLandscape } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildDecisionAlerts, decisionSummary, type DecisionPriority } from "@/lib/decisionIntelligence";
import { getDecisionCenterOpsState } from "@/lib/decisionCenterOverview";
import { buildCalendarRelationships } from "@/lib/calendarIntelligence";
import { getInternalCalendarRelationships } from "@/lib/calendarIntelligenceServer";
import { applyCalendarDecisionPressure } from "@/lib/calendarDecisionPressure";
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

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="home" />

      <header className={styles.header}>
        <div>
          <span>AVELA · Decision Center</span>
          <h1>{summary.attention ? `${summary.attention} thing${summary.attention === 1 ? "" : "s"} need your attention.` : "Everything important is currently under control."}</h1>
          <p>Start here. AVELA brings together current evidence, calendar pressure, capacity, blockers and deadlines so you can see what changed and what to do next without opening every workspace.</p>
        </div>
        <div className={styles.refresh}>
          <span>Engine refresh</span>
          <strong>{new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</strong>
        </div>
      </header>

      <section className={styles.signalStrip} aria-label="Decision health summary">
        <article className={styles.stateAct}><span>● Act now</span><strong>{summary.actNow}</strong><small>Immediate decisions</small></article>
        <article className={styles.stateReview}><span>● Review</span><strong>{summary.review}</strong><small>Needs a decision soon</small></article>
        <article className={styles.stateBlocked}><span>■ Blocked</span><strong>{summary.blocked}</strong><small>Dependency unresolved</small></article>
        <article className={styles.stateGood}><span>● On track</span><strong>{summary.onTrack}</strong><small>No intervention required</small></article>
        <article className={styles.stateMonitor}><span>○ Monitor</span><strong>{summary.monitor}</strong><small>Keep watching</small></article>
      </section>

      {primary ? (
        <section className={styles.primaryDecision} aria-label="Highest priority decision">
          <div className={styles.primaryTop}>
            <div>
              <span className={styles.priorityPill} data-state={primary.priority}>{prioritySymbol[primary.priority]} {priorityLabel[primary.priority]}</span>
              <small>Highest current priority · {primary.category}</small>
            </div>
            <Link href={primary.href}>Open decision →</Link>
          </div>
          <div className={styles.primaryGrid}>
            <div>
              <h2>{primary.title}</h2>
              <p className={styles.recommendation}>{primary.recommendation}</p>
            </div>
            <div className={styles.decisionFacts}>
              <div><span>Why</span><strong>{primary.why}</strong></div>
              <div><span>Changed</span><strong>{primary.changed}</strong></div>
              <div className={styles.factRow}>
                <p><span>Deadline</span><strong>{primary.deadline}</strong></p>
                <p><span>Impact</span><strong>{primary.impact}</strong></p>
                <p><span>Confidence</span><strong>{primary.confidence}</strong></p>
              </div>
            </div>
          </div>
          <details className={styles.whyPanel}>
            <summary>Why AVELA is recommending this</summary>
            <div>
              <p>{primary.why}</p>
              <p><strong>What changed:</strong> {primary.changed}.</p>
              <p><strong>Current deadline:</strong> {primary.deadline}.</p>
            </div>
          </details>
        </section>
      ) : null}

      <section className={styles.workspaceGrid} aria-label="Opportunity Radar, Campaign execution, Club context, Learning and AVELA decision loop summary">
        <div className={styles.queue}>
          <div className={styles.sectionHead}>
            <div><span>Decision queue</span><h2>What should I look at next?</h2></div>
            <Link href="/app/matches">Open full Radar →</Link>
          </div>
          <div className={styles.alertList}>
            {alerts.slice(0, 3).map((item) => (
              <article className={styles.alertCard} key={item.id}>
                <div className={styles.alertState}>
                  <span className={styles.priorityPill} data-state={item.priority}>{prioritySymbol[item.priority]} {priorityLabel[item.priority]}</span>
                  <small>{item.category}</small>
                </div>
                <div className={styles.alertBody}>
                  <h3>{item.title}</h3>
                  <strong>{item.recommendation}</strong>
                  <p>{item.changed}</p>
                </div>
                <div className={styles.alertMeta}>
                  <span><b>{item.impact}</b> impact</span>
                  <span><b>{item.confidence}</b> confidence</span>
                  <span><b>{item.deadline}</b> deadline</span>
                  <Link href={item.href}>Open →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.changes}>
          <div className={styles.sectionHead}>
            <div><span>What changed</span><h2>Latest intelligence</h2></div>
          </div>
          <div className={styles.changeFeed}>
            {recentChanges.map((item) => (
              <Link href={item.alert.href} key={item.id}>
                <span>{item.kind}</span>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
                <small>{shortDate(item.at)} · {item.alert.title}</small>
              </Link>
            ))}
            {!recentChanges.length ? <p>No recent decision events are available.</p> : null}
          </div>
        </aside>
      </section>

      <section className={styles.clubState} aria-label="Club state overview">
        <div className={styles.sectionHead}>
          <div><span>Club state</span><h2>Can the club absorb what is coming?</h2></div>
          <p>Each source resolves independently. Missing integrations stay unknown instead of wiping out connected evidence.</p>
        </div>
        <div className={styles.clubStateGrid}>
          <article data-state={opsState.capacity.state}>
            <span>Operational capacity</span>
            <strong>{opsState.capacity.state === "unknown" ? "Unknown" : opsState.capacity.state === "overloaded" ? "Overloaded" : opsState.capacity.state === "tight" ? "Tight" : "Available"}</strong>
            <p>{opsState.capacity.utilisation !== null ? opsState.capacity.utilisation + "% of recorded capacity committed" : "Capacity evidence is not connected for this window."}</p>
            <small>{opsState.capacity.blockers} blocked workload item{opsState.capacity.blockers === 1 ? "" : "s"}</small>
          </article>

          <article data-state={opsState.availability.state}>
            <span>Availability</span>
            <strong>{opsState.availability.state === "unknown" ? "Unknown" : opsState.availability.state === "blocked" ? "Blocked windows" : opsState.availability.state === "tight" ? "Constraints present" : "No recorded conflict"}</strong>
            <p>{opsState.availability.hardUnavailable} hard unavailable · {opsState.availability.protectedOrBusy} protected / busy · {opsState.availability.internationalDuty} international</p>
            <small>Next 30 days</small>
          </article>

          <article data-state={radar.filter((item) => item.calendarPressure.state === "Act now").length > 0 ? "overdue" : radar.filter((item) => item.calendarPressure.state === "Review").length > 0 ? "review" : "clear"}>
            <span>Calendar pressure</span>
            <strong>{radar.filter((item) => item.calendarPressure.state === "Act now").length > 0 ? radar.filter((item) => item.calendarPressure.state === "Act now").length + " act now" : radar.filter((item) => item.calendarPressure.state === "Review").length > 0 ? radar.filter((item) => item.calendarPressure.state === "Review").length + " review" : "Clear"}</strong>
            <p>Calendar pressure can elevate attention without changing opportunity potential.</p>
            <Link href="/app/season">Open Calendar Intelligence →</Link>
          </article>

          <article data-state={campaignsAtRisk > 0 ? "tight" : "clear"}>
            <span>Campaigns</span>
            <strong>{activeCampaigns.length} active</strong>
            <p>{campaignsAtRisk} with unresolved approval dependencies.</p>
            <Link href="/app/campaigns">Review execution →</Link>
          </article>

          <article data-state={opsState.requests.state}>
            <span>Requests</span>
            <strong>{opsState.requests.state === "unknown" ? "Unknown" : opsState.requests.overdue > 0 ? opsState.requests.overdue + " overdue" : opsState.requests.pending > 0 ? opsState.requests.pending + " waiting" : "Clear"}</strong>
            <p>{opsState.requests.nextRecipient ? "Next response: " + opsState.requests.nextRecipient : "No pending Team Manager, Activation or Protocol response is recorded."}</p>
            <small>{opsState.requests.pending} open heads-up / formal request{opsState.requests.pending === 1 ? "" : "s"}</small>
          </article>

          <article data-state={opsState.contractImpacts.state}>
            <span>Contract impacts</span>
            <strong>{opsState.contractImpacts.state === "unknown" ? "Unknown" : opsState.contractImpacts.pending > 0 ? opsState.contractImpacts.pending + " review" : "Clear"}</strong>
            <p>{opsState.contractImpacts.acknowledged} acknowledged impact{opsState.contractImpacts.acknowledged === 1 ? "" : "s"} still open.</p>
            <small>Sanitised impact state only</small>
          </article>

          <article data-state={opsState.execution.state}>
            <span>Execution sync</span>
            <strong>{opsState.execution.state === "unknown" ? "Unknown" : opsState.execution.blockedItems > 0 ? opsState.execution.blockedItems + " blocked" : opsState.execution.state === "syncing" ? "Syncing" : "On track"}</strong>
            <p>{opsState.execution.completedItems}/{opsState.execution.totalItems} synced external work items complete.</p>
            <small>{opsState.execution.packages} external package{opsState.execution.packages === 1 ? "" : "s"}</small>
          </article>

          <article data-state={opsState.continuity.state === "at-risk" ? "tight" : opsState.continuity.state === "unknown" ? "unknown" : "clear"}>
            <span>Team continuity</span>
            <strong>{opsState.continuity.state === "unknown" ? "Unknown" : opsState.continuity.openCases > 0 ? opsState.continuity.openCases + " active transition" + (opsState.continuity.openCases === 1 ? "" : "s") : "Covered"}</strong>
            <p>{opsState.continuity.state === "unknown" ? "Continuity protocol is not connected." : opsState.continuity.unconfirmedSuccessors + " successor gap" + (opsState.continuity.unconfirmedSuccessors === 1 ? "" : "s") + " · " + opsState.continuity.unresolvedItems + " handover item" + (opsState.continuity.unresolvedItems === 1 ? "" : "s") + " unresolved."}</p>
            <Link href="/app/access">Open Team continuity →</Link>
          </article>

          <article data-state={opsState.contracts.state === "connected" ? "clear" : "unknown"}>
            <span>Verified contracts</span>
            <strong>{opsState.contracts.state === "unknown" ? "Unknown" : opsState.contracts.activeDocuments + " active"}</strong>
            <p>{opsState.contracts.state === "unknown" ? "Contract Intelligence persistence is not connected." : opsState.contracts.verifiedClauses + " verified clauses available."}</p>
            <small>Verified legal truth only</small>
          </article>
        </div>
      </section>

      <section className={styles.timelineSection} aria-label="Next 30 days">
        <div className={styles.sectionHead}>
          <div><span>Next 30 days</span><h2>Fixtures and work windows that can collide.</h2></div>
          <p>AVELA should surface timing pressure before it becomes a last-minute coordination problem.</p>
        </div>
        <div className={styles.timeline}>
          {timeline.map((item) => (
            <article key={item.id}>
              <time>{shortDate(item.date)}</time>
              <span>{item.type}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
          {!timeline.length ? <p>No dated fixture or campaign item is recorded in the next 30 days.</p> : null}
        </div>
      </section>

    </main>
  );
}
