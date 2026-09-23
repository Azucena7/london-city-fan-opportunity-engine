import type { Metadata } from "next";
import Link from "next/link";
import styles from "./decision-room.module.css";

export const metadata: Metadata = {
  title: "Decision Room",
  description: "A football club decision view showing evidence, assumptions, blockers and what would change the decision."
};

export default function DecisionRoomPage() {
  return (
    <main className={styles.shell}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/">Fan Growth Engine</Link>
        <div className={styles.navActions}>
          <Link className={styles.textLink} href="/demo">Guided demo</Link>
          <Link className={styles.button} href="/today">Open full engine</Link>
        </div>
      </nav>

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Decision Room · London City vs Brighton</span>
          <h1>Should we activate a repeat-visit campaign before Brighton?</h1>
          <p>
            A decision view designed to show what the club knows, what it is assuming,
            what still blocks action and what would make us change course.
          </p>
        </div>
        <aside className={styles.statusCard}>
          <span>Current decision</span>
          <strong>GO WITH CONDITIONS</strong>
          <p>Proceed once the opener audience is matched against existing Brighton buyers.</p>
        </aside>
      </header>

      <section className={styles.summaryGrid}>
        <article>
          <span>Opportunity</span>
          <strong>Repeat attendance</strong>
          <p>Use the post-opener retention window before the next home fixture.</p>
        </article>
        <article>
          <span>Potential impact</span>
          <strong>+280–420 tickets</strong>
          <p>Illustrative until live CRM and ticketing data are connected.</p>
        </article>
        <article>
          <span>Decision confidence</span>
          <strong>Medium</strong>
          <p>Strong contextual case, but one key audience validation step is still missing.</p>
        </article>
        <article>
          <span>Decision deadline</span>
          <strong>Thursday</strong>
          <p>Latest useful launch point for the recommended CRM action.</p>
        </article>
      </section>

      <section className={styles.board}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTag}>EVIDENCE</span>
            <strong>What supports the decision</strong>
          </div>
          <ul>
            <li>Fixture and venue are confirmed.</li>
            <li>There is a short retention window after the high-attention opener.</li>
            <li>Ticket inventory is available for the next home fixture.</li>
            <li>CRM is the lowest-friction channel for a repeat-visit test.</li>
          </ul>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTagAmber}>ASSUMPTIONS</span>
            <strong>What we currently believe</strong>
          </div>
          <ul>
            <li>First-time opener attendees are identifiable in CRM.</li>
            <li>A meaningful share has not yet purchased Brighton.</li>
            <li>Repeat-visit propensity is stronger than cold-acquisition propensity.</li>
          </ul>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTagRed}>BLOCKERS</span>
            <strong>What must be resolved</strong>
          </div>
          <ul>
            <li>Build the opener cohort.</li>
            <li>Remove fans who already purchased Brighton.</li>
            <li>Confirm addressability and consent.</li>
          </ul>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTagBlue}>WHAT WOULD CHANGE THE DECISION</span>
            <strong>Conditions that invalidate the current plan</strong>
          </div>
          <ul>
            <li>Organic repeat purchase is already above the target threshold.</li>
            <li>The addressable non-returner audience is too small to justify activation.</li>
            <li>Tracking cannot attribute ticket sales to the campaign.</li>
          </ul>
        </article>
      </section>

      <section className={styles.actionSection}>
        <div className={styles.actionCopy}>
          <span className={styles.eyebrow}>Next required action</span>
          <h2>Build and validate the opener non-returner cohort.</h2>
          <p>Once this gate is complete, the decision moves from conditional to ready for execution.</p>
        </div>
        <div className={styles.actionMeta}>
          <div><span>Owner</span><strong>CRM / Marketing</strong></div>
          <div><span>Due</span><strong>Thursday 12:00</strong></div>
          <div><span>Success condition</span><strong>Matched, consented audience ready to activate</strong></div>
        </div>
      </section>

      <section className={styles.footerCard}>
        <div>
          <span className={styles.eyebrow}>Product principle</span>
          <h2>Make the recommendation auditable. Show why the club can trust the action.</h2>
        </div>
        <Link className={styles.button} href="/demo">Back to guided demo</Link>
      </section>
    </main>
  );
}
