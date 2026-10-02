import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "AVELA · Growth Intelligence for Women’s Football",
  description:
    "Turn every fixture into a growth opportunity. AVELA helps women’s football clubs detect the moments, audiences and actions worth acting on."
};

const packages = [
  {
    name: "Pilot",
    price: "£4,500",
    cadence: "one-off · 90 days",
    description: "Prove the workflow across six home fixtures before committing to a full-season rollout.",
    features: [
      "Up to 6 home fixtures",
      "Automated fixture monitoring",
      "Women’s-football signal layer",
      "Opportunity brief + recommended play",
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
    description: "The growth-intelligence layer for one club across the season.",
    features: [
      "Full home-fixture calendar",
      "Continuous opportunity monitoring",
      "Recommended play for every priority fixture",
      "Audience, timing and measurement draft",
      "Match-level learning loop",
      "Workspace for marketing, ticketing and commercial"
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
      "CRM / ticketing integration support",
      "Sponsor-fit and custom signal sources",
      "Custom measurement framework",
      "Multi-team stakeholder workflows",
      "Priority implementation support"
    ],
    cta: "Discuss Club Pro",
    featured: false
  }
];

const engines = [
  {
    title: "Match Intelligence",
    copy: "The fixture starts the work. AVELA reads kickoff, venue, opponent, calendar and changing context automatically."
  },
  {
    title: "Audience Growth",
    copy: "Find the audience most worth acquiring now — families, grassroots, cultural crossover, international demand or dormant fans."
  },
  {
    title: "Attendance",
    copy: "Spot demand gaps, big-stadium potential and the moments when paid activation is — or is not — justified."
  },
  {
    title: "Sponsor Opportunity",
    copy: "Connect audience, player momentum, match context and partner categories to timely activation ideas."
  },
  {
    title: "Activation",
    copy: "Turn an accepted opportunity into channels, assets, owners, timing, credits, budget range and measurement."
  },
  {
    title: "Learning",
    copy: "Compare what AVELA predicted, what the club executed and what happened so the next fixture starts smarter."
  }
];

export default function Home() {
  const live = getCurrentProductOpportunity();

  return (
    <main className="productShell">
      <MarketingNav />

      <section className="salesHero">
        <div className="salesHeroCopy">
          <span className="productEyebrow">Growth intelligence for women’s football</span>
          <h1>Every fixture is a growth opportunity.</h1>
          <p>
            AVELA continuously reads the signals around every match — audience, city, culture, ticketing,
            sponsors, players and context — then shows women’s football clubs where to act next.
          </p>
          <div className="salesHeroActions">
            <Link className="salesPrimary" href="/for-clubs#demo">Request a demo</Link>
            <Link className="salesSecondary" href="/live/london-city">See the live case</Link>
          </div>
          <div className="salesHeroTrust">
            <span>Starts from the fixture calendar.</span>
            <span>Explains every recommendation.</span>
            <span>Works with your existing stack.</span>
          </div>
        </div>

        <aside className="salesProductPreview" aria-label="Current live product example">
          <div className="salesPreviewTop">
            <span>Opportunity radar</span>
            <strong>{live?.fixture.opponent ?? "Next home fixture"}</strong>
          </div>
          <div className="salesPreviewStatus">
            <span>Opportunity detected</span>
            <h2>{live?.opportunity ?? "Review the next growth opportunity."}</h2>
          </div>
          <div className="salesPreviewGrid">
            <div><span>Decision</span><strong>{live?.decisionState ?? "HOLD"}</strong></div>
            <div><span>Confidence</span><strong>{live?.confidence.label ?? "—"}</strong></div>
            <div><span>Do next</span><strong>{live?.nextAction.label ?? "Review evidence"}</strong></div>
          </div>
          <Link href="/live/london-city">Open the evidence →</Link>
        </aside>
      </section>

      <section className="salesProblem">
        <div>
          <span className="salesKicker">The gap</span>
          <h2>Growth is accelerating. Club intelligence is still fragmented.</h2>
        </div>
        <div className="salesProblemGrid">
          <article><strong>Context</strong><p>Fixtures, city activity, player momentum, culture and football demand change every week.</p></article>
          <article><strong>Data</strong><p>Ticketing, CRM, sponsors and audience evidence live in separate systems and teams.</p></article>
          <article><strong>Action</strong><p>The hard part is still deciding what is worth doing for this fixture, right now.</p></article>
        </div>
      </section>

      <section className="salesOutcome" id="how-it-works">
        <div className="salesSectionIntro">
          <span className="salesKicker">The product</span>
          <h2>From fixture to action — without adding another dashboard to manage.</h2>
          <p>AVELA sits above the existing club stack and turns changing context into explainable growth decisions.</p>
        </div>
        <div className="salesOutcomeGrid">
          {engines.map((engine, index) => (
            <article key={engine.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{engine.title}</h3>
              <p>{engine.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="salesRoles">
        <div>
          <span className="salesKicker">Built for lean teams</span>
          <h2>The intelligence capacity you do not have to hire.</h2>
        </div>
        <div className="salesRoleList">
          <article><strong>Growth / Marketing</strong><span>Which opportunity should we activate for this match?</span></article>
          <article><strong>Ticketing</strong><span>Where is the demand gap, and which audience is most addressable?</span></article>
          <article><strong>Partnerships</strong><span>Is there a credible sponsor moment around this fixture?</span></article>
          <article><strong>Commercial</strong><span>Which decision could improve attendance, audience or matchday value?</span></article>
        </div>
      </section>

      <section className="salesProof">
        <div>
          <span className="salesKicker">Proof in public</span>
          <h2>London City Live shows the engine thinking before the result is known.</h2>
          <p>
            The live case preserves what the engine saw, what it recommended and what public evidence appeared later.
            Alignment and divergence are recorded instead of rewritten after the fact.
          </p>
          <Link className="salesSecondary" href="/live/london-city">Explore London City Live</Link>
        </div>
        <div className="salesProofQuote">
          <span>Product principle</span>
          <strong>“What did we see early enough to act on — and what happened next?”</strong>
        </div>
      </section>

      <section className="salesPricing" id="pricing">
        <div className="salesSectionIntro">
          <span className="salesKicker">Pricing</span>
          <h2>Start with six fixtures. Expand when the workflow earns its place.</h2>
          <p>Indicative starting prices for the current product stage. Final scope depends on data access and integrations.</p>
        </div>
        <div className="salesPricingGrid">
          {packages.map((item) => (
            <article key={item.name} className={item.featured ? "featured" : ""}>
              {item.featured ? <span className="salesPopular">Best fit for one club</span> : null}
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
          <h2>Give us one upcoming fixture. We’ll show you where the growth opportunity is.</h2>
          <p>
            A useful demo should feel like your club, not a generic software tour. We will walk through the signals,
            opportunity, recommended play and measurement logic around one real upcoming home match.
          </p>
        </div>
        <div className="salesDemoActions">
          <Link className="salesPrimary" href="/for-clubs#demo">Request a club demo</Link>
          <Link className="salesSecondary" href="/app/demo">Try the guided demo</Link>
        </div>
      </section>

      <footer className="productFooter">
        <span>AVELA · Growth Intelligence for Women’s Football</span>
        <span>London City Live is an independent public case study.</span>
      </footer>
    </main>
  );
}
