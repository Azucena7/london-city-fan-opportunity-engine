import Link from "next/link";
import { currentState } from "@/lib/data";
import { getCurrentMorningRead } from "@/lib/currentMorningRead";
import { WorkspaceCard, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./ExternalReadCard.module.css";

// The families read from outside the club. The opportunity and move lines of the Morning Read
// are left out here: on Home the decision inbox already carries them.
const EXTERNAL = new Set(["pressure", "broadcast", "weather", "calendar", "transport", "origins"]);

function refreshedAt(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London"
  });
}

/** What changed outside the club before the first meeting, from the latest daily refresh. */
export function ExternalReadCard() {
  const lines = getCurrentMorningRead(null).filter((line) => EXTERNAL.has(line.id));

  return (
    <WorkspaceCard className={styles.card}>
      <WorkspaceSectionHeader
        eyebrow="Anticipate"
        title="Outside the club today"
        action={<span className={styles.updated}>Updated daily · {refreshedAt(currentState.updated_at)}</span>}
      />
      <ul className={styles.lines} aria-label="External signals from the latest refresh">
        {lines.map((line) => (
          <li key={line.id} data-state={line.state}>
            <span className={styles.label}>{line.label}</span>
            <span className={styles.copy}>
              <strong>{line.headline}</strong>
              {line.detail ? <small>{line.detail}</small> : null}
            </span>
            <span className={styles.state}>{line.state === "live" ? "Read" : "Not connected"}</span>
          </li>
        ))}
      </ul>
      <p className={styles.foot}>
        Signals AVELA cannot read yet are marked, never filled in. <Link href="/app/sources">Source state →</Link>
      </p>
    </WorkspaceCard>
  );
}
