import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "product" | "brief" | "opportunity" | "cases" | "demo" | "decision" | "results" | "pilot" | "impact" | "engine";
};

const primaryItems = [
  { key: "product", label: "Product", href: "/" },
  { key: "brief", label: "Morning brief", href: "/brief" },
  { key: "opportunity", label: "Opportunity", href: "/opportunity" },
  { key: "results", label: "Results", href: "/results" },
  { key: "pilot", label: "Pilot", href: "/pilot" }
] as const;

const exploreItems = [
  { key: "cases", label: "Use cases", href: "/cases" },
  { key: "demo", label: "Guided demo", href: "/demo" },
  { key: "impact", label: "Impact model", href: "/impact" },
  { key: "decision", label: "Decision Room", href: "/decision-room" }
] as const;

export function ProductJourneyNav({ active }: ProductJourneyNavProps) {
  const exploreActive = exploreItems.some((item) => item.key === active);

  return (
    <nav className={styles.nav} aria-label="Fan Growth Engine navigation">
      <Link className={styles.brand} href="/">
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

        <details className={styles.more}>
          <summary className={exploreActive ? styles.activeSummary : ""}>Explore</summary>
          <div className={styles.menu}>
            {exploreItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={active === item.key ? styles.menuActive : ""}
              >
                <strong>{item.label}</strong>
                <span>
                  {item.key === "cases" ? "Compare different fixture decisions" :
                   item.key === "demo" ? "Walk through the product story" :
                   item.key === "impact" ? "Test commercial scenarios" :
                   "Inspect evidence and blockers"}
                </span>
              </Link>
            ))}
          </div>
        </details>
      </div>

      <Link className={[styles.engine, active === "engine" ? styles.activeEngine : ""].join(" ")} href="/today">
        Analyst view
      </Link>
    </nav>
  );
}
