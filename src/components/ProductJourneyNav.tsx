import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "product" | "matches" | "brief" | "opportunity" | "cases" | "demo" | "decision" | "results" | "pilot" | "impact" | "engine" | "clubs" | "credits" | "setup" | "access";
};

const primaryItems = [
  { key: "matches", label: "Radar", href: "/app/matches" },
  { key: "results", label: "Learning", href: "/app/learning" },
  { key: "credits", label: "Credits", href: "/app/credits" },
  { key: "setup", label: "Setup", href: "/app/setup" },
  { key: "access", label: "Team", href: "/app/access" },
  { key: "demo", label: "Demo", href: "/app/demo" }
] as const;

export function ProductJourneyNav({ active }: ProductJourneyNavProps) {
  return (
    <nav className={styles.nav} aria-label="AVELA club app navigation">
      <Link className={styles.brand} href="/app/matches">
        <span className={styles.brandMark} aria-hidden="true" />
        AVELA
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

      <div className={styles.account}>
        <span className={styles.workspace}>Club workspace</span>
        <Link className={styles.engine} href="/">
          AVELA.com ↗
        </Link>
      </div>
    </nav>
  );
}
