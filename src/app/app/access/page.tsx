import type { Metadata } from "next";
import { AccessCenter } from "@/components/AccessCenter";
import { OperationalContinuity } from "@/components/OperationalContinuity";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
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
      eyebrow="Decision ownership"
      title="Who can approve what — and who keeps continuity?"
      subtitle="Roles, access and handover should protect decisions, not create another admin workflow."
    >
      <WorkspaceCard className={styles.ownershipCard}>
        <WorkspaceSectionHeader eyebrow="Decision ownership" title="Who typically owns which AVELA gate?" />
        <div className={styles.ownershipMap}>
          {[
            ["Campaign approval","Marketing","Approve scope, proposition and channel plan"],
            ["Sponsor commitment","Commercial / business","Confirm rights, partner fit and commitment"],
            ["Player usage","Marketing + compliance","Validate usage, availability and permissions"],
            ["Contract verification","Compliance","Verify source clause and provenance"],
            ["External launch","Channel owner","Execute outside AVELA when authorised"],
            ["Outcome evidence","Ticketing / analyst","Supply authorised measurement"]
          ].map(([decision,role,detail]) => (
            <article key={decision}>
              <span>{decision}</span>
              <strong>{role}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </div>
        <p className={styles.ownershipNote}>This map describes the operating model, not current membership assignments. Actual access and roles remain governed below.</p>
      </WorkspaceCard>

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
