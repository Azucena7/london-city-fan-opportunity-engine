import Link from "next/link";
import styles from "./ExecutiveDomains.module.css";

export type DomainTile = {
  key: string;
  label: string;
  /** "attention" when something waits on the club, "clear" when nothing does, "unknown" when it cannot be measured yet. */
  state: "attention" | "clear" | "unknown";
  stateLabel: string;
  metric: string;
  detail: string;
  href: string;
  linkLabel: string;
};

/**
 * One line of tiles across the club's work, beside the fixture portfolio: each says whether
 * something waits on the club, with a count from existing data, and opens the workspace that
 * resolves it. Nothing is scored or combined; an area without evidence says so.
 */
export function ExecutiveDomains({ tiles }: { tiles: DomainTile[] }) {
  return (
    <section className={styles.domains} aria-label="Across the club">
      {tiles.map((tile) => (
        <Link key={tile.key} href={tile.href} className={styles.tile} data-state={tile.state}>
          <span className={styles.label}>{tile.label}</span>
          <span className={styles.state}>{tile.stateLabel}</span>
          <strong>{tile.metric}</strong>
          <small>{tile.detail}</small>
          <b>{tile.linkLabel} →</b>
        </Link>
      ))}
    </section>
  );
}
