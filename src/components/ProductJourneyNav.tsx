import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "home" | "campaigns" | "product" | "matches" | "opportunity" | "cases" | "demo" | "decision" | "results" | "pilot" | "impact" | "engine" | "clubs" | "credits" | "setup" | "access" | "sources";
};

const workItems = [
  { key: "home", label: "Home", hint: "What needs attention", href: "/app", glyph: "H" },
  { key: "matches", label: "Radar", hint: "Prioritise fixtures", href: "/app/matches", glyph: "R" },
  { key: "campaigns", label: "Campaigns", hint: "Review drafted plays", href: "/app/campaigns", glyph: "C" },
  { key: "results", label: "Learning", hint: "Close the loop", href: "/app/learning", glyph: "L" }
] as const;

const workspaceItems = [
  { key: "sources", label: "Sources", href: "/app/sources" },
  { key: "setup", label: "Setup", href: "/app/setup" },
  { key: "access", label: "Team", href: "/app/access" },
  { key: "credits", label: "Credits", href: "/app/credits" }
] as const;

export function ProductJourneyNav({ active }: ProductJourneyNavProps) {
  return (
    <aside className={styles.sidebar} aria-label="AVELA club app navigation">
      <div className={styles.top}>
        <Link className={styles.brand} href="/app/matches">
          <span className={styles.brandMark} aria-hidden="true" />
          <span>AVELA</span>
        </Link>
        <span className={styles.workspace}>Club workspace</span>
      </div>

      <nav className={styles.primary} aria-label="Club workflow">
        <span className={styles.sectionLabel}>Workspace</span>
        {workItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={[styles.workLink, active === item.key ? styles.active : ""].join(" ")}
          >
            <span className={styles.glyph} aria-hidden="true">{item.glyph}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </span>
          </Link>
        ))}
      </nav>

      <nav className={styles.secondary} aria-label="Club settings">
        <span className={styles.sectionLabel}>Club</span>
        {workspaceItems.map((item) => (
          <Link key={item.key} href={item.href} className={active === item.key ? styles.secondaryActive : ""}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <Link href="/app/demo" className={active === "demo" ? styles.secondaryActive : ""}>Product demo</Link>
        <Link href="/">AVELA website ↗</Link>
      </div>
    </aside>
  );
}
