import type { Metadata } from "next";
import Link from "next/link";
import styles from "./pilot.module.css";
import { MarketingNav } from "@/components/MarketingNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "Club Pilot · Marketing & Commercial Decision Workspace",
  description: "A focused AVELA pilot for football club marketing and commercial teams: 4–6 fixtures or a bounded campaign window, one or two workflows and measurable decision learning."
};

const cycle = [
  ["01", "Read", "Join the relevant signals, club context and constraints around one real decision."],
  ["02", "Decide", "Make the recommendation, owner, blockers and measurement plan explicit before activation."],
  ["03", "Move", "Execute through the club's existing tools with human approval and clear ownership."],
  ["04", "Learn", "Compare recommendation, execution and outcome so the next decision gets better."]
];

export default function PilotPage() {
  const live = getCurrentProductOpportunity();

  return (
    <main className={styles.shell}>
      <MarketingNav />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Focused club pilot · 4–6 fixtures or a bounded campaign window</span>
          <h1>Prove better decisions before integrating more.</h1>
          <p>
            Test AVELA on one or two real marketing/commercial workflows using the stack the club already has.
            The pilot is designed to answer a simple question: does cross-functional decision orchestration improve what the team decides, executes and learns?
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.button} href="/app/demo?utm_source=pilot&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=hero">Try the guided demo</Link>
            <Link className={styles.secondary} href="/for-clubs?utm_source=pilot&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero#demo">For clubs</Link>
          </div>
        </div>
        <aside className={styles.pilotCard}>
          <span>What the club is buying</span>
          <strong>A bounded decision test</strong>
          <p>4–6 fixtures or a campaign window · 1–2 workflows · one priority objective · pre-agreed measurement.</p>
        </aside>
      </header>

      <section className={styles.outcomes}>
        <article><span>01 · Decision quality</span><strong>What should we do next?</strong><p>Prioritise one action with the evidence, constraints and trade-offs visible.</p></article>
        <article><span>02 · Execution fit</span><strong>Can the club actually do it?</strong><p>Make ownership, player/sponsor rights, timing and operational blockers explicit.</p></article>
        <article><span>03 · Learning</span><strong>What changes next time?</strong><p>Keep the outcome with the decision so the next cycle starts smarter.</p></article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>The AVELA cycle</span>
          <h2>One repeatable rhythm. Four clear moments.</h2>
        </div>
        <div className={styles.timeline}>
          {cycle.map(([num, title, body]) => (
            <article key={title}>
              <div className={styles.num}>{num}</div>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Start with the current stack</span>
          <h2>Add only the context that improves the decision.</h2>
          <p>No rip-and-replace programme is required. The pilot can begin with public context and the strongest authorised aggregates the club can provide.</p>
        </div>
        <div className={styles.dataGrid}>
          <article><strong>Ticketing / CRM</strong><span>Demand, purchases, scans, contactability and repeat behaviour where authorised.</span></article>
          <article><strong>Marketing / content</strong><span>Campaign activity, channel response, social and web evidence already available.</span></article>
          <article><strong>Commercial context</strong><span>Sponsor rights, player assets, contracts, campaigns and priority moments.</span></article>
          <article><strong>Operational context</strong><span>Calendar pressure, availability, ownership, approvals and delivery capacity.</span></article>
        </div>
      </section>

      <section className={styles.week}>
        <div>
          <span className={styles.eyebrow}>What a live cycle looks like</span>
          <h2>One decision view, not another dashboard.</h2>
        </div>
        <div className={styles.weekCard}>
          <div><span>Opportunity</span><strong>{live?.opportunityLabel ?? "Under review"}</strong></div>
          <div><span>Next action</span><strong>{live?.nextAction.label ?? "Pending current fixture"}</strong></div>
          <div><span>Evidence</span><strong>{live?.audience.value !== null && live?.audience.value !== undefined ? live.audience.value.toLocaleString("en-GB") + " measured" : "Requires club data"}</strong></div>
          <div><span>Decision state</span><strong>{live?.decisionState ?? "HOLD"}</strong></div>
        </div>
        <p className={styles.note}>This example uses the same current match-plan state as the AVELA workspace. Commercial impact remains unfilled until the required audience and conversion evidence exists.</p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>End of pilot</span>
          <h2>The output is a decision about AVELA too.</h2>
          <p>The pilot should create enough evidence to choose one of three paths — not automatically justify a bigger implementation.</p>
        </div>
        <div className={styles.playbook}>
          <article><span>CONTINUE</span><strong>Expand the workflows where AVELA clearly improves decision quality.</strong></article>
          <article><span>ADJUST</span><strong>Fix missing data, process or ownership before deeper integration.</strong></article>
          <article><span>STOP</span><strong>Do not scale the product if the decision improvement is not material.</strong></article>
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrow}>Want the operating detail?</span>
          <h2>Keep the sales page simple. Put the implementation detail one level deeper.</h2>
          <p>The Operating Pack covers onboarding, data contract, roles, privacy and measurement design. The guided demo shows the product flow in three minutes.</p>
        </div>
        <div className={styles.ctaActions}>
          <Link className={styles.button} href="/app/demo?utm_source=pilot&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=final_cta">Try the guided demo</Link>
          <Link className={styles.secondary} href="/pilot/operating-pack?utm_source=pilot&utm_medium=internal_cta&utm_campaign=operating_pack&utm_content=final_cta">Open the Operating Pack</Link>
          <Link className={styles.secondary} href="/live/london-city?utm_source=pilot&utm_medium=internal_cta&utm_campaign=live_case&utm_content=final_cta">See the public live case</Link>
        </div>
      </section>
    </main>
  );
}
