import type { ReactNode } from "react";
import styles from "./DataTable.module.css";

export type DataColumn<Row> = {
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
};

/**
 * A semantic table for workspace records. The first column is the row header; on narrow
 * screens each row becomes a card and every cell is labelled with its column header.
 */
export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  empty
}: {
  caption: string;
  columns: DataColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  empty: ReactNode;
}) {
  if (!rows.length) return <p className={styles.empty}>{empty}</p>;
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>{columns.map((column) => <th key={column.key} scope="col">{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column, index) => index === 0
                ? <th key={column.key} scope="row" data-label={column.header}>{column.cell(row)}</th>
                : <td key={column.key} data-label={column.header}>{column.cell(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
