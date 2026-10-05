import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "home" | "campaigns" | "matches" | "demo" | "learning" | "setup" | "access" | "sources" | "executive" | "season" | "players" | "sponsors" | "contracts";
};

const workItems = [
  { key: "home", label: "Home", hint: "Priorities & next moves", href: "/app", glyph: "⌂" },
  { key: "matches", label: "Radar", hint: "Signals → opportunities", href: "/app/matches", glyph: "↗" },
  { key: "campaigns", label: "Campaigns", hint: "Plans in execution", href: "/app/campaigns", glyph: "▦" },
  { key: "players", label: "Player assets", hint: "Availability & best fit", href: "/app/players", glyph: "◎" },
  { key: "sponsors", label: "Sponsors", hint: "Rights, needs & fit", href: "/app/sponsors", glyph: "◇" },
  { key: "learning", label: "Learning", hint: "Outcomes & insight", href: "/app/learning", glyph: "∿" },
  { key: "season", label: "Season", hint: "Calendar & context", href: "/app/season", glyph: "◫" }
] as const;

const workspaceItems = [
  { key: "executive", label: "Executive view", href: "/app/executive" },
  { key: "contracts", label: "Contracts", href: "/app/contracts" },
  { key: "sources", label: "Sources", href: "/app/sources" },
  { key: "setup", label: "Setup", href: "/app/setup" },
  { key: "access", label: "Team", href: "/app/access" }
] as const;

export function ProductJourneyNav({ active }: ProductJourneyNavProps) {
  return (
    <aside className={styles.sidebar} aria-label="AVELA club app navigation">
      <div className={styles.top}>
        <Link className={styles.brand} href="/app" aria-label="AVELA home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandCopy}>
            <strong>AVELA</strong>
            <small>Decision intelligence</small>
          </span>
        </Link>
        <span className={styles.workspace}>Club marketing workspace</span>
      </div>

      <nav className={styles.primary} aria-label="Club workflow">
        <span className={styles.sectionLabel}>Decision workspace</span>
        {workItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={[styles.workLink, active === item.key ? styles.active : ""].join(" ")}
            aria-current={active === item.key ? "page" : undefined}
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
        <span className={styles.sectionLabel}>Club system</span>
        {workspaceItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={active === item.key ? styles.secondaryActive : ""}
            aria-current={active === item.key ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.positioning}>
          <span>Signals</span><i>→</i><span>Context</span><i>→</i><strong>Action</strong>
        </div>
        <Link href="/app/demo" className={active === "demo" ? styles.secondaryActive : ""} aria-current={active === "demo" ? "page" : undefined}>Product demo</Link>
        <Link href="/">AVELA website ↗</Link>
      </div>

      <details className={styles.mobileMenu}>
        <summary>More</summary>
        <div className={styles.mobileMenuPanel}>
          <span>Club</span>
          {workspaceItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className={active === item.key ? styles.mobileActive : ""}
            >
              {item.label}
            </Link>
          ))}
          <span>More</span>
          <Link href="/app/demo" aria-current={active === "demo" ? "page" : undefined} className={active === "demo" ? styles.mobileActive : ""}>Product demo</Link>
          <Link href="/">AVELA website ↗</Link>
        </div>
      </details>
    </aside>
  );
}
