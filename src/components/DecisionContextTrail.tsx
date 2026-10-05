import Link from "next/link";
import styles from "./DecisionContextTrail.module.css";

export function DecisionContextTrail({
  fixtureLabel,
  fixtureHref,
  campaignLabel,
  campaignId,
  current
}: {
  fixtureLabel?: string | null;
  fixtureHref?: string | null;
  campaignLabel?: string | null;
  campaignId?: string | null;
  current: string;
}) {
  return (
    <nav className={styles.trail} aria-label="Decision context">
      <Link href="/app">London City</Link>
      {fixtureLabel ? (
        <>
          <i aria-hidden="true">/</i>
          {fixtureHref ? <Link href={fixtureHref}>{fixtureLabel}</Link> : <span>{fixtureLabel}</span>}
        </>
      ) : null}
      {campaignLabel ? (
        <>
          <i aria-hidden="true">/</i>
          <Link href="/app/campaigns">{campaignLabel}</Link>
        </>
      ) : null}
      <i aria-hidden="true">/</i>
      <strong>{current}</strong>
      {campaignId ? <small>Campaign context preserved</small> : null}
    </nav>
  );
}
