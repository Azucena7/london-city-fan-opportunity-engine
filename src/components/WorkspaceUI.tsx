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


export type UniversalDecisionState = "ACT" | "REVIEW" | "BLOCKED" | "MONITOR" | "READY" | "MEASURED";

const stateTone: Record<UniversalDecisionState, "coral" | "warning" | "danger" | "teal" | "success"> = {
  ACT: "coral",
  REVIEW: "warning",
  BLOCKED: "danger",
  MONITOR: "teal",
  READY: "success",
  MEASURED: "success"
};

export function DecisionStateBadge({
  state,
  label
}: {
  state: UniversalDecisionState;
  label?: string;
}) {
  return <WorkspaceBadge tone={stateTone[state]}>{label ?? state}</WorkspaceBadge>;
}

export type UniversalEvidenceState = "OBSERVED" | "VERIFIED" | "MODELLED" | "MISSING";

const evidenceTone: Record<UniversalEvidenceState, "teal" | "success" | "warning" | "neutral"> = {
  OBSERVED: "teal",
  VERIFIED: "success",
  MODELLED: "warning",
  MISSING: "neutral"
};

export function EvidenceStateBadge({
  state,
  label
}: {
  state: UniversalEvidenceState;
  label?: string;
}) {
  return <WorkspaceBadge tone={evidenceTone[state]}>{label ?? state}</WorkspaceBadge>;
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
        <b aria-hidden="true"><span className={styles.whenClosed}>Open</span><span className={styles.whenOpen}>Close</span></b>
      </summary>
      <div className={styles.drawerBody}>{children}</div>
    </details>
  );
}
