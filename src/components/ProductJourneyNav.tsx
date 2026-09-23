import Link from "next/link";
import styles from "./ProductJourneyNav.module.css";

type ProductJourneyNavProps = {
  active?: "product" | "demo" | "decision" | "results" | "pilot" | "engine";
};

const items = [
  { key: "product", label: "Product", href: "/" },
  { key: "demo", label: "Guided demo", href: "/demo" },
  { key: "decision", label: "Decision Room", href: "/decision-room" },
  { key: "results", label: "Results", href: "/results" },
  { key: "pilot", label: "90-day pilot", href: "/pilot" }
] as const;

export function ProductJourneyNav({ active }: ProductJourneyNavProps) {
  return (
    <nav className={styles.nav} aria-label="Fan Growth Engine product journey">
      <Link className={styles.brand} href="/">Fan Growth Engine</Link>
      <div className={styles.links}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={[styles.link, active === item.key ? styles.active : ""].join(" ")}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Link className={[styles.engine, active === "engine" ? styles.activeEngine : ""].join(" ")} href="/today">
        Full engine
      </Link>
    </nav>
  );
}
