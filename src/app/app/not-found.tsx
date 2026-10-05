import Link from "next/link";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import styles from "./route-state.module.css";

export default function AppNotFound() {
  return (
    <AppWorkspaceShell
      active="home"
      eyebrow="System state"
      title="Workspace not found"
      subtitle="The fixture, campaign or workspace may have moved."
    >
      <section className={styles.content}>
        <span className={styles.eyebrow}>Continue in AVELA</span>
        <p className={styles.copy}>Return to Home for the current priorities or open Radar to find the fixture again.</p>
        <div className={styles.actions}>
          <Link href="/app">Back to Home</Link>
          <Link href="/app/matches">Open Radar</Link>
        </div>
      </section>
    </AppWorkspaceShell>
  );
}
