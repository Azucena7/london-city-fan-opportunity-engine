import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "product" | "matches" | "brief" | "opportunity" | "cases" | "demo" | "decision" | "results" | "pilot" | "impact" | "engine" | "clubs";
};

const primaryItems = [
  { key: "matches", label: "Matches", href: "/app/matches" },
  { key: "results", label: "Learning", href: "/app/learning" }
] as const;

export function ProductJourneyNav({ active }: ProductJourneyNavProps) {
  return (
    <nav className={styles.nav} aria-label="Fan Growth Engine navigation">
      <Link className={styles.brand} href="/app/matches">
        <span className={styles.brandMark} aria-hidden="true" />
        Fan Growth Engine
      </Link>

      <div className={styles.links}>
        {primaryItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={[styles.link, active === item.key ? styles.active : ""].join(" ")}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <Link className={styles.engine} href="/">
        Product site
      </Link>
    </nav>
  );
}
