import Link from "next/link";
import styles from "./FilterBar.module.css";

export type FilterOption = { value: string; label: string; count: number };

/**
 * Filters as plain links (?param=value), so a filtered view is shareable, works without
 * JavaScript and renders on the server. The first option is the unfiltered view.
 */
export function FilterBar({
  label,
  basePath,
  param,
  options,
  current
}: {
  label: string;
  basePath: string;
  param: string;
  options: FilterOption[];
  current: string;
}) {
  return (
    <nav className={styles.bar} aria-label={label}>
      {options.map((option, index) => {
        const href = index === 0 ? basePath : `${basePath}?${new URLSearchParams({ [param]: option.value })}`;
        const active = option.value === current;
        return (
          <Link key={option.value} href={href} scroll={false} aria-current={active ? "true" : undefined} className={styles.option}>
            {option.label}
            <span className={styles.count}>{option.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
