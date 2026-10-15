import type { Metadata } from "next";
import Link from "next/link";
import styles from "./results.module.css";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
import { LearningCampaignTrace } from "@/components/LearningCampaignTrace";
import { NextFixtureLearning } from "@/components/NextFixtureLearning";
import { deriveNextFixtureLearning } from "@/lib/learningRecommendation";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import { calendar, crmTicketingDemo, currentState, postmatchReviews } from "@/lib/data";
import { buildPostMatchScorecards } from "@/lib/postmatch";
import { productToday } from "@/lib/currentProductDate";
import type { PostMatchScorecardWindow } from "@/lib/models";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { DecisionStateBadge, EvidenceStateBadge } from "@/components/WorkspaceUI";
import { DecisionHandoffStrip } from "@/components/DecisionHandoffStrip";

export const metadata: Metadata = {
  title: "Learning",
  description: "Close the loop after matchday: measure the action, capture the learning and update the next fixture decision."
};

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function currency(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value);
}

function shortDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function addDays(iso: string, days: number) {
  const date = new Date(iso + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// What a closure window can honestly claim from public data: T+1 closes on the public result and
// attendance; every later window needs authorised club data, so reaching it is not closing it.
function windowState(window: PostMatchScorecardWindow, dueDate: string) {
  if (window.status === "complete") return { label: "Public facts in", detail: "Result and attendance are on the public record." };
  if (window.status === "partial") return { label: "Due · needs club data", detail: "The window has opened; closing it needs authorised club evidence." };
  return { label: "Not due yet", detail: "Opens on " + shortDate(dueDate) + "." };
}

// productAppShell is provided by AppWorkspaceShell.
export default async function ResultsLearningPage({ searchParams }: { searchParams: Promise<{ fixture?: string }> }) {
  const params = await searchParams;
  const selectedId = calendar.some((item) => item.id === params.fixture && item.homeAway === "home")
    ? params.fixture : currentState.last_completed_home_fixture_id;
  const live = getCurrentProductOpportunity(selectedId);
  const results = getCurrentProductResults(selectedId);
  const selected = calendar.find((item) => item.id === selectedId);
  const measured = results?.state === "measured";
  const nextFixture = calendar
    .filter((item) => item.homeAway === "home" && item.status === "scheduled" && item.id !== selectedId)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  const nextLearning = deriveNextFixtureLearning(live, results);
  // Closure windows are recomputed per request so a long-running server never shows yesterday's state.
  const scorecard = selected
    ? buildPostMatchScorecards(calendar, postmatchReviews, crmTicketingDemo, new Date(`${productToday()}T12:00:00Z`))
      .find((card) => card.fixtureId === selected.id && card.mode === "public")
    : undefined;

  return (
    <AppWorkspaceShell
      active="learning"
      eyebrow="Decision learning"
      title="What should change for the next fixture?"
      subtitle={selected ? selected.opponent + " · " + selected.date + " · turn observed outcome into one bounded next move" : "Close the loop from observed outcome to the next decision."}
    >
      <DecisionHandoffStrip active="learning" fixtureId={selectedId} />

      <nav className={styles.fixturePicker} aria-label="Choose a fixture to review">
        <strong>Review a fixture</strong>
        {calendar.filter((item) => item.homeAway === "home" && (item.status !== "scheduled" || item.id === currentState.next_home_fixture_id)).map((item) => (
          <Link key={item.id} href={`/app/learning?fixture=${item.id}`} aria-current={item.id === selectedId ? "page" : undefined}>
            {item.opponent} · {new Date(item.date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}
          </Link>
        ))}
      </nav>

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Learning · {selected?.opponent} · {selected?.date}</span>
          <h2>{live?.fixturePhase === "pre-match" ? "Define what we will learn before matchday." : "Turn the outcome into one next move."}</h2>
          <p>
            {live?.fixturePhase === "pre-match"
              ? "The fixture is still ahead. This screen keeps the measurement plan explicit now, then switches to observed outcomes when authorised post-match evidence arrives."
              : "What do we know after matchday? Start there, then turn it into one bounded change for the next fixture. Attribution and causal claims stay separate so the club does not confuse correlation with incrementality."}
          </p>
        </div>
        <aside className={styles.stateCard}>
          <span>{live?.timingLabel ?? "Measurement"} · Current measurement state</span>
          <div className={styles.stateBadges}>
            <DecisionStateBadge state={measured ? "MEASURED" : "MONITOR"} />
            <EvidenceStateBadge state={measured ? "OBSERVED" : "MISSING"} />
          </div>
          <strong>{measured ? "Club ticketing data connected" : live?.fixturePhase === "pre-match" ? "Pre-match · outcome not available yet" : "Awaiting club conversion data"}</strong>
          <p>
            {measured
              ? `Measured export for ${live?.fixture.opponent ?? "the current fixture"}${results?.extractedAt ? ` · extracted ${new Date(results.extractedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}` : ""}.`
              : live?.nextAction.measurement ?? "Matched ticket conversion is not connected yet."}
          </p>
        </aside>
      </header>

      {/* The learning outcome comes first: what AVELA learned, then repeat / change / measure next. */}
      <NextFixtureLearning
        learning={nextLearning}
        nextFixtureId={nextFixture?.id}
        nextFixtureLabel={nextFixture ? `${nextFixture.opponent} · ${nextFixture.date}` : undefined}
      />

      <section className={styles.learningStory} aria-label="Learning journey">
        <article data-stage="before">
          <span>01 · Before</span>
          <strong>{live?.opportunity ?? "Opportunity under review"}</strong>
          <p>{live?.recommendedAction ?? "No recommendation available."}</p>
        </article>
        {/* What the club actually did is only known once a club member confirms it in the
            fixture's decision history; the recommendation is never shown as the action taken. */}
        <article data-stage="action">
          <span>02 · Action</span>
          <strong>Club action not recorded here</strong>
          <p>
            {live?.nextAction.label ? "Recommended, not confirmed: " + live.nextAction.label + " " : ""}
            <Link href={`/app/matches/${selectedId}#decision-memory`}>Confirm what went live in the decision history →</Link>
          </p>
        </article>
        <article data-stage={measured ? "outcome" : "pending"}>
          <span>03 · Outcome</span>
          <strong>{measured ? (results?.campaignAttributedTickets?.toLocaleString("en-GB") ?? "Observed") + " attributed tickets" : "Outcome evidence pending"}</strong>
          <p>{measured ? "Observed club evidence is connected; attribution still does not establish incrementality." : "AVELA keeps this stage explicitly unmeasured until authorised post-match evidence arrives."}</p>
        </article>
        <article data-stage="next">
          <span>04 · Next decision</span>
          <strong>{nextLearning.change}</strong>
          <p>{nextFixture ? "Apply to " + nextFixture.opponent + " · " + nextFixture.date : "No next home fixture is currently available."}</p>
        </article>
      </section>

      {selected ? <section className={styles.fixtureFacts} aria-label="Observed fixture facts">
        <article><span>Sporting result · London City first</span><strong>{selected.result ? `${selected.result.for}–${selected.result.against}` : "Not available yet"}</strong></article>
        <article><span>Recorded attendance</span><strong>{selected.attendance?.toLocaleString("en-GB") ?? "Not measured yet"}</strong></article>
        <article><span>Commercial impact</span><strong>{measured ? "Descriptive club evidence connected" : "Not measured yet"}</strong></article>
      </section> : null}

      {scorecard ? <section className={styles.windows} aria-label="Measurement windows">
        <div className={styles.windowsHead}>
          <span className={styles.eyebrow}>Measurement windows</span>
          <strong>When each part of this fixture can be closed</strong>
        </div>
        <ol>
          {scorecard.windows.map((window) => {
            const due = addDays(scorecard.fixtureDate, window.dueAfterDays);
            const state = windowState(window, due);
            return (
              <li key={window.id} data-status={window.status}>
                <span>{window.id} · {shortDate(due)}</span>
                <strong>{window.objective.en}</strong>
                <b>{state.label}</b>
                <small>{state.detail}</small>
              </li>
            );
          })}
        </ol>
      </section> : null}

      <section className={styles.kpis}>
        <article>
          <span>Addressable repeat cohort</span>
          <strong>{results?.addressableRepeatCohort?.toLocaleString("en-GB") ?? "—"}</strong>
          <p>{measured ? "Consented previous-home buyers who have not purchased this fixture." : "Requires matched club CRM/ticketing data."}</p>
        </article>
        <article>
          <span>Campaign-attributed tickets</span>
          <strong>{results?.campaignAttributedTickets?.toLocaleString("en-GB") ?? "—"}</strong>
          <p>{measured ? "Tickets with a campaign id in the authorised export." : "Requires matched purchase attribution."}</p>
        </article>
        <article>
          <span>Repeat purchase rate</span>
          <strong>{percent(results?.repeatPurchaseRate ?? null)}</strong>
          <p>{measured ? "Share of consented previous-home buyers who purchased the current fixture." : "Requires a multi-fixture supporter cohort."}</p>
        </article>
        <article>
          <span>Ticket revenue</span>
          <strong>{currency(results?.grossTicketRevenue ?? null)}</strong>
          <p>{measured ? `Scan rate ${percent(results?.scanRate ?? null)} · no-show ${percent(results?.noShowRate ?? null)}` : "Requires realised ticket value and scan status."}</p>
        </article>
      </section>

      <details className={styles.evidenceDrawer}>
        <summary>
          <div><span className={styles.eyebrow}>Decision evidence</span><strong>Why AVELA is changing — or not changing — the next fixture decision</strong></div>
          <span>Open measurement trace →</span>
        </summary>
        <div className={styles.evidenceDrawerBody}>
          <ProductDataStateLegend />
          {selectedId ? <LearningCampaignTrace fixtureId={selectedId} measured={Boolean(measured)} /> : null}
        </div>
      </details>

      <details className={styles.interpretation}>
        <summary>
          <div>
            <span className={styles.eyebrow}>Interpretation guardrail</span>
            <strong>How to read this evidence</strong>
          </div>
          <span>Attribution ≠ incremental impact →</span>
        </summary>
        <div className={styles.interpretationBody}>
          <p>
            A campaign id can tell us which tickets were associated with an activation. It does not prove that those
            purchases would not have happened anyway.
          </p>
          <div className={styles.interpretationGrid}>
            <article>
              <span>Observed</span>
              <strong>Purchases, scans, revenue and repeat behaviour</strong>
              <p>Descriptive club evidence.</p>
            </article>
            <article>
              <span>Attributed</span>
              <strong>Tickets linked to campaign identifiers</strong>
              <p>Useful for channel analysis, but still descriptive.</p>
            </article>
            <article>
              <span>Incremental</span>
              <strong>Not established</strong>
              <p>{results?.interpretation.requirement ?? "Requires a credible counterfactual."}</p>
            </article>
          </div>
        </div>
      </details>

      <section className={styles.next}>
        <div>
          <span className={styles.eyebrow}>Close the loop</span>
          <h2>Apply this learning to the next fixture decision.</h2>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/app/matches">Apply learning to next match</Link>
          {selectedId ? <Link className={styles.secondary} href={`/app/matches/${selectedId}`}>Inspect this match decision</Link> : null}
        </div>
      </section>
    </AppWorkspaceShell>
  );
}
