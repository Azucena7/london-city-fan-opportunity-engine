import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "home" | "campaigns" | "matches" | "demo" | "learning" | "setup" | "access" | "sources" | "executive" | "season" | "players" | "sponsors" | "contracts" | "help";
};

const navGroups = [
  {
    label: "Decide",
    items: [
      { key: "home", label: "Home", displayLabel: "Home", hint: "Priorities & next moves", href: "/app", icon: "home" },
      { key: "matches", label: "Radar", displayLabel: "Radar", hint: "Signals → opportunities", href: "/app/matches", icon: "radar" }
    ]
  },
  {
    label: "Plan & execute",
    items: [
      { key: "campaigns", label: "Campaigns", displayLabel: "Campaigns", hint: "Plans in execution", href: "/app/campaigns", icon: "campaigns" },
      { key: "players", label: "Player assets", displayLabel: "Players", hint: "Best-fit talent packs", href: "/app/players", icon: "players" },
      { key: "sponsors", label: "Sponsors", displayLabel: "Sponsors", hint: "Commercial opportunities", href: "/app/sponsors", icon: "sponsors" },
      { key: "season", label: "Season", displayLabel: "Calendar", hint: "Timing & context", href: "/app/season", icon: "calendar" }
    ]
  },
  {
    label: "Learn",
    items: [
      { key: "learning", label: "Learning", displayLabel: "Learning", hint: "Outcomes → next decision", href: "/app/learning", icon: "learning" }
    ]
  }
] as const;

const workItems = [...navGroups[0].items, ...navGroups[1].items, ...navGroups[2].items] as const;

function NavIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", width: 16, height: 16, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home") return <svg {...common}><path d="M4 10.5 12 4l8 6.5"/><path d="M6.5 9.5V20h11V9.5"/><path d="M10 20v-5h4v5"/></svg>;
  if (name === "radar") return <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 12 17.5 7"/><path d="M12 2v2M22 12h-2M12 22v-2M2 12h2"/></svg>;
  if (name === "campaigns") return <svg {...common}><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 14h3M13 14h3"/></svg>;
  if (name === "players") return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.7-4.2 2.5-6.2 5.5-6.2s4.8 2 5.5 6.2"/><circle cx="17" cy="9" r="2"/><path d="M15.5 14.5c2.8.2 4.4 1.9 5 5.5"/></svg>;
  if (name === "sponsors") return <svg {...common}><path d="m12 3 7 4v5c0 4.3-2.8 7.4-7 9-4.2-1.6-7-4.7-7-9V7l7-4Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if (name === "learning") return <svg {...common}><path d="M4 6.5 12 3l8 3.5-8 3.5-8-3.5Z"/><path d="M6 9.5V15c3.6 2.6 8.4 2.6 12 0V9.5"/><path d="M20 7v6"/></svg>;
  return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 14h2M12 14h2M16 14h1M8 17h2M12 17h2"/></svg>;
}

const workspaceItems = [
  { key: "executive", label: "Executive view", href: "/app/executive" },
  { key: "contracts", label: "Contracts", href: "/app/contracts" },
  { key: "sources", label: "Sources", href: "/app/sources" }
] as const;

const utilityItems = [
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
            <small>Marketing & commercial</small>
          </span>
        </Link>
        <span className={styles.workspace}>Club decision workspace</span>
      </div>

      <nav className={styles.primary} aria-label="Club workflow">
        {navGroups.map((group) => (
          <div className={styles.navGroup} key={group.label}>
            <span className={styles.sectionLabel}>{group.label}</span>
            {group.items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={[styles.workLink, active === item.key ? styles.active : ""].join(" ")}
                aria-current={active === item.key ? "page" : undefined}
              >
                <span className={styles.glyph} aria-hidden="true"><NavIcon name={item.icon} /></span>
                <span>
                  <strong>{item.displayLabel}</strong>
                  <small>{item.hint}</small>
                </span>
              </Link>
            ))}
          </div>
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
        <span className={styles.bottomLabel}>Workspace</span>
        {utilityItems.map((item) => (
          <Link key={item.key} href={item.href} className={active === item.key ? styles.secondaryActive : ""} aria-current={active === item.key ? "page" : undefined}>{item.label}</Link>
        ))}
        <Link href="/app/help" className={active === "help" ? styles.secondaryActive : ""} aria-current={active === "help" ? "page" : undefined}>Help & methodology</Link>
        <Link href="/app/demo" className={active === "demo" ? styles.secondaryActive : ""} aria-current={active === "demo" ? "page" : undefined}>Product demo</Link>
        <Link href="/">AVELA website ↗</Link>
      </div>

      <details className={styles.mobileMenu}>
        <summary>More</summary>
        <div className={styles.mobileMenuPanel}>
          <span>Club</span>
          {[...workspaceItems, ...utilityItems].map((item) => (
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
          {workItems.slice(4).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className={active === item.key ? styles.mobileActive : ""}
            >
              {item.displayLabel}
            </Link>
          ))}
          <Link href="/app/help" aria-current={active === "help" ? "page" : undefined} className={active === "help" ? styles.mobileActive : ""}>Help & methodology</Link>
          <Link href="/app/demo" aria-current={active === "demo" ? "page" : undefined} className={active === "demo" ? styles.mobileActive : ""}>Product demo</Link>
          <Link href="/">AVELA website ↗</Link>
        </div>
      </details>
    </aside>
  );
}
