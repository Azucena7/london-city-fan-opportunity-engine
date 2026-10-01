import styles from "./ProductDataStateLegend.module.css";

export function ProductDataStateLegend() {
  return (
    <aside className={styles.legend} aria-label="Product data state legend">
      <span className={styles.label}>Data state</span>
      <span className={styles.live}>Live</span>
      <span className={styles.modelled}>Modelled</span>
      <span className={styles.missing}>Missing</span>
    </aside>
  );
}
