import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { SeasonCloseReview } from "@/components/SeasonCloseReview";
import { calendar, campaignPlans } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import { demoAppearances, demoPlayerMomentum, demoPlayers, playerCapacity, playerMomentumScore } from "@/lib/clubStrategy";
import styles from "./season.module.css";

export const metadata: Metadata = {
  title: "Season Intelligence · AVELA",
  description: "Season-level view of opportunities, campaigns, activation mix, attendance evidence and learning coverage."
};

function shortDate(date: string) {
  return new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export default function SeasonIntelligencePage() {
  const homeFixtures = calendar.filter((item) => item.homeAway === "home").sort((a,b) => a.date.localeCompare(b.date));
  const fixtureRows = homeFixtures.map((fixture) => {
    const opportunity = getCurrentProductOpportunity(fixture.id);
    const campaign = campaignPlans.campaigns.find((item) => item.fixtureId === fixture.id) ?? null;
    const results = getCurrentProductResults(fixture.id);
    const approvalsReady = campaign?.approvals.filter((item) => item.state === "ready").length ?? 0;
    const approvalsTotal = campaign?.approvals.length ?? 0;
    return {
      id: fixture.id,
      opponent: fixture.opponent,
      date: fixture.date,
      status: fixture.status,
      attendance: fixture.attendance ?? null,
      attendanceState: fixture.attendanceState ?? null,
      score: opportunity?.score ?? null,
      confidence: opportunity?.confidence.label ?? null,
      materialSignals: opportunity?.liveSignals.filter((signal) => signal.materiality !== "low").length ?? 0,
      campaign,
      approvalsReady,
      approvalsTotal,
      measuredOutcome: results?.state === "measured"
    };
  });

  const campaigns = campaignPlans.campaigns ?? [];
  const allApprovals = campaigns.flatMap((campaign) => campaign.approvals ?? []);
  const approvalsReady = allApprovals.filter((item) => item.state === "ready").length;
  const activations = campaigns.flatMap((campaign) => campaign.activations ?? []);
  const measuredAttendance = fixtureRows.filter((row) => row.attendance !== null);
  const totalAttendance = measuredAttendance.reduce((sum,row) => sum + (row.attendance ?? 0),0);
  const avgAttendance = measuredAttendance.length ? Math.round(totalAttendance / measuredAttendance.length) : null;
  const measuredOutcomes = fixtureRows.filter((row) => row.measuredOutcome).length;
  const playerUsage = demoPlayers.map((player) => ({ player, capacity: playerCapacity(player, demoAppearances), momentum: playerMomentumScore(player.id, demoPlayerMomentum) }))
    .sort((a,b) => (b.momentum.score ?? -1) - (a.momentum.score ?? -1));
  const totalPlayerUses = playerUsage.reduce((sum, item) => sum + item.capacity.used, 0);
  const scoredFixtures = fixtureRows.filter((row) => row.score !== null);

  const channelCounts = Array.from(new Map(
    activations.map((activation) => [activation.channel, 0])
  )).map(([channel]) => ({
    channel,
    count: activations.filter((activation) => activation.channel === channel).length
  })).sort((a,b) => b.count - a.count);
  const maxChannel = Math.max(1, ...channelCounts.map((item) => item.count));
  const maxAttendance = Math.max(1, ...measuredAttendance.map((item) => item.attendance ?? 0));

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="season" />

      <header className={styles.header}>
        <div>
          <span>Season Intelligence · 2026/27</span>
          <h1>Are we getting better across the season?</h1>
          <p>This view aggregates fixture-level evidence without turning missing data into zero. It shows where AVELA has campaigns, measured outcomes and repeated patterns — and where the season is still unmeasured.</p>
        </div>
        <Link href="/app/executive">Executive view →</Link>
      </header>

      <section className={styles.kpis} aria-label="Season summary">
        <article><span>Home fixtures</span><strong>{homeFixtures.length}</strong><small>{scoredFixtures.length} currently have an opportunity score</small></article>
        <article><span>Campaign drafts</span><strong>{campaigns.length}</strong><small>{activations.length} drafted activations</small></article>
        <article><span>Approval readiness</span><strong>{approvalsReady}/{allApprovals.length}</strong><small>ready across current campaign drafts</small></article>
        <article><span>Measured outcomes</span><strong>{measuredOutcomes}</strong><small>fixtures with connected outcome evidence</small></article>
      </section>

      <SeasonCloseReview
        scheduledFixtures={fixtureRows.filter((row) => row.status === "scheduled").length}
        campaignDrafts={campaigns.filter((campaign) => campaign.status !== "closed").length}
        unresolvedApprovals={allApprovals.filter((item) => item.state !== "ready").length}
        measuredOutcomes={measuredOutcomes}
        attendanceEvidence={measuredAttendance.length}
      />

      <section className={styles.visualGrid}>
        <article className={styles.chartCard}>
          <div className={styles.chartHead}><div><span>Attendance evidence</span><h2>Home attendance trend</h2></div><strong>{avgAttendance ? avgAttendance.toLocaleString("en-GB") : "—"}<small>avg observed</small></strong></div>
          <div className={styles.attendanceChart}>
            {measuredAttendance.map((row) => (
              <Link href={`/app/learning?fixture=${row.id}`} key={row.id} className={styles.attendanceBar}>
                <div><i style={{ height: `${Math.max(8, ((row.attendance ?? 0) / maxAttendance) * 100)}%` }} /></div>
                <b>{row.attendance?.toLocaleString("en-GB")}</b>
                <span>{row.opponent.replace("Manchester ","Man ").replace("Brighton & Hove Albion","Brighton")}</span>
                <small>{shortDate(row.date)} · {row.attendanceState}</small>
              </Link>
            ))}
            {!measuredAttendance.length ? <p>No home attendance evidence is available yet.</p> : null}
          </div>
          <p className={styles.note}>Only measured or reported attendance is plotted. Missing fixtures are not shown as zero.</p>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.chartHead}><div><span>Activation mix</span><h2>Where campaign work is concentrated</h2></div><strong>{activations.length}<small>drafted activations</small></strong></div>
          <div className={styles.channelBars}>
            {channelCounts.slice(0,8).map((item) => (
              <div key={item.channel}>
                <span>{item.channel}</span>
                <i><em style={{ width: `${(item.count / maxChannel) * 100}%` }} /></i>
                <b>{item.count}</b>
              </div>
            ))}
            {!channelCounts.length ? <p>No campaign activation mix is available yet.</p> : null}
          </div>
          <p className={styles.note}>This measures drafted activation volume, not channel performance or incremental impact.</p>
        </article>
      </section>

      <section className={styles.seasonTimeline}>
        <div className={styles.sectionHead}>
          <div><span>Season opportunity timeline</span><h2>One row for every home fixture.</h2></div>
          <p>Opportunity, campaign state and evidence stay separate so gaps remain visible.</p>
        </div>
        <div className={styles.timelineRows}>
          {fixtureRows.map((row) => {
            const approvalPct = row.approvalsTotal ? Math.round((row.approvalsReady / row.approvalsTotal) * 100) : 0;
            return (
              <article key={row.id}>
                <div className={styles.fixture}>
                  <span>{shortDate(row.date)}</span>
                  <strong>{row.opponent}</strong>
                  <small>{row.status.replaceAll("-", " ")}</small>
                </div>
                <div className={styles.score}>
                  <span>Opportunity</span>
                  <strong>{row.score ?? "—"}</strong>
                  <small>{row.confidence ? `${row.confidence} confidence` : "No current score"}</small>
                </div>
                <div className={styles.signals}>
                  <span>Evidence</span>
                  <strong>{row.materialSignals}</strong>
                  <small>material signals</small>
                </div>
                <div className={styles.campaign}>
                  <span>Campaign</span>
                  <strong>{row.campaign ? row.campaign.status : "None"}</strong>
                  <div><i><em style={{ width: `${approvalPct}%` }} /></i><small>{row.approvalsTotal ? `${row.approvalsReady}/${row.approvalsTotal} approvals` : "No gates"}</small></div>
                </div>
                <div className={styles.outcome}>
                  <span>Outcome</span>
                  <strong>{row.measuredOutcome ? "Measured" : row.attendance !== null ? "Attendance only" : "Pending"}</strong>
                  <Link href={row.measuredOutcome || row.attendance !== null ? `/app/learning?fixture=${row.id}` : `/app/matches/${row.id}`}>Open →</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.playerAssets}>
        <div className={styles.sectionHead}>
          <div><span>Player asset utilisation</span><h2>Are we using commercial player rights intelligently?</h2></div>
          <Link href="/app/players">Open Player Asset Planning →</Link>
        </div>
        <div className={styles.playerUsageGrid}>
          {playerUsage.map(({ player, capacity, momentum }) => (
            <article key={player.id}>
              <div><span>{player.name}</span><strong>{momentum.score !== null ? `${momentum.score.toFixed(0)} momentum` : "No momentum score"}</strong></div>
              <div className={styles.playerTwinBars}>
                <span><b>Usage</b><i><em style={{ width: player.quota ? `${Math.min(100, (capacity.used / player.quota) * 100)}%` : "0%" }} /></i></span>
                <span><b>Momentum</b><i><em style={{ width: `${momentum.score ?? 0}%` }} /></i></span>
              </div>
              <small>{capacity.remaining === null ? "Quota unknown" : `${capacity.remaining} appearances remaining`} · £{player.fee} per appearance · {momentum.availableDimensions}/4 momentum inputs</small>
            </article>
          ))}
        </div>
        <p className={styles.note}>{totalPlayerUses} completed/reserved commercial appearances recorded in the synthetic planning pool. Momentum and usage are different signals: high momentum does not automatically mean “use now”.</p>
      </section>

      <section className={styles.patterns}>
        <div><span>Season questions</span><h2>What AVELA should help the club learn over time.</h2></div>
        <div className={styles.patternGrid}>
          <article><strong>Which signals repeatedly precede high-opportunity fixtures?</strong><p>Requires comparable fixture history; AVELA can accumulate this as the season progresses.</p></article>
          <article><strong>Which campaign recipes move from draft to measured outcome?</strong><p>{measuredOutcomes ? `${measuredOutcomes} fixture${measuredOutcomes === 1 ? "" : "s"} currently have measured outcome evidence.` : "No measured campaign outcome is yet strong enough for a season conclusion."}</p></article>
          <article><strong>Which channels are used most — and which actually perform?</strong><p>Usage is visible now. Performance should only appear when connector evidence such as CRM, ticketing or Blinkfire is available.</p></article>
          <article><strong>Are we improving decision quality, not just activity volume?</strong><p>Track whether later recommendations rely on better evidence and produce more measurable learning, rather than simply more campaigns.</p></article>
        </div>
      </section>
    </main>
  );
}
