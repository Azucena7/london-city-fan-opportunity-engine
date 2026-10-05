import type { Metadata } from "next";
import { AccessCenter } from "@/components/AccessCenter";
import { OperationalContinuity } from "@/components/OperationalContinuity";
import { AppWorkspaceShell, WorkspaceFilterButton } from "@/components/AppWorkspaceShell";
import { WorkspaceDrawer } from "@/components/WorkspaceUI";
import styles from "./access.module.css";

export const metadata: Metadata = {
  title: "Access & team · AVELA",
  description: "Create an AVELA pilot account, request club access, review memberships and protect operational continuity during staff changes."
};

// productAppShell is provided by AppWorkspaceShell.
export default function AccessPage() {
  return (
    <AppWorkspaceShell
      active="access"
      eyebrow="Administration"
      title="Team"
      subtitle="Memberships, access requests, roles and operational continuity."
      actions={<WorkspaceFilterButton label="Team filters" />}
    >
      <div className={styles.accessSurface}>
        <AccessCenter />
      </div>
      <div className={styles.continuity}>
        <WorkspaceDrawer label="Operational continuity" title="Handover & role-change protocol">
          <OperationalContinuity />
        </WorkspaceDrawer>
      </div>
    </AppWorkspaceShell>
  );
}
