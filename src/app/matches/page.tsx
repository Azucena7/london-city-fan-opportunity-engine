import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { calendar, currentState, liveSignals } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import styles from "./matches.module.css";

export const metadata: Metadata = {
  title: "Matches · Fan Growth Engine",
  description: "Upcoming home fixtures and the next recommended action for each match."
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date(value + "T12:00:00"));
}

export default function MatchesPage() {
  const live = getCurrentProductOpportunity();
  const currentFixtureId = currentState.next_home_fixture_id;
  const today = currentState.updated_at.slice(0, 10);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="matches" />

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Club workspace</span>
          <h1>Upcoming home matches</h1>
          <p>
            The engine starts from the fixture calendar automatically. Open the next match to see the recommended plan;
            future fixtures stay in monitoring until the evidence becomes actionable.
          </p>
        </div>
        <div className={styles.engineState}>
          <span>Last refresh</span>
          <strong>{new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</strong>
        </div>
      </header>

      <section className={styles.fixtureList} aria-label="Upcoming home fixtures">
        {upcoming.map((fixture, index) => {
          const isCurrent = fixture.id === currentFixtureId;
          const signalCount = liveSignals.filter((signal) => signal.fixtureId === fixture.id).length;
          return (
            <article className={[styles.fixture, isCurrent ? styles.current : ""].join(" ")} key={fixture.id}>
              <div className={styles.dateBlock}>
                <span>{formatDate(fixture.date)}</span>
                <strong>{fixture.kickoff ?? "TBC"}</strong>
              </div>

              <div className={styles.fixtureMain}>
                <div className={styles.fixtureTopline}>
                  <span>{isCurrent ? "NEXT HOME MATCH" : "MONITORING"}</span>
                  <span>{signalCount} sourced signals</span>
                </div>
                <h2>London City <small>v</small> {fixture.opponent}</h2>
                <p>{fixture.competition} · {fixture.venue}</p>

                {isCurrent ? (
                  <div className={styles.decision}>
                    <span>Recommended focus</span>
                    <strong>{live?.opportunity ?? "Review current evidence."}</strong>
                    <p>{live?.nextAction.label ?? "No action is currently required."}</p>
                  </div>
                ) : (
                  <div className={styles.monitoring}>
                    <strong>No action required yet.</strong>
                    <span>The engine is watching fixture, demand and attention signals automatically.</span>
                  </div>
                )}
              </div>

              <div className={styles.fixtureAction}>
                <span>{index === 0 ? live?.timingLabel ?? "Current" : "Future fixture"}</span>
                {isCurrent ? <Link href={`/matches/${fixture.id}`}>Open match plan →</Link> : <span>Monitoring automatically</span>}
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.principle}>
        <span>Product principle</span>
        <strong>The club does not create a plan first.</strong>
        <p>Fixture → signals → AI interpretation → opportunity → draft plan. The user reviews, adjusts and approves.</p>
      </section>
    </main>
  );
}
