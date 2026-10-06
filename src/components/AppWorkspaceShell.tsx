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
          <div className={styles.contextControls} aria-label="Workspace context">
            <div className={styles.contextChip}>
              <span>Club</span>
              <strong>London City</strong>
            </div>
            <div className={styles.contextChip}>
              <span>Window</span>
              <strong>Next 30 days</strong>
            </div>
          </div>

          <div className={styles.topbarContext}>
            <span>Marketing & commercial workspace</span>
          </div>

          <div className={styles.utility}>
            <Link href="/app/help" className={styles.iconButton} aria-label="Open AVELA help">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.2"/><path d="M12 17h.01"/></svg>
            </Link>
            <Link href="/app/season" className={styles.iconButton} aria-label="Open calendar">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>
            </Link>
            <div className={styles.profileStatus} aria-label="Current demo profile">
              <span>MT</span>
              <small>Marta</small>
            </div>
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
  const labels = {
    overview: "Overview",
    list: "List",
    board: "Board",
    calendar: "Calendar"
  } as const;

  return (
    <div className={styles.viewIndicator} aria-label={`Current layout: ${labels[value]}`}>
      <span>Layout</span>
      <strong>{labels[value]}</strong>
    </div>
  );
}

export function WorkspaceFilterButton({ label = "Filters" }: { label?: string }) {
  return (
    <span className={styles.filterStatus} aria-label={`${label} context`}>
      {label}
    </span>
  );
}
