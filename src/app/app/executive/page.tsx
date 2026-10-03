import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { ExecutiveShareActions } from "@/components/ExecutiveShareActions";
import { calendar, campaignPlans, currentState } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import styles from "./executive.module.css";

export const metadata: Metadata = {
  title: "Executive view · AVELA",
  description: "A presentation-ready executive view of the current fixture opportunity, evidence, campaign and learning state."
};

export default async function ExecutiveViewPage({ searchParams }: { searchParams: Promise<{ fixture?: string }> }) {
  const params = await searchParams;
  const clubContext = await getCurrentClubOperatingContext();
  const today = currentState.updated_at.slice(0,10);
  const upcoming = calendar
    .filter((item) => item.homeAway === "home" && item.date >= today && item.status !== "final")
    .sort((a,b) => a.date.localeCompare(b.date));
  const radar = buildOpportunityRadar(upcoming.map((item) => item.id), clubContext);
  const selectedId = params.fixture && calendar.some((item) => item.id === params.fixture)
    ? params.fixture
    : radar[0]?.fixtureId ?? currentState.next_home_fixture_id;
  const fixture = calendar.find((item) => item.id === selectedId);
  const live = getCurrentProductOpportunity(selectedId);
  const radarItem = buildOpportunityRadar([selectedId], clubContext)[0] ?? null;
  const campaign = campaignPlans.campaigns.find((item) => item.fixtureId === selectedId) ?? null;
  const results = getCurrentProductResults(selectedId);
  const approvals = campaign?.approvals.filter((item) => item.state !== "ready") ?? [];
  const measured = results?.state === "measured";

  if (!fixture || !live) return null;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="executive" />

      <header className={styles.toolbar}>
        <div>
          <Link href={`/app/matches/${selectedId}`}>← Back to workspace</Link>
          <span>Executive view · {fixture.opponent}</span>
        </div>
        <ExecutiveShareActions />
      </header>

      <section className={styles.hero}>
        <div>
          <span>Executive decision brief</span>
          <h1>{campaign?.title.en ?? live.opportunity}</h1>
          <p>{live.whyNow}</p>
        </div>
        <aside>
          <span>Recommendation state</span>
          <strong>{live.decisionState}</strong>
          <small>{live.confidence.label} confidence · {radarItem?.urgency ?? "Watch"} urgency</small>
        </aside>
      </section>

      <section className={styles.scoreStrip} aria-label="Executive summary metrics">
        <article><span>Opportunity</span><strong>{radarItem?.opportunityScore ?? "—"}</strong><small>{radarItem?.opportunityLabel ?? "Under review"}</small></article>
        <article><span>Evidence</span><strong>{radarItem?.materialSignalCount ?? 0}</strong><small>material signals</small></article>
        <article><span>Open gates</span><strong>{approvals.length}</strong><small>{approvals.length ? "human decision required" : "no blocking gate"}</small></article>
        <article><span>Measurement</span><strong>{measured ? "Observed" : "Pending"}</strong><small>{measured ? "club evidence connected" : "outcome not yet established"}</small></article>
      </section>

      <section className={styles.story}>
        <article className={styles.decision}>
          <span>01 · Decision</span>
          <h2>What should we do?</h2>
          <strong>{live.recommendedAction}</strong>
          <p>{live.nextAction.label} · Owner: {live.nextAction.owner} · {live.nextAction.deadline}</p>
        </article>

        <article>
          <span>02 · Why now</span>
          <h2>What changed?</h2>
          <strong>{live.opportunity}</strong>
          <ul>
            {live.liveSignals.slice(0,4).map((signal) => <li key={signal.id}>{signal.title}</li>)}
          </ul>
        </article>

        <article>
          <span>03 · Campaign</span>
          <h2>What would activation look like?</h2>
          <strong>{campaign?.proposition.en ?? live.recommendedAction}</strong>
          <div className={styles.chips}>
            {(campaign?.activations ?? []).slice(0,5).map((activation) => <b key={activation.id}>{activation.channel}</b>)}
          </div>
          <p>{campaign?.nextApproval.en ?? live.primaryBlocker}</p>
        </article>

        <article>
          <span>04 · Commercial read</span>
          <h2>What do we know about impact?</h2>
          <strong>{live.audience.value !== null ? `${live.audience.value.toLocaleString("en-GB")} measured fans` : "Audience sizing requires club data"}</strong>
          <p>{measured ? "Observed club evidence is available. Attribution still does not equal incrementality." : "Impact remains a scenario until authorised outcome data is connected."}</p>
        </article>
      </section>

      <section className={styles.evidence}>
        <div>
          <span>Evidence confidence</span>
          <h2>What supports the recommendation — and what could change it.</h2>
        </div>
        <div className={styles.evidenceColumns}>
          <article><span>Known</span><ul>{live.known.slice(0,4).map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>Missing / assumed</span><ul>{[...live.assumptions.slice(0,2), ...live.missing.slice(0,2)].map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>Change course if</span><ul>{live.whatWouldChangeDecision.slice(0,4).map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className={styles.boardFooter}>
        <div>
          <span>Board takeaway</span>
          <strong>{live.decisionState === "HOLD" ? "The opportunity is visible, but the evidence or approvals do not support launch yet." : "The opportunity is ready for human review; execution remains controlled by the club."}</strong>
        </div>
        <div>
          <Link href={`/app/matches/${selectedId}#campaign`}>Open campaign detail →</Link>
          <Link href={`/app/learning?fixture=${selectedId}`}>Open learning →</Link>
        </div>
      </section>
    </main>
  );
}
