import type { ReactNode } from "react";
import styles from "./WorkspaceUI.module.css";

export function WorkspaceCard({
  children,
  className = "",
  tone = "default"
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "accent" | "action";
}) {
  return <section className={[styles.card, styles[tone], className].join(" ")}>{children}</section>;
}

export function WorkspaceSectionHeader({
  eyebrow,
  title,
  action
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function WorkspaceBadge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "teal" | "coral" | "warning" | "danger" | "success";
}) {
  return <span className={styles.badge} data-tone={tone}>{children}</span>;
}

export function WorkspaceDrawer({
  label,
  title,
  children
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <details className={styles.drawer}>
      <summary>
        <div><span>{label}</span><strong>{title}</strong></div>
        <b>Open</b>
      </summary>
      <div className={styles.drawerBody}>{children}</div>
    </details>
  );
}
