import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { calendar, campaignPlans, currentState } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Home · AVELA",
  description: "The club's operational starting point: what needs attention, why, what is blocked and what to do next."
};

export default async function ClubAppHome() {
  const today = currentState.updated_at.slice(0, 10);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 8);
  const clubContext = await getCurrentClubOperatingContext();
  const radar = buildOpportunityRadar(upcoming.map((fixture) => fixture.id), clubContext);
  const priority = radar[0] ?? null;
  const live = priority ? getCurrentProductOpportunity(priority.fixtureId) : null;
  const campaign = priority ? campaignPlans.campaigns.find((item) => item.fixtureId === priority.fixtureId) ?? null : null;
  const unresolved = campaign?.approvals.filter((item) => item.state !== "ready") ?? [];
  const reviewCount = radar.filter((item) => item.radarState === "Review" || item.radarState === "Act now").length;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="home" />

      <header className={styles.header}>
        <div>
          <span>AVELA · Home</span>
          <h1>What needs attention today?</h1>
          <p>Start with the next decision, not a dashboard. AVELA surfaces the fixture that deserves attention and the shortest path to action.</p>
        </div>
        <div className={styles.refresh}>
          <span>Engine refresh</span>
          <strong>{new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</strong>
        </div>
      </header>

      {priority && live ? (
        <section className={styles.focus} aria-label="Primary action">
          <div className={styles.focusLead}>
            <span>01 · Primary action</span>
            <h2>{live.nextAction.label}</h2>
            <p>{live.opportunity}</p>
            <div className={styles.focusMeta}>
              <strong>{priority.opponent}</strong>
              <span>{priority.date} · {priority.kickoff ?? "TBC"}</span>
              <span>{priority.confidence} confidence</span>
              <span>{priority.urgency} urgency</span>
            </div>
          </div>
          <div className={styles.focusReason}>
            <span>Why this is first</span>
            <strong>{live.whyNow}</strong>
            <div className={styles.focusMetrics}>
              <div><b>{priority.opportunityScore ?? "—"}</b><small>opportunity</small></div>
              <div><b>{priority.materialSignalCount}</b><small>material signals</small></div>
              <div><b>{unresolved.length}</b><small>open gates</small></div>
            </div>
            <div className={styles.focusActions}>
              <Link href={`/app/matches/${priority.fixtureId}`}>Open decision workspace →</Link>
              <Link href={`/app/executive?fixture=${priority.fixtureId}`}>Executive view →</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.empty}><strong>No fixture currently requires action.</strong><p>Radar will surface the next material opportunity when evidence changes.</p></section>
      )}

      <section className={styles.queue} aria-label="Decision queue">
        <div className={styles.sectionHead}>
          <div><span>Decision queue</span><h2>Everything else can wait.</h2></div>
          <Link href="/app/matches">Open full Radar →</Link>
        </div>
        <div className={styles.queueGrid}>
          {radar.slice(1,4).map((item) => (
            <Link href={`/app/matches/${item.fixtureId}`} key={item.fixtureId} className={styles.queueCard}>
              <div><span>{item.radarState}</span><b>{item.opponent}</b></div>
              <strong>{item.opportunity}</strong>
              <small>{item.date} · {item.urgency} urgency · {item.materialSignalCount} material signals</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.status} aria-label="Workspace status">
        <article>
          <span>Needs attention</span>
          <strong>{reviewCount}</strong>
          <p>Fixtures at Act now or Review.</p>
        </article>
        <article>
          <span>Campaign state</span>
          <strong>{campaign?.status ?? "No active draft"}</strong>
          <p>{unresolved.length ? `${unresolved.length} approval gate${unresolved.length === 1 ? "" : "s"} unresolved.` : "No blocking approval gate in the current priority."}</p>
          <Link href="/app/campaigns">Open campaigns →</Link>
        </article>
        <article>
          <span>Data readiness</span>
          <strong>{clubContext ? "Club context active" : "Evidence-only mode"}</strong>
          <p>{clubContext ? `${clubContext.connectedChannels.length} channels · ${clubContext.priorityObjectives.length} objectives configured.` : "Add club context without changing evidence ranking."}</p>
          <Link href={clubContext ? "/app/sources" : "/app/setup"}>{clubContext ? "Review sources →" : "Complete setup →"}</Link>
        </article>
      </section>

      <section className={styles.loop}>
        <span>How AVELA works</span>
        <div><b>Fixture</b><i>→</i><b>Signals</b><i>→</i><strong>Opportunity</strong><i>→</i><b>Campaign</b><i>→</i><b>Learning</b></div>
      </section>
    </main>
  );
}
