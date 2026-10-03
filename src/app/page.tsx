import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { CommercialSignalStage } from "@/components/CommercialSignalStage";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { decisionValidation } from "@/lib/data";
import styles from "./commercial-home.module.css";

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
    features: ["6 home fixtures", "Opportunity Radar", "Recommended play", "Campaign draft", "Learning review"],
    cta: "Request pilot demo"
  },
  {
    name: "Club",
    price: "£1,500",
    cadence: "per month · annual",
    description: "The growth-intelligence layer for one club across the season.",
    features: ["Full home calendar", "Continuous monitoring", "Club context", "Campaign workflow", "Learning loop"],
    cta: "Request club demo"
  },
  {
    name: "Club Pro",
    price: "£3,000",
    cadence: "per month · annual",
    description: "Deeper data connections, custom signals and a more embedded operating model.",
    features: ["Everything in Club", "CRM / ticketing support", "Custom signals", "Measurement framework", "Priority implementation"],
    cta: "Discuss Club Pro"
  }
];

const flow = [
  ["01", "Read", "Fixture, audience, city, player, culture and demand signals."],
  ["02", "Decide", "Prioritise one opportunity worth attention now."],
  ["03", "Act", "Turn the accepted play into channels, assets, owners and timing."],
  ["04", "Learn", "Compare what was predicted, executed and measured before the next fixture."]
] as const;

export default function Home() {
  const live = getCurrentProductOpportunity();
  const proof = decisionValidation.cases[0];

  return (
    <main className={styles.shell}>
      <MarketingNav />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Growth intelligence for women’s football</span>
          <h1>Know where to act before the moment passes.</h1>
          <p className={styles.heroLead}>
            AVELA turns every home fixture into a live growth decision — reading the signals around the match,
            identifying what matters now and showing the club one play worth reviewing.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/for-clubs#demo">Request a demo</Link>
            <Link className={styles.textLink} href="/live/london-city">See AVELA thinking in public ↗</Link>
          </div>
          <div className={styles.heroMeta}>
            <span>Not another CRM.</span>
            <span>Not another dashboard.</span>
            <span>A decision layer above the club stack.</span>
          </div>
        </div>
        <CommercialSignalStage />
      </section>

      <section className={styles.signalTicker} aria-label="Women’s-football signal layer">
        <span>PLAYER MOMENTUM</span>
        <span>FAMILY & GRASSROOTS</span>
        <span>ATTENDANCE DEMAND</span>
        <span>CULTURAL CROSSOVER</span>
        <span>FIXTURE OVERLAP</span>
        <span>PARTNER FIT</span>
      </section>

      <section className={styles.manifesto}>
        <div>
          <span className={styles.kicker}>The missing layer</span>
          <h2>Clubs already have tools. What they lack is the decision between the signal and the campaign.</h2>
        </div>
        <div className={styles.manifestoText}>
          <p>
            Ticketing knows who bought. CRM knows who can be reached. Social knows what was published.
            None of them decides which opportunity deserves attention for the next home fixture.
          </p>
          <p>
            AVELA sits above those systems and turns changing context into a clear, explainable growth decision.
          </p>
        </div>
      </section>

      <section className={styles.productTheatre} id="how-it-works">
        <div className={styles.productIntro}>
          <span className={styles.kicker}>How AVELA works</span>
          <h2>One continuous loop. Four distinct decisions.</h2>
        </div>
        <div className={styles.flow}>
          {flow.map(([num,title,copy]) => (
            <article key={title}>
              <span>{num}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.liveProof}>
        <div className={styles.liveCopy}>
          <span className={styles.kicker}>Proof in public</span>
          <h2>See what AVELA saw before London City announced it.</h2>
          <p>
            The Brighton hypothesis was time-stamped on 15 September. A comparable London City activation became public
            on 18 September. That is evidence of relevance — not evidence that the club saw or used AVELA.
          </p>
          <div className={styles.proofPair}>
            <article><span>15 Sep · AVELA saw</span><strong>{proof.hypothesis.en}</strong></article>
            <article><span>18 Sep · London City announced</span><strong>{proof.observedAction.en}</strong></article>
          </div>
          <div className={styles.proofActions}>
            <Link className={styles.primaryLight} href="/case-study">See the evidence</Link>
            <Link className={styles.proofTextLink} href="/live/london-city">Open London City Live ↗</Link>
          </div>
        </div>
        <div className={styles.livePanel}>
          <div className={styles.liveTop}>
            <span>Current live case</span>
            <strong>{live?.fixture.opponent ?? "Next home fixture"}</strong>
          </div>
          <div className={styles.liveDecision}>
            <span>Opportunity</span>
            <strong>{live?.opportunity ?? "Review current evidence."}</strong>
          </div>
          <div className={styles.liveFacts}>
            <div><span>State</span><strong>{live?.decisionState ?? "HOLD"}</strong></div>
            <div><span>Confidence</span><strong>{live?.confidence.label ?? "—"}</strong></div>
            <div><span>Do next</span><strong>{live?.nextAction.label ?? "Review evidence"}</strong></div>
          </div>
        </div>
      </section>

      <section className={styles.difference}>
        <div className={styles.differenceTitle}>
          <span className={styles.kicker}>What AVELA is — and is not</span>
          <h2>Built to sharpen the club’s judgement, not replace the club’s stack.</h2>
        </div>
        <div className={styles.differenceRows}>
          <div><span>01</span><strong>Systems of record stay where they are.</strong><p>CRM, ticketing, social and analytics remain the places clubs store and execute work.</p></div>
          <div><span>02</span><strong>Evidence stays separate from preference.</strong><p>Club objectives explain fit. They do not manufacture an opportunity or inflate confidence.</p></div>
          <div><span>03</span><strong>Execution stays truthful.</strong><p>Connected routes are explicit. Unsupported actions remain handoffs rather than simulated automation.</p></div>
        </div>
      </section>

      <section className={styles.roles}>
        <div>
          <span className={styles.kicker}>Built for lean teams</span>
          <h2>The intelligence capacity you do not have to hire.</h2>
        </div>
        <div className={styles.roleRail}>
          <span>GROWTH</span>
          <span>MARKETING</span>
          <span>TICKETING</span>
          <span>COMMERCIAL</span>
          <span>PARTNERSHIPS</span>
          <span>LEADERSHIP</span>
        </div>
      </section>

      <section className={styles.pricing} id="pricing">
        <div className={styles.pricingIntro}>
          <span className={styles.kicker}>Start small</span>
          <h2>Prove the decision loop before you scale it.</h2>
          <p>Indicative starting prices. Final scope depends on club data access and integrations.</p>
        </div>
        <div className={styles.priceGrid}>
          {packages.map((item,index) => (
            <article key={item.name} className={index === 1 ? styles.featured : ""}>
              <div className={styles.priceTop}>
                <span>{item.name}</span>
                <strong>{item.price}</strong>
                <small>{item.cadence}</small>
              </div>
              <p>{item.description}</p>
              <ul>{item.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
              <Link href="/for-clubs#demo">{item.cta} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <span className={styles.kicker}>Bring your next six home fixtures</span>
          <h2>Run AVELA as a 90-day decision pilot.</h2>
          <p>
            Start with the real calendar. AVELA ranks the fixtures, explains the signals, proposes the play and preserves
            what was predicted so the club can review what actually happened.
          </p>
          <div className={styles.pilotPromise}>
            <span>01 · Radar across six home fixtures</span>
            <span>02 · Opportunity briefs and signal what-if</span>
            <span>03 · Campaign drafts with human approval</span>
            <span>04 · Prediction vs reality learning review</span>
          </div>
        </div>
        <div>
          <Link className={styles.primaryDark} href="/for-clubs#demo">Request the 90-day pilot</Link>
          <Link className={styles.finalLink} href="/app/demo">Try the 3-minute product demo ↗</Link>
          <Link className={styles.finalLink} href="/case-study">Review London City proof ↗</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>AVELA</strong>
        <span>Growth intelligence for women’s football.</span>
        <span>London City Live is an independent public case study.</span>
      </footer>
    </main>
  );
}
