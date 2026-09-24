import type { Metadata } from "next";
import Link from "next/link";
import styles from "./pilot.module.css";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "90-Day Fan Growth Pilot",
  description: "A six-fixture pilot to prove how Fan Growth Engine can improve attendance, repeat visits and commercial decision-making."
};

const deliverables = [
  ["Before each fixture", "One priority growth opportunity, recommended action and decision brief."],
  ["During the week", "Audience, channel, owner, timing and measurement plan."],
  ["After matchday", "Result, learning and what changes for the next fixture."],
  ["At the end", "A club-specific Fan Growth Playbook built from six live cycles."]
];

export default function PilotPage() {
  const live = getCurrentProductOpportunity();

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="pilot" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>90-day fan growth pilot · 6 fixtures</span>
          <h1>Prove the value with one live matchday cycle at a time.</h1>
          <p>
            A practical entry product for clubs: we use the data already available, identify the highest-value fan growth opportunity before each home fixture,
            turn it into an action plan and measure what happened afterwards.
          </p>
        </div>
        <aside className={styles.pilotCard}>
          <span>What the club buys</span>
          <strong>6 decision cycles</strong>
          <p>Not a software migration. A focused operating pilot around attendance, repeat visits and measurable commercial outcomes.</p>
        </aside>
      </header>

      <section className={styles.outcomes}>
        <article><span>Primary outcome</span><strong>Attendance growth</strong><p>More effective fixture-by-fixture demand generation.</p></article>
        <article><span>Second outcome</span><strong>Repeat visits</strong><p>Turn first-time attendance into a measurable retention engine.</p></article>
        <article><span>Commercial outcome</span><strong>Revenue learning</strong><p>Understand which actions and audiences justify further investment.</p></article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>The operating model</span>
          <h2>One simple rhythm for every home fixture.</h2>
        </div>
        <div className={styles.timeline}>
          {deliverables.map(([title, body], index) => (
            <article key={title}>
              <div className={styles.num}>0{index + 1}</div>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>What we need from the club</span>
          <h2>Start with the data you already have.</h2>
          <p>No system replacement is required for the pilot. We begin with the strongest available sources and make data gaps visible.</p>
        </div>
        <div className={styles.dataGrid}>
          <article><strong>Ticketing</strong><span>buyers, fixtures, products, transactions</span></article>
          <article><strong>CRM</strong><span>contactability, consent, segments, campaign history</span></article>
          <article><strong>Marketing</strong><span>paid campaigns, email, social and web traffic</span></article>
          <article><strong>Context</strong><span>fixture calendar, territory, travel and public demand signals</span></article>
        </div>
      </section>

      <section className={styles.week}>
        <div>
          <span className={styles.eyebrow}>Example weekly output</span>
          <h2>By Thursday, the club knows what decision needs to be made.</h2>
        </div>
        <div className={styles.weekCard}>
          <div><span>Opportunity</span><strong>{live?.opportunityLabel ?? "Under review"}</strong></div>
          <div><span>Action</span><strong>{live?.nextAction.label ?? "Pending current fixture"}</strong></div>
          <div><span>Audience</span><strong>{live?.audience.value !== null && live?.audience.value !== undefined ? live.audience.value.toLocaleString("en-GB") + " measured" : "Requires club data"}</strong></div>
          <div><span>Decision</span><strong>{live?.decisionState ?? "HOLD"}</strong></div>
        </div>
        <p className={styles.note}>This example reads the same current product state as Morning Brief and Decision Room. Commercial impact remains unfilled until the required audience and conversion evidence exists.</p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>End-of-pilot asset</span>
          <h2>The club leaves with a Fan Growth Playbook, not just six reports.</h2>
        </div>
        <div className={styles.playbook}>
          <article><span>WHO COMES</span><strong>Which audiences actually attend</strong></article>
          <article><span>WHO RETURNS</span><strong>Which cohorts build repeat behaviour</strong></article>
          <article><span>WHAT CONVERTS</span><strong>Which actions create measurable demand</strong></article>
          <article><span>WHERE TO GROW</span><strong>Which territories and fixtures deserve attention</strong></article>
          <article><span>WHAT TO STOP</span><strong>Which assumptions fail under measurement</strong></article>
          <article><span>WHAT TO DO NEXT</span><strong>A prioritised growth plan for the next cycle</strong></article>
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrow}>The commercial proposition</span>
          <h2>Six fixtures to test whether the engine improves decision quality and produces measurable fan outcomes.</h2>
          <p>The live London City environment demonstrates the workflow. A club pilot replaces missing assumptions with authorised club evidence and pre-agreed measurement rules.</p>
        </div>
        <div className={styles.ctaActions}>
          <Link className={styles.button} href="/opportunity">Explore the live opportunity</Link>
          <Link className={styles.secondary} href="/decision-room">See the Decision Room</Link>
          <Link className={styles.secondary} href="/pilot/operating-pack">Open the Pilot Operating Pack</Link>
          <Link className={styles.secondary} href="/pilot/rehearsal">See the synthetic data rehearsal</Link>
        </div>
      </section>
    </main>
  );
}
