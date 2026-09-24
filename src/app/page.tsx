import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "Fan Growth Engine",
  description: "Turn fan data into the next best action for every fixture."
};

export default function Home() {
  const live = getCurrentProductOpportunity();

  return (
    <main className="productShell">
      <ProductJourneyNav active="product" />

      <section className="productHero">
        <div>
          <span className="productEyebrow">Decision intelligence for football clubs</span>
          <h1>Turn fan data into the next best action for every fixture.</h1>
          <p className="productHeroLead">
            A decision layer for attendance, repeat visits and matchday revenue — built to show what matters now,
            what to do next and how much evidence the club really has.
          </p>

          <div className="productHeroActions">
            <Link className="productButton" href="/brief">Open live Morning Brief</Link>
            <Link className="productButtonGhost" href="/pilot">See the 90-day pilot</Link>
          </div>

          <div className="productProof" aria-label="Product outcomes">
            <div><strong>Opportunity</strong><span>Where is the most valuable fan-growth decision?</span></div>
            <div><strong>Action</strong><span>Who owns the next move, by when, and how is it measured?</span></div>
            <div><strong>Learning</strong><span>What changed after matchday, and what should change next?</span></div>
          </div>
        </div>

        <aside className="fixtureCard" aria-label="Current engine opportunity">
          <div className="fixtureCardTop">
            <span>{live?.timingLabel ?? "Current opportunity"} · Current opportunity</span>
            <span className="fixtureLive">{live ? "Live engine" : "No live case"}</span>
          </div>

          <p className="fixtureTitle">{live ? "London City vs " + live.fixture.opponent : "London City"}</p>
          <h2 className="fixtureOpportunity">{live?.opportunity ?? "No current opportunity is available."}</h2>

          <div className="fixtureMetrics">
            <div className="fixtureMetric">
              <span>Opportunity</span>
              <strong>{live?.opportunityLabel ?? "Under review"}</strong>
            </div>
            <div className="fixtureMetric">
              <span>Confidence</span>
              <strong>{live?.confidence.label ?? "—"}</strong>
            </div>
            <div className="fixtureMetric">
              <span>Readiness</span>
              <strong>{live?.readiness.label ?? "—"}</strong>
            </div>
            <div className="fixtureMetric">
              <span>Audience</span>
              <strong>{live?.audience.value ? live.audience.value.toLocaleString("en-GB") : "Requires club data"}</strong>
            </div>
          </div>

          <div className="fixtureAction">
            <span>Do next</span>
            <strong>{live?.recommendedAction ?? "Review the live evidence and define the next action."}</strong>
          </div>

          <Link className="fixtureLink" href="/opportunity">Open opportunity workspace →</Link>
        </aside>
      </section>

      <section className="productSection" id="how-it-works">
        <div className="productSectionHeader">
          <span className="productSectionKicker">The operating loop</span>
          <h2>Brief. Decide. Act. Learn.</h2>
          <p>
            The product keeps the executive view simple, then reveals evidence, assumptions and source detail only when the user needs them.
          </p>
        </div>

        <div className="productSteps">
          <article className="productStep">
            <span className="productStepNum">01 · BRIEF</span>
            <h3>What needs attention?</h3>
            <p>One fixture, one priority opportunity and the material changes around it.</p>
          </article>
          <article className="productStep">
            <span className="productStepNum">02 · DECIDE</span>
            <h3>Is there enough evidence?</h3>
            <p>Separate confirmed evidence from assumptions, missing inputs and blockers.</p>
          </article>
          <article className="productStep">
            <span className="productStepNum">03 · LEARN</span>
            <h3>What changes next?</h3>
            <p>Use measured outcomes to improve the next fixture decision rather than archive another report.</p>
          </article>
        </div>
      </section>

      <section className="productProductView">
        <div>
          <span className="productSectionKicker">Inside the product</span>
          <h2>One context. Progressive depth.</h2>
          <p>
            Commercial leaders can stay at decision level. Marketing and CRM can move into action. Analysts can inspect the evidence without changing products.
          </p>
        </div>

        <div className="productViewFlow" aria-label="Progressive product depth">
          <Link href="/brief"><span>01</span><strong>Morning Brief</strong><small>What needs attention today?</small></Link>
          <Link href="/opportunity"><span>02</span><strong>Opportunity</strong><small>Action, evidence and impact in one workspace.</small></Link>
          <Link href="/decision-room"><span>03</span><strong>Decision</strong><small>Blockers, assumptions and what changes the call.</small></Link>
          <Link href="/today"><span>04</span><strong>Analyst view</strong><small>Signals, sources and operational detail.</small></Link>
        </div>
      </section>

      <section className="productPilot">
        <div>
          <span className="productPilotMeta">90-day fan growth pilot · 6 fixtures</span>
          <h2>Prove it with one club before asking for a platform rollout.</h2>
          <p>
            Six home fixtures. One opportunity before each match, one measurable action plan and one learning loop afterwards.
          </p>
        </div>
        <Link className="productButton" href="/pilot">See how the pilot runs</Link>
      </section>

      <footer className="productFooter">
        <span>Fan Growth Engine · Independent product prototype</span>
        <span>London City is the live demonstration environment.</span>
      </footer>
    </main>
  );
}
