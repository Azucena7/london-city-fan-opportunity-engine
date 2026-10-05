import Link from "next/link";
import styles from "./DecisionHandoffStrip.module.css";

export function DecisionHandoffStrip({
  active,
  fixtureId,
  campaignId
}: {
  active: "decision" | "campaign" | "players" | "learning";
  fixtureId?: string | null;
  campaignId?: string | null;
}) {
  const steps = [
    { key: "decision", label: "Decide", hint: "Opportunity brief", href: fixtureId ? "/app/matches/" + fixtureId : "/app/matches" },
    { key: "campaign", label: "Campaign", hint: "Scope & approvals", href: "/app/campaigns" },
    { key: "players", label: "Players", hint: "Talent fit", href: campaignId ? "/app/players?campaign=" + campaignId : "/app/players" },
    { key: "learning", label: "Learning", hint: "Outcome → next move", href: fixtureId ? "/app/learning?fixture=" + fixtureId : "/app/learning" }
  ] as const;

  return (
    <nav className={styles.strip} aria-label="Decision workflow">
      <span className={styles.label}>Decision flow</span>
      <div>
        {steps.map((step,index) => (
          <Link
            key={step.key}
            href={step.href}
            aria-current={active === step.key ? "step" : undefined}
          >
            <span>{String(index + 1).padStart(2,"0")}</span>
            <strong>{step.label}</strong>
            <small>{step.hint}</small>
          </Link>
        ))}
      </div>
    </nav>
  );
}
