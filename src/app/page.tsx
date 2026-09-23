import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";

export const metadata: Metadata = {
  title: "Fan Growth Engine",
  description: "Turn fan data into the next best action for every fixture."
};

export default function Home() {
  return (
    <main className="productShell">
      <ProductJourneyNav active="product" />

      <section className="productHero">
        <div>
          <span className="productEyebrow">Decision intelligence for football clubs</span>
          <h1>Turn fan data into the next best action for every fixture.</h1>
          <p className="productHeroLead">
            Find the highest-value fan growth opportunity before matchday, turn it into an action plan,
            and learn what worked afterwards.
          </p>
          <div className="productHeroActions">
            <Link className="productButton" href="/demo">Explore London City demo</Link>
            <a className="productButtonGhost" href="#how-it-works">See how it works</a>
          </div>
          <div className="productProof" aria-label="Product outcomes">
            <div><strong>Find the opportunity</strong><span>Connect fixture, fan, territory and market signals.</span></div>
            <div><strong>Decide what to do</strong><span>Prioritise the action, audience and timing.</span></div>
            <div><strong>Learn every match</strong><span>Measure the result and improve the next decision.</span></div>
          </div>
        </div>

        <aside className="fixtureCard" aria-label="Example opportunity card">
          <div className="fixtureCardTop">
            <span>Next fixture</span>
            <span className="fixtureLive">Guided demo</span>
          </div>
          <p className="fixtureTitle">London City vs Brighton</p>
          <h2 className="fixtureOpportunity">Convert first-time attendees into repeat visitors.</h2>
          <div className="fixtureMetrics">
            <div className="fixtureMetric"><span>Audience</span><strong>1,420 fans</strong></div>
            <div className="fixtureMetric"><span>Potential</span><strong>+280–420 tickets</strong></div>
            <div className="fixtureMetric"><span>Confidence</span><strong>Medium</strong></div>
            <div className="fixtureMetric"><span>Deadline</span><strong>Thursday</strong></div>
          </div>
          <div className="fixtureAction">
            <span>Recommended action</span>
            <strong>Launch a repeat-visit CRM campaign in the primary catchment.</strong>
          </div>
        </aside>
      </section>

      <section className="productSection" id="how-it-works">
        <div className="productSectionHeader">
          <span className="productSectionKicker">One simple operating loop</span>
          <h2>Discover. Act. Learn.</h2>
          <p>The club sees the decision first. The evidence, assumptions and source detail remain available underneath when needed.</p>
        </div>
        <div className="productSteps">
          <article className="productStep">
            <span className="productStepNum">01 · DISCOVER</span>
            <h3>Where is the opportunity?</h3>
            <p>Surface the most relevant attendance, repeat-visit or revenue opportunity around the next fixture.</p>
          </article>
          <article className="productStep">
            <span className="productStepNum">02 · ACT</span>
            <h3>What should we do?</h3>
            <p>Translate the opportunity into an audience, action, owner, deadline and decision condition.</p>
          </article>
          <article className="productStep">
            <span className="productStepNum">03 · LEARN</span>
            <h3>What actually worked?</h3>
            <p>Measure the outcome, compare it with the original hypothesis and improve the next fixture decision.</p>
          </article>
        </div>
      </section>

      <section className="productSection">
        <div className="productSectionHeader">
          <span className="productSectionKicker">Built for club teams, not analysts only</span>
          <h2>Simple on the surface. Evidence underneath.</h2>
        </div>
        <div className="productValueGrid">
          <article className="productValue">
            <h3>For commercial leaders</h3>
            <p>Opportunity, expected impact, confidence and the decision that needs attention.</p>
          </article>
          <article className="productValue">
            <h3>For marketing & CRM</h3>
            <p>The audience, channel, message, timing and measurement plan required to execute.</p>
          </article>
          <article className="productValue">
            <h3>For analysts</h3>
            <p>Sources, signal quality, assumptions, blockers and the evidence behind each recommendation.</p>
          </article>
          <article className="productValue">
            <h3>For the next fixture</h3>
            <p>A closed loop that turns every match into new club-specific learning instead of another disconnected report.</p>
          </article>
        </div>
      </section>

      <section className="productPilot">
        <div>
          <span className="productPilotMeta">90-day fan growth pilot · 6 fixtures</span>
          <h2>See what this could look like with your club.</h2>
          <p>
            Before every home fixture: one priority opportunity, one recommended action plan and one measurement framework.
            After matchday: the result and what changes next.
          </p>
        </div>
        <Link className="productButton" href="/pilot">See the 90-day pilot</Link>
      </section>

      <footer className="productFooter">
        <span>Fan Growth Engine · Independent product prototype</span>
        <span>London City is used as the live demonstration environment.</span>
      </footer>
    </main>
  );
}
