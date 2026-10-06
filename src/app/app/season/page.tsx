import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRelationshipPanel } from "@/components/CalendarRelationshipPanel";
import { TalentPressurePanel } from "@/components/TalentPressurePanel";
import { calendar, campaignPlans, currentState, eventLandscape } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import { demoAppearances, demoPlayerMomentum, demoPlayers, playerCapacity, playerMomentumScore } from "@/lib/clubStrategy";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildCalendarRelationships } from "@/lib/calendarIntelligence";
import { getInternalCalendarRelationships } from "@/lib/calendarIntelligenceServer";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { DecisionStateBadge, WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./season.module.css";

export const metadata: Metadata = {
  title: "Season Intelligence · AVELA",
  description: "Season-level view of opportunities, campaigns, activation mix, attendance evidence and learning coverage."
};

function shortDate(date: string) {
  return new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export default async function SeasonIntelligencePage() {
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

  const clubContext = await getCurrentClubOperatingContext();
  const fromDate = currentState.updated_at.slice(0, 10);
  const toDate = calendar.map((item) => item.date).sort().at(-1) ?? fromDate;
  const externalRelationships = buildCalendarRelationships({
    fixtures: calendar,
    campaignPlans,
    eventLandscape,
    fromDate
  });
  const internalCalendar = await getInternalCalendarRelationships({
    clubId: clubContext?.clubId,
    fixtures: calendar,
    campaignPlans,
    fromDate,
    toDate
  });
  const relationshipPriority = { high: 0, medium: 1, context: 2 } as const;
  const calendarRelationships = [...externalRelationships, ...internalCalendar.relationships]
    .sort((a,b) => relationshipPriority[a.strength] - relationshipPriority[b.strength] || a.date.localeCompare(b.date))
    .slice(0, 40);

  const selectedMonth = fromDate.slice(0, 7);
  const [monthYear, monthNumber] = selectedMonth.split("-").map(Number);
  const monthStart = new Date(Date.UTC(monthYear, monthNumber - 1, 1));
  const monthDays = new Date(Date.UTC(monthYear, monthNumber, 0)).getUTCDate();
  const leadingDays = (monthStart.getUTCDay() + 6) % 7;
  const calendarCells = Array.from({ length: leadingDays + monthDays }, (_, index) => {
    if (index < leadingDays) return null;
    const day = index - leadingDays + 1;
    const date = selectedMonth + "-" + String(day).padStart(2, "0");
    const fixtures = calendar.filter((item) => item.date === date);
    const campaignItems = campaignPlans.campaigns.flatMap((campaign) =>
      campaign.schedule.filter((item) => item.date === date).map((item) => ({ campaign, item }))
    );
    const relationships = calendarRelationships.filter((item) => item.date === date);
    return { day, date, fixtures, campaignItems, relationships };
  });
  const monthLabel = monthStart.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const upcomingRows = fixtureRows.filter((row) => row.date >= fromDate).sort((a,b) => a.date.localeCompare(b.date));
  const nextRow = upcomingRows[0] ?? null;
  const nextPressure = nextRow
    ? calendarRelationships.filter((item) => item.fixtureIds.includes(nextRow.id) || item.date === nextRow.date).slice(0, 3)
    : [];
  const nextDecisionState = !nextRow
    ? "MONITOR"
    : nextRow.approvalsTotal > 0 && nextRow.approvalsReady < nextRow.approvalsTotal
      ? "REVIEW"
      : nextRow.campaign
        ? "READY"
        : "ACT";

  return (
    <AppWorkspaceShell
      active="season"
      eyebrow="Calendar intelligence · 2026/27"
      title="What is coming — and what changes the plan?"
      subtitle="Fixtures, campaigns, talent pressure and external context in one decision calendar."
    >

      {nextRow ? (
        <section className={styles.nextMoveRail} aria-label="Next calendar decision">
          <div className={styles.nextMoveDate}>
            <span>Next decision window</span>
            <strong>{shortDate(nextRow.date)}</strong>
            <small>London City v {nextRow.opponent}</small>
          </div>
          <div className={styles.nextMoveState}>
            <DecisionStateBadge state={nextDecisionState} />
            <strong>{nextRow.campaign ? nextRow.campaign.title.en : "No campaign draft yet"}</strong>
            <small>{nextPressure.length ? nextPressure.length + " calendar pressure signals around this fixture" : "No material calendar pressure currently linked"}</small>
          </div>
          <div className={styles.nextMoveFlow} aria-label="Recommended workflow">
            <Link href={"/app/matches/" + nextRow.id}><span>01</span><strong>Decide</strong><small>Opportunity brief</small></Link>
            <Link href="/app/campaigns"><span>02</span><strong>Campaign</strong><small>{nextRow.campaign ? "Review scope" : "Create from decision"}</small></Link>
            <Link href={nextRow.campaign ? "/app/players?campaign=" + nextRow.campaign.id : "/app/players"}><span>03</span><strong>Players</strong><small>Check talent fit</small></Link>
            <Link href={"/app/learning?fixture=" + nextRow.id}><span>04</span><strong>Learning</strong><small>{nextRow.measuredOutcome ? "Review evidence" : "Measurement plan"}</small></Link>
          </div>
        </section>
      ) : null}

      <section className={styles.calendarToolbar}>
        <div>
          <strong>{monthLabel}</strong>
        </div>
        <div className={styles.legend}>
          <span><i data-kind="fixture" />Fixture</span>
          <span><i data-kind="campaign" />Campaign</span>
          <span><i data-kind="pressure" />Calendar pressure</span>
        </div>
        <Link href="/app/executive">Executive view →</Link>
      </section>

      <WorkspaceCard className={styles.calendarBoard}>
        <div className={styles.weekdays}>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className={styles.monthGrid}>
          {calendarCells.map((cell, index) => cell ? (
            <article key={cell.date} className={styles.dayCell} data-active={cell.date === fromDate ? "true" : "false"}>
              <time>{cell.day}</time>
              <div className={styles.dayEvents}>
                {cell.fixtures.slice(0, 2).map((fixture) => (
                  <Link href={"/app/matches/" + fixture.id} key={fixture.id} data-kind="fixture">
                    <span>Fixture</span>
                    <strong>{fixture.homeAway === "home" ? "v " + fixture.opponent : "@ " + fixture.opponent}</strong>
                    <small>{fixture.kickoff ?? "TBC"}</small>
                  </Link>
                ))}
                {cell.campaignItems.slice(0, 2).map(({ campaign, item }, itemIndex) => (
                  <Link href="/app/campaigns" key={campaign.id + itemIndex} data-kind="campaign">
                    <span>Campaign</span>
                    <strong>{item.action.en}</strong>
                    <small>{campaign.title.en}</small>
                  </Link>
                ))}
                {cell.relationships.slice(0, 2).map((relationship) => (
                  <div key={relationship.id} data-kind="pressure">
                    <span>{relationship.strength}</span>
                    <strong>{relationship.title}</strong>
                  </div>
                ))}
              </div>
            </article>
          ) : <div key={"empty-" + index} className={styles.emptyDay} />)}
        </div>
      </WorkspaceCard>

      <section className={styles.kpis} aria-label="Season summary">
        <WorkspaceCard><span>Home fixtures</span><strong>{homeFixtures.length}</strong><small>{scoredFixtures.length} with opportunity score</small></WorkspaceCard>
        <WorkspaceCard><span>Campaign drafts</span><strong>{campaigns.length}</strong><small>{activations.length} drafted activations</small></WorkspaceCard>
        <WorkspaceCard tone="accent"><span>Approval readiness</span><strong>{approvalsReady}/{allApprovals.length}</strong><small>ready across current drafts</small></WorkspaceCard>
        <WorkspaceCard tone="action"><span>Measured outcomes</span><strong>{measuredOutcomes}</strong><small>fixtures with outcome evidence</small></WorkspaceCard>
      </section>

      <section className={styles.workspaceGrid}>
        <WorkspaceCard className={styles.timelineCard}>
          <WorkspaceSectionHeader eyebrow="Season opportunity timeline" title="One row for every home fixture" />
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
                  <div className={styles.score}><span>Opportunity</span><strong>{row.score ?? "—"}</strong><small>{row.confidence ? row.confidence + " confidence" : "No current score"}</small></div>
                  <div className={styles.signals}><span>Evidence</span><strong>{row.materialSignals}</strong><small>material signals</small></div>
                  <div className={styles.campaign}>
                    <span>Campaign</span>
                    {row.campaign ? <DecisionStateBadge state={row.approvalsTotal > 0 && row.approvalsReady < row.approvalsTotal ? "REVIEW" : "READY"} label={row.campaign.status} /> : <DecisionStateBadge state="MONITOR" label="None" />}
                    <div><i><em style={{ width: approvalPct + "%" }} /></i><small>{row.approvalsTotal ? row.approvalsReady + "/" + row.approvalsTotal + " approvals" : "No gates"}</small></div>
                  </div>
                  <div className={styles.outcome}>
                    <span>Next handoff</span>
                    <DecisionStateBadge state={row.measuredOutcome ? "MEASURED" : row.campaign && row.approvalsTotal > 0 && row.approvalsReady < row.approvalsTotal ? "REVIEW" : row.campaign ? "READY" : "ACT"} label={row.measuredOutcome ? "Learning" : row.campaign && row.approvalsTotal > 0 && row.approvalsReady < row.approvalsTotal ? "Approval" : row.campaign ? "Campaign" : "Decide"} />
                    <Link href={row.measuredOutcome ? "/app/learning?fixture=" + row.id : row.campaign ? "/app/campaigns" : "/app/matches/" + row.id}>{row.measuredOutcome ? "Review learning →" : row.campaign ? "Review campaign →" : "Open decision →"}</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </WorkspaceCard>

        <aside className={styles.sideRail}>
          <WorkspaceDrawer label="Relationship analysis" title="Conflicts, sequences & availability">
            <CalendarRelationshipPanel relationships={calendarRelationships} internalState={internalCalendar.state} externalState={eventLandscape.state} />
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Season evidence" title="Home attendance trend">
            <div className={styles.attendanceCompact}>
              <strong>{avgAttendance ? avgAttendance.toLocaleString("en-GB") : "—"} <small>avg observed</small></strong>
              {measuredAttendance.map((row) => (
                <Link href={"/app/learning?fixture=" + row.id} key={row.id}>
                  <span>{row.opponent}</span>
                  <i><em style={{ width: Math.max(8, ((row.attendance ?? 0) / maxAttendance) * 100) + "%" }} /></i>
                  <b>{row.attendance?.toLocaleString("en-GB")}</b>
                </Link>
              ))}
              <p>Only measured or reported attendance is plotted. Missing fixtures are not shown as zero.</p>
            </div>
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Campaign mix" title="Activation mix">
            <div className={styles.channelBars}>
              {channelCounts.slice(0,8).map((item) => (
                <div key={item.channel}><span>{item.channel}</span><i><em style={{ width: (item.count / maxChannel) * 100 + "%" }} /></i><b>{item.count}</b></div>
              ))}
            </div>
            <p className={styles.note}>This measures drafted activation volume, not channel performance or incremental impact.</p>
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Talent pressure" title="Player conflicts & weekly load">
            <TalentPressurePanel />
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Player assets" title="Player asset utilisation">
            <div className={styles.playerUsageGrid}>
              {playerUsage.map(({ player, capacity, momentum }) => (
                <article key={player.id}>
                  <div><span>{player.name}</span><strong>{momentum.score !== null ? momentum.score.toFixed(0) + " momentum" : "No momentum score"}</strong></div>
                  <div className={styles.playerTwinBars}>
                    <span><b>Usage</b><i><em style={{ width: player.quota ? Math.min(100, (capacity.used / player.quota) * 100) + "%" : "0%" }} /></i></span>
                    <span><b>Momentum</b><i><em style={{ width: (momentum.score ?? 0) + "%" }} /></i></span>
                  </div>
                  <small>{capacity.remaining === null ? "Quota unknown" : capacity.remaining + " appearances remaining"} · £{player.fee} per appearance · {momentum.availableDimensions}/4 momentum inputs</small>
                </article>
              ))}
            </div>
            <p className={styles.note}>{totalPlayerUses} completed/reserved commercial appearances recorded in the synthetic planning pool. Momentum and usage are different signals: high momentum does not automatically mean “use now”.</p>
            <Link className={styles.playerLink} href="/app/players">Open Player Asset Planning →</Link>
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Season questions" title="What AVELA should help the club learn over time.">
            <div className={styles.patternGrid}>
              <article><strong>Which signals repeatedly precede high-opportunity fixtures?</strong><p>Requires comparable fixture history; AVELA can accumulate this as the season progresses.</p></article>
              <article><strong>Which campaign recipes move from draft to measured outcome?</strong><p>{measuredOutcomes ? measuredOutcomes + " fixtures currently have measured outcome evidence." : "No measured campaign outcome is yet strong enough for a season conclusion."}</p></article>
              <article><strong>Which channels are used most — and which actually perform?</strong><p>Usage is visible now. Performance should only appear when connector evidence such as CRM, ticketing or Blinkfire is available.</p></article>
              <article><strong>Are we improving decision quality, not just activity volume?</strong><p>Track whether later recommendations rely on better evidence and produce more measurable learning.</p></article>
            </div>
          </WorkspaceDrawer>
        </aside>
      </section>
    </AppWorkspaceShell>
  );
}
