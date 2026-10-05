import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./AppWorkspaceShell.module.css";

type ActiveNav = ComponentProps<typeof ProductJourneyNav>["active"];

export function AppWorkspaceShell({
  active,
  title,
  subtitle,
  eyebrow,
  children,
  actions
}: {
  active: ActiveNav;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <ProductJourneyNav active={active} />
      <div className={`${styles.frame} productAppShell`}>
        <header className={styles.topbar}>
          <div className={styles.contextControls}>
            <label className={styles.compactSelect}>
              <span>Club</span>
              <select defaultValue="london-city" aria-label="Club">
                <option value="london-city">London City</option>
              </select>
            </label>
            <label className={styles.compactSelect}>
              <span>Window</span>
              <select defaultValue="30d" aria-label="Time window">
                <option value="7d">Next 7 days</option>
                <option value="30d">Next 30 days</option>
                <option value="season">Season</option>
              </select>
            </label>
          </div>

          <label className={styles.search}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
            <input type="search" placeholder="Search signals, campaigns, players…" aria-label="Search AVELA" />
            <kbd>⌘K</kbd>
          </label>

          <div className={styles.utility}>
            <Link href="/app/season" className={styles.iconButton} aria-label="Open calendar">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>
            </Link>
            <button type="button" className={styles.iconButton} aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
              <span className={styles.notificationDot} />
            </button>
            <button type="button" className={styles.profile} aria-label="Open profile">
              <span>MT</span>
              <small>Marta</small>
            </button>
          </div>
        </header>

        <div className={styles.pagebar}>
          <div>
            {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
            <div className={styles.titleRow}>
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export function WorkspaceViewSwitcher({
  value = "overview"
}: {
  value?: "overview" | "list" | "board" | "calendar";
}) {
  const items = [
    ["overview", "Overview"],
    ["list", "List"],
    ["board", "Board"],
    ["calendar", "Calendar"]
  ] as const;

  return (
    <div className={styles.viewSwitcher} aria-label="View">
      {items.map(([key, label]) => (
        <button key={key} type="button" data-active={value === key ? "true" : "false"}>{label}</button>
      ))}
    </div>
  );
}

export function WorkspaceFilterButton({ label = "Filters" }: { label?: string }) {
  return (
    <button className={styles.filterButton} type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg>
      {label}
    </button>
  );
}
