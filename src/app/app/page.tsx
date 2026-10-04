import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { calendar, campaignPlans, currentState, partnerCommercialPack, pilotReadiness } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildDecisionAlerts, decisionSummary, type DecisionPriority } from "@/lib/decisionIntelligence";
import { getDecisionCenterOpsState } from "@/lib/decisionCenterOverview";
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
  const radar = buildOpportunityRadar(upcoming.map((fixture) => fixture.id), clubContext);
  const alerts = buildDecisionAlerts(radar);
  const summary = decisionSummary(alerts);
  const attention = alerts.filter((item) => ["act-now", "review", "blocked"].includes(item.priority));
  const primary = attention[0] ?? alerts[0] ?? null;
  const recentChanges = alerts
    .flatMap((alert) => alert.events.map((event) => ({ ...event, alert })))
    .sort((a,b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  const horizonEnd = new Date(today + "T00:00:00Z");
  horizonEnd.setUTCDate(horizonEnd.getUTCDate() + 30);
  const horizonEndIso = horizonEnd.toISOString();

  const opsState = await getDecisionCenterOpsState({
    clubId: clubContext?.clubId,
    from: currentState.updated_at,
    to: horizonEndIso
  });

  const activeCampaigns = campaignPlans.campaigns.filter((campaign) =>
    campaign.schedule.some((item) => item.state !== "complete")
  );
  const campaignsAtRisk = activeCampaigns.filter((campaign) =>
    campaign.approvals.some((approval) => approval.state !== "ready")
  ).length;

  const partnerCandidates = partnerCommercialPack.packs.length;
  const partnerRecommended = pilotReadiness.candidates.find((candidate) => candidate.decision === "recommended-for-review") ?? null;
  const contractState = "Not connected";

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
    )
  ]
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="home" />

      <header className={styles.header}>
        <div>
          <span>AVELA · Decision Center</span>
          <h1>{summary.attention ? `${summary.attention} thing${summary.attention === 1 ? "" : "s"} need your attention.` : "Everything important is currently under control."}</h1>
          <p>Start here. AVELA brings together current evidence, urgency, blockers and deadlines so you can see what changed and what to do next without opening every workspace.</p>
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

      <section className={styles.workspaceGrid}>
        <div className={styles.queue}>
          <div className={styles.sectionHead}>
            <div><span>Decision queue</span><h2>What should I look at next?</h2></div>
            <Link href="/app/matches">Open full Radar →</Link>
          </div>
          <div className={styles.alertList}>
            {alerts.slice(0, 6).map((item) => (
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
          <p>Only connected or explicitly known state is summarised here. Missing operational data stays unknown.</p>
        </div>
        <div className={styles.clubStateGrid}>
          <article data-state={opsState.capacity.state}>
            <span>Operational capacity</span>
            <strong>{
              opsState.capacity.state === "unknown" ? "Unknown" :
              opsState.capacity.state === "overloaded" ? "Overloaded" :
              opsState.capacity.state === "tight" ? "Tight" : "Available"
            }</strong>
            <p>{opsState.capacity.utilisation !== null ? opsState.capacity.utilisation + "% of recorded capacity committed" : "Connect workload and capacity data before treating the plan as feasible."}</p>
            <small>{opsState.capacity.blockers} blocked workload item{opsState.capacity.blockers === 1 ? "" : "s"}</small>
          </article>

          <article data-state={opsState.availability.state}>
            <span>Availability</span>
            <strong>{
              opsState.availability.state === "unknown" ? "Unknown" :
              opsState.availability.state === "blocked" ? "Blocked windows" :
              opsState.availability.state === "tight" ? "Constraints present" : "No recorded conflict"
            }</strong>
            <p>{opsState.availability.hardUnavailable} hard unavailable · {opsState.availability.protectedOrBusy} protected / busy · {opsState.availability.internationalDuty} international</p>
            <small>Next 30 days</small>
          </article>

          <article data-state={campaignsAtRisk > 0 ? "tight" : "clear"}>
            <span>Campaigns</span>
            <strong>{activeCampaigns.length} active</strong>
            <p>{campaignsAtRisk} with unresolved approval dependencies.</p>
            <Link href="/app/campaigns">Review execution →</Link>
          </article>

          <article data-state={partnerRecommended ? "review" : "unknown"}>
            <span>Sponsor opportunities</span>
            <strong>{partnerCandidates}</strong>
            <p>{partnerRecommended ? "One partner opportunity is recommended for review." : "No partner opportunity currently clears the review threshold."}</p>
            <small>Prospecting only · not contract fulfilment</small>
          </article>

          <article data-state="unknown">
            <span>Verified contracts</span>
            <strong>{contractState}</strong>
            <p>No sponsor or player legal agreement is currently verified in AVELA.</p>
            <small>Do not infer rights from planning data</small>
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

      <section className={styles.overview} aria-label="Workspace overview">
        <article>
          <span>Opportunity Radar</span>
          <strong>{radar.length}</strong>
          <p>Upcoming home fixtures currently monitored by the engine.</p>
          <Link href="/app/matches">View opportunities →</Link>
        </article>
        <article>
          <span>Campaign execution</span>
          <strong>{alerts.filter((item) => item.events.some((event) => event.kind === "blocker")).length}</strong>
          <p>Current decisions with an unresolved approval dependency.</p>
          <Link href="/app/campaigns">View campaigns →</Link>
        </article>
        <article>
          <span>Sponsor intelligence</span>
          <strong>{partnerRecommended ? "Review" : "Prospecting"}</strong>
          <p>{partnerCandidates} partner opportunities are modelled separately from verified contract obligations.</p>
          <Link href="/app/sources">Review source boundary →</Link>
        </article>
        <article>
          <span>Learning</span>
          <strong>History</strong>
          <p>Measured outcomes stay separate from recommendations so future decisions can learn from what actually happened.</p>
          <Link href="/app/learning">Open learning →</Link>
        </article>
      </section>

      <section className={styles.loop}>
        <span>AVELA decision loop</span>
        <div><b>Sense</b><i>→</i><b>Prioritise</b><i>→</i><strong>Recommend</strong><i>→</i><b>Decide</b><i>→</i><b>Execute</b><i>→</i><b>Learn</b></div>
      </section>
    </main>
  );
}
