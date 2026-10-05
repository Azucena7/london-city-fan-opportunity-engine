import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import styles from "./route-state.module.css";

export default function AppLoading() {
  return (
    <AppWorkspaceShell
      active="home"
      eyebrow="System state"
      title="Loading workspace"
      subtitle="Preparing the latest fixture, campaign and evidence context."
    >
      <section className={styles.content} aria-busy="true" aria-label="Loading AVELA workspace">
        <span className={styles.eyebrow}>Preparing the next decision</span>
        <p className={styles.copy}>AVELA is loading the latest context without changing any underlying club data.</p>
        <div className={styles.skeleton} aria-hidden="true"><span /><span /><span /></div>
      </section>
    </AppWorkspaceShell>
  );
}
