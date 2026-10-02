import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "Fan Growth Engine",
  description: "Turn fan data into the next best action for every fixture."
};

export default function Home() {
  const live = getCurrentProductOpportunity();

  return (
    <main className="productShell">
      <MarketingNav />

      <section className="productHero">
        <div>
          <span className="productEyebrow">Decision intelligence for football clubs</span>
          <h1>Turn fan data into the next best action for every fixture.</h1>
          <p className="productHeroLead">
            A decision layer for attendance, repeat visits and matchday revenue — built to show what matters now,
            what to do next and how much evidence the club really has.
          </p>

          <div className="productHeroActions">
            <Link className="productButton" href="/live/london-city">Explore London City live</Link>
            <Link className="productButtonGhost" href="/for-clubs">See the 90-day pilot</Link>
          </div>

          <div className="productProof" aria-label="Product outcomes">
            <div><strong>Opportunity</strong><span>Where is the most valuable fan-growth decision?</span></div>
            <div><strong>Action</strong><span>Who owns the next move, by when, and how is it measured?</span></div>
            <div><strong>Learning</strong><span>What happened after matchday, and what should change next?</span></div>
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
            <strong>{live?.nextAction.label ?? "Review the live evidence and define the next action."}</strong>
          </div>

          <Link className="fixtureLink" href="/live/london-city">Follow the live case →</Link>
        </aside>
      </section>

      <section className="productSection" id="how-it-works">
        <div className="productSectionHeader">
          <span className="productSectionKicker">The operating loop</span>
          <h2>Fixture in. Recommended plan out.</h2>
          <p>
            The engine starts from the fixture calendar, monitors the relevant signals and turns them into one recommended plan. Evidence stays underneath until the user asks why.
          </p>
        </div>

        <div className="productSteps">
          <article className="productStep">
            <span className="productStepNum">01 · OBSERVE</span>
            <h3>The fixture starts the work.</h3>
            <p>Calendar, fan, territory and attention signals are monitored automatically.</p>
          </article>
          <article className="productStep">
            <span className="productStepNum">02 · RECOMMEND</span>
            <h3>One plan, not another dashboard.</h3>
            <p>The engine proposes the audience, action, timing and measurement for the fixture.</p>
          </article>
          <article className="productStep">
            <span className="productStepNum">03 · LEARN</span>
            <h3>The next fixture gets smarter.</h3>
            <p>Measured outcomes update the evidence and improve the next recommended plan.</p>
          </article>
        </div>
      </section>

      <section className="productProductView">
        <div>
          <span className="productSectionKicker">Inside the product</span>
          <h2>See the product. Then see it working live.</h2>
          <p>
            The club app is the operational product. London City Live is the public case study showing how the engine reads fixtures, signals and outcomes in a real environment.
          </p>
        </div>

        <div className="productViewFlow" aria-label="Simplified club product">
          <Link href="/app/matches"><span>01</span><strong>Club app</strong><small>Matches, recommended plans, review and handoff for club teams.</small></Link>
          <Link href="/live/london-city"><span>02</span><strong>London City live</strong><small>See the engine applied publicly to a real club context over time.</small></Link>
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
        <span>London City Live is the public real-time case study.</span>
      </footer>
    </main>
  );
}
