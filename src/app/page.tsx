import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "Fan Growth Engine · Decision intelligence for football clubs",
  description: "Turn every home fixture into a measurable fan-growth plan. See the product, compare packages and request a club demo."
};

const packages = [
  {
    name: "Pilot",
    price: "£4,500",
    cadence: "one-off · 90 days",
    description: "Prove the workflow on six home fixtures before committing to a full-season rollout.",
    features: [
      "Up to 6 home fixtures",
      "Automated fixture monitoring",
      "Recommended match plan",
      "Signal and evidence review",
      "Activation draft + approval gates",
      "Post-match learning review"
    ],
    cta: "Request pilot demo",
    featured: false
  },
  {
    name: "Club",
    price: "£1,500",
    cadence: "per month · annual",
    description: "The core operating product for one club across the season.",
    features: [
      "Full home-fixture calendar",
      "Continuous signal monitoring",
      "Recommended plan for every priority fixture",
      "Audience, timing and measurement draft",
      "Match-level learning loop",
      "Club workspace for marketing and ticketing"
    ],
    cta: "Request club demo",
    featured: true
  },
  {
    name: "Club Pro",
    price: "£3,000",
    cadence: "per month · annual",
    description: "For clubs that want deeper data connections, custom signals and a more embedded operating model.",
    features: [
      "Everything in Club",
      "Custom signal sources",
      "CRM / ticketing integration support",
      "Custom measurement framework",
      "Multi-team stakeholder workflows",
      "Priority implementation support"
    ],
    cta: "Discuss Club Pro",
    featured: false
  }
];

export default function Home() {
  const live = getCurrentProductOpportunity();

  return (
    <main className="productShell">
      <MarketingNav />

      <section className="salesHero">
        <div className="salesHeroCopy">
          <span className="productEyebrow">Fan growth operating system for football clubs</span>
          <h1>Every home fixture should come with a plan to grow the crowd.</h1>
          <p>
            Fan Growth Engine monitors the fixture, the city, football demand and club signals — then gives your team
            one recommended fan-growth plan, the evidence behind it and what to measure next.
          </p>
          <div className="salesHeroActions">
            <Link className="salesPrimary" href="/for-clubs#demo">Request a demo</Link>
            <Link className="salesSecondary" href="/live/london-city">See London City live</Link>
          </div>
          <div className="salesHeroTrust">
            <span>No new dashboard to manage.</span>
            <span>Starts from your fixture calendar.</span>
            <span>Built around measurable actions.</span>
          </div>
        </div>

        <aside className="salesProductPreview" aria-label="Current live product example">
          <div className="salesPreviewTop">
            <span>Live product example</span>
            <strong>{live?.fixture.opponent ?? "Next home fixture"}</strong>
          </div>
          <div className="salesPreviewStatus">
            <span>Recommended focus</span>
            <h2>{live?.opportunity ?? "Review the next home fixture opportunity."}</h2>
          </div>
          <div className="salesPreviewGrid">
            <div><span>Decision</span><strong>{live?.decisionState ?? "HOLD"}</strong></div>
            <div><span>Confidence</span><strong>{live?.confidence.label ?? "—"}</strong></div>
            <div><span>Do next</span><strong>{live?.nextAction.label ?? "Review evidence"}</strong></div>
          </div>
          <Link href="/live/london-city">Follow the live case →</Link>
        </aside>
      </section>

      <section className="salesProblem">
        <div>
          <span className="salesKicker">Why clubs need it</span>
          <h2>Fan growth work is fragmented across too many teams, tools and signals.</h2>
        </div>
        <div className="salesProblemGrid">
          <article><strong>Fixtures</strong><p>Match importance changes week by week, but planning often starts manually.</p></article>
          <article><strong>Signals</strong><p>Ticketing, CRM, local events, football demand and club activity sit in separate places.</p></article>
          <article><strong>Decisions</strong><p>Teams still have to translate all that information into one action everyone understands.</p></article>
        </div>
      </section>

      <section className="salesOutcome" id="how-it-works">
        <div className="salesSectionIntro">
          <span className="salesKicker">What the club gets</span>
          <h2>One decision workflow for every priority fixture.</h2>
          <p>Simple on the surface. Evidence underneath when your team needs it.</p>
        </div>
        <div className="salesOutcomeGrid">
          <article><span>01</span><h3>Match detected</h3><p>The fixture calendar starts the work automatically.</p></article>
          <article><span>02</span><h3>Signals interpreted</h3><p>The engine watches relevant demand, territory and club context.</p></article>
          <article><span>03</span><h3>Plan recommended</h3><p>Audience, action, timing, owner and measurement arrive as one draft.</p></article>
          <article><span>04</span><h3>Team reviews</h3><p>Keep, exclude or inspect the evidence before handoff.</p></article>
          <article><span>05</span><h3>Matchday measured</h3><p>Observed results stay separate from assumptions and attribution.</p></article>
          <article><span>06</span><h3>Next match improves</h3><p>Learning feeds the next fixture instead of disappearing into a report.</p></article>
        </div>
      </section>

      <section className="salesRoles">
        <div>
          <span className="salesKicker">Built for the people doing the work</span>
          <h2>Useful across marketing, ticketing, CRM and commercial.</h2>
        </div>
        <div className="salesRoleList">
          <article><strong>Marketing</strong><span>What should we activate for this match?</span></article>
          <article><strong>Ticketing</strong><span>Which audience or demand gap matters now?</span></article>
          <article><strong>CRM</strong><span>Who is eligible, reachable and worth reactivating?</span></article>
          <article><strong>Commercial</strong><span>What could improve attendance, repeat visits or matchday value?</span></article>
        </div>
      </section>

      <section className="salesProof">
        <div>
          <span className="salesKicker">See it before you buy it</span>
          <h2>London City Live shows the engine thinking in public.</h2>
          <p>
            Follow what the engine saw before a fixture, what it recommended and what public evidence appeared later.
            Alignment is recorded alongside divergence — not rewritten after the fact.
          </p>
          <Link className="salesSecondary" href="/live/london-city">Explore the live case</Link>
        </div>
        <div className="salesProofQuote">
          <span>Live case principle</span>
          <strong>“What did the engine see before the match — and what happened next?”</strong>
        </div>
      </section>

      <section className="salesPricing" id="pricing">
        <div className="salesSectionIntro">
          <span className="salesKicker">Pricing</span>
          <h2>Start small. Prove the workflow. Expand when it earns its place.</h2>
          <p>Indicative starting prices for the current product stage. Final scope depends on data access and integrations.</p>
        </div>
        <div className="salesPricingGrid">
          {packages.map((item) => (
            <article key={item.name} className={item.featured ? "featured" : ""}>
              {item.featured ? <span className="salesPopular">Most practical for one club</span> : null}
              <div className="salesPriceHead">
                <span>{item.name}</span>
                <strong>{item.price}</strong>
                <small>{item.cadence}</small>
              </div>
              <p>{item.description}</p>
              <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <Link href="/for-clubs#demo">{item.cta} →</Link>
            </article>
          ))}
        </div>
        <p className="salesPricingNote">All prices exclude VAT where applicable. Data integrations and custom implementation may be scoped separately.</p>
      </section>

      <section className="salesDemo" id="demo">
        <div>
          <span className="salesKicker">Request a demo</span>
          <h2>Bring us your fixture calendar. We’ll show you what the product would do with it.</h2>
          <p>
            A useful demo should feel like your club, not a generic software tour. We can walk through one upcoming
            home fixture, the signals we would monitor and the plan the engine would produce.
          </p>
        </div>
        <div className="salesDemoActions">
          <Link className="salesPrimary" href="/for-clubs#demo">Request a club demo</Link>
          <Link className="salesSecondary" href="/app/matches">Open the product</Link>
        </div>
      </section>

      <footer className="productFooter">
        <span>Fan Growth Engine · Decision intelligence for football clubs</span>
        <span>London City Live is an independent public case study.</span>
      </footer>
    </main>
  );
}
