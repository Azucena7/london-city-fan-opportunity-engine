import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "product" | "matches" | "brief" | "opportunity" | "cases" | "demo" | "decision" | "results" | "pilot" | "impact" | "engine" | "clubs" | "credits" | "setup" | "access";
};

const primaryItems = [
  { key: "matches", label: "Radar", href: "/app/matches" },
  { key: "brief", label: "Campaigns", href: "/app/campaigns" },
  { key: "results", label: "Learning", href: "/app/learning" }
] as const;

const clubItems = [
  { key: "setup", label: "Setup", description: "Objectives, channels and fixture source", href: "/app/setup" },
  { key: "access", label: "Team", description: "Workspace access and roles", href: "/app/access" },
  { key: "credits", label: "Credits", description: "Usage and plan allowance", href: "/app/credits" },
  { key: "demo", label: "Demo", description: "Guided product walkthrough", href: "/app/demo" }
] as const;

export function ProductJourneyNav({ active }: ProductJourneyNavProps) {
  return (
    <nav className={styles.nav} aria-label="AVELA club app navigation">
      <Link className={styles.brand} href="/app/matches">
        <span className={styles.brandMark} aria-hidden="true" />
        AVELA
      </Link>

      <div className={styles.links}>
        {primaryItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={[styles.link, active === item.key ? styles.active : ""].join(" ")}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className={styles.account}>
        <span className={styles.workspace}>Club workspace</span>
        <details className={styles.more}>
          <summary className={clubItems.some((item) => item.key === active) ? styles.activeSummary : ""}>Club</summary>
          <div className={styles.menu}>
            {clubItems.map((item) => (
              <Link key={item.key} href={item.href} className={active === item.key ? styles.menuActive : ""}>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </Link>
            ))}
          </div>
        </details>
        <Link className={styles.engine} href="/">
          AVELA.com ↗
        </Link>
      </div>
    </nav>
  );
}
