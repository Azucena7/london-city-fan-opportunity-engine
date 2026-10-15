"use client";

import Link from "next/link";
import { useState } from "react";
import type { CrmAudienceDefinition } from "@/lib/models";
import styles from "./CrmAudiences.module.css";

export type CrmAudienceRow = { audience: CrmAudienceDefinition; purpose: string; description: string; size: string };

// Segments for the club CRM to build and send. AVELA hands over criteria only: the member list
// is created, and contacted, inside the club's own CRM.
export function CrmAudiences({ rows, connected }: { rows: CrmAudienceRow[]; connected: boolean }) {
  const [copied, setCopied] = useState("");

  async function copy(row: CrmAudienceRow) {
    const text = JSON.stringify({ audience: row.audience.id, purpose: row.purpose, criteria: row.audience.criteria, rule: row.description }, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(row.audience.id);
    } catch {
      setCopied("");
    }
  }

  return (
    <section className={styles.wrap} aria-label="Audiences for the club CRM">
      <div className={styles.head}>
        <span>Audiences for the club CRM</span>
        <strong>Who to contact before this fixture</strong>
      </div>
      {!connected ? (
        <p className={styles.empty}>
          Requires the club&apos;s authorised ticketing aggregate. AVELA suggests segments; the club&apos;s CRM builds the list and sends the message.{" "}
          <Link href="/app/sources">Check data sources →</Link>
        </p>
      ) : !rows.length ? (
        <p className={styles.empty}>No segment applies to this fixture in the current club aggregate.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.audience.id}>
              <div>
                <b>{row.purpose}</b>
                <small>{row.description}</small>
              </div>
              <span>{row.size}</span>
              <button type="button" onClick={() => void copy(row)}>{copied === row.audience.id ? "Criteria copied" : "Copy criteria"}</button>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.note}>Consented supporters only. Sizes are rounded; groups under 10 are withheld. No supporter list leaves the club&apos;s systems.</p>
    </section>
  );
}
