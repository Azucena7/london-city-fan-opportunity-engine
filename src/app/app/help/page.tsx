import type { Metadata } from "next";
import Link from "next/link";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { WorkspaceBadge, WorkspaceCard, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./help.module.css";

export const metadata: Metadata = {
  title: "Help · AVELA",
  description: "Understand AVELA workflows, decision states, evidence states and methodology."
};

const decisionStates = [
  ["ACT", "A material opportunity is ready for action or immediate review.", "act"],
  ["REVIEW", "A human decision is required before work can move forward.", "review"],
  ["BLOCKED", "A required approval, source, constraint or dependency is missing.", "blocked"],
  ["MONITOR", "Watch the evidence; AVELA does not recommend action yet.", "monitor"],
  ["READY", "The current stage is prepared for the next governed step.", "ready"],
  ["MEASURED", "Authorised outcome evidence is available after execution.", "measured"]
] as const;

const evidenceStates = [
  ["Observed", "Directly present in an authorised or public source."],
  ["Verified", "Reviewed and accepted for decision use with provenance."],
  ["Modelled", "Scenario or estimate; useful for planning, not treated as fact."],
  ["Missing", "Required evidence is unavailable; AVELA should say so explicitly."]
] as const;

const workflows = [
  { title: "Fixture decision", path: "Fixture → signals → opportunity → recommended play → review", href: "/app/matches" },
  { title: "Campaign", path: "Decision → campaign scope → approvals → handoff → measurement", href: "/app/campaigns" },
  { title: "Player assets", path: "Campaign need → recommended pack → alternatives → commit", href: "/app/players" },
  { title: "Sponsor intelligence", path: "Opportunity → evidence → readiness → review → governed commitment", href: "/app/sponsors" },
  { title: "Learning", path: "Recommendation → execution evidence → outcome → next decision", href: "/app/learning" }
] as const;

const faqs = [
  ["Is AVELA a dashboard?", "No. AVELA is a decision-intelligence layer. It prioritises what deserves attention, explains why, and connects the decision to governed execution and learning."],
  ["Does AVELA replace CRM, ticketing, Blinkfire or project-management tools?", "No. Those systems can remain systems of record or execution. AVELA sits above them as the decision layer."],
  ["Does AVELA act without humans?", "It can detect, rank and recommend automatically. Material club decisions, external launch, spend and contractual commitments remain human-controlled unless a specific authorised connector says otherwise."],
  ["Why does AVELA sometimes show missing rather than a number?", "Because missing evidence is not zero. AVELA keeps unknown, modelled, observed and verified states separate."],
  ["Can a recommendation change?", "Yes. A new signal, player availability change, calendar conflict, approval, contract clause or capacity constraint can change the recommended next move. The reason should remain inspectable."],
  ["What should I do first?", "Open Home for priorities, Radar for upcoming fixture opportunities, then follow the linked decision workspace rather than navigating module-by-module."]
] as const;

export default function HelpPage() {
  return (
    <AppWorkspaceShell
      active="help"
      eyebrow="Help & methodology"
      title="How AVELA works"
      subtitle="Use this space to understand the product without carrying methodology and explanations into every operational screen."
    >
      <WorkspaceCard className={styles.startCard} tone="action">
        <div>
          <span>Start here</span>
          <h2>AVELA turns changing club context into a governed next decision.</h2>
          <p>The core loop is simple on the surface. Evidence sits underneath and stays inspectable when you need it.</p>
        </div>
        <div className={styles.coreLoop} aria-label="AVELA decision loop">
          {["Signals","Context","Opportunity","Decision","Execution","Learning"].map((item,index) => (
            <div key={item}><span>{String(index + 1).padStart(2,"0")}</span><strong>{item}</strong></div>
          ))}
        </div>
      </WorkspaceCard>

      <section className={styles.section}>
        <WorkspaceSectionHeader eyebrow="Decision language" title="The same states should mean the same thing everywhere" />
        <div className={styles.stateGrid}>
          {decisionStates.map(([label,copy,tone]) => (
            <article key={label} data-tone={tone}>
              <WorkspaceBadge tone={label === "ACT" ? "coral" : label === "REVIEW" ? "warning" : label === "BLOCKED" ? "danger" : label === "READY" || label === "MEASURED" ? "success" : "teal"}>{label}</WorkspaceBadge>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <WorkspaceSectionHeader eyebrow="Evidence language" title="Truth state before visual confidence" />
        <div className={styles.evidenceGrid}>
          {evidenceStates.map(([label,copy]) => <article key={label}><strong>{label}</strong><p>{copy}</p></article>)}
        </div>
      </section>

      <section className={styles.section}>
        <WorkspaceSectionHeader eyebrow="Workflows" title="Follow the decision, not the menu" />
        <div className={styles.workflowList}>
          {workflows.map((item,index) => (
            <Link href={item.href} key={item.title}>
              <span>{String(index + 1).padStart(2,"0")}</span>
              <div><strong>{item.title}</strong><small>{item.path}</small></div>
              <b>Open →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.helpGrid}>
        <WorkspaceCard>
          <WorkspaceSectionHeader eyebrow="Methodology" title="How to read AVELA evidence" />
          <div className={styles.rules}>
            <p><strong>Opportunity ≠ confidence.</strong> A strong opportunity can still rely on incomplete evidence.</p>
            <p><strong>Attribution ≠ incrementality.</strong> Campaign-linked outcomes do not prove causal lift.</p>
            <p><strong>Planning ≠ contract truth.</strong> Player and sponsor scenarios remain advisory until governed contract evidence supports them.</p>
            <p><strong>Calendar pressure ≠ opportunity score.</strong> Timing can raise attention without inflating the underlying opportunity.</p>
          </div>
        </WorkspaceCard>

        <WorkspaceCard>
          <WorkspaceSectionHeader eyebrow="Where to go" title="Choose by the question you have" />
          <div className={styles.routeGrid}>
            <Link href="/app"><span>What needs attention?</span><strong>Home</strong></Link>
            <Link href="/app/matches"><span>Where is the next opportunity?</span><strong>Radar</strong></Link>
            <Link href="/app/campaigns"><span>What is moving or blocked?</span><strong>Campaigns</strong></Link>
            <Link href="/app/season"><span>What is coming or colliding?</span><strong>Calendar</strong></Link>
            <Link href="/app/learning"><span>What did we learn?</span><strong>Learning</strong></Link>
            <Link href="/app/sources"><span>What evidence is available?</span><strong>Sources</strong></Link>
          </div>
        </WorkspaceCard>
      </section>

      <section className={styles.section}>
        <WorkspaceSectionHeader eyebrow="FAQ" title="Questions users should not have to resolve inside operational screens" />
        <div className={styles.faq}>
          {faqs.map(([question,answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </AppWorkspaceShell>
  );
}
