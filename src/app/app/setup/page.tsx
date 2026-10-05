import type { Metadata } from "next";
import { ClubSetup } from "@/components/ClubSetup";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import styles from "./setup.module.css";

export const metadata: Metadata = {
  title: "Club setup · AVELA",
  description: "Configure fixtures, channels, objectives, brand rules and approvals once for the club."
};

// productAppShell is provided by AppWorkspaceShell.
export default function ClubSetupPage() {
  return (
    <AppWorkspaceShell
      active="setup"
      eyebrow="Administration"
      title="Setup"
      subtitle="Configure club context once so every fixture starts with the right defaults."
    >
      <div className={styles.surface}>
        <ClubSetup />
      </div>
    </AppWorkspaceShell>
  );
}
