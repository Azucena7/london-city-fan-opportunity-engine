"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./OpportunityExplorer.module.css";

export type ExplorerItem = {
  fixtureId: string;
  opponent: string;
  date: string;
  daysToFixture: number;
  opportunityScore: number | null;
  opportunity: string;
  confidence: "High" | "Medium" | "Low";
  urgency: "Immediate" | "Soon" | "Watch";
  radarState: string;
  materialSignalCount: number;
  recentMaterialSignalCount: number;
  signalCount: number;
  decisionState: string;
  approvalsReady: number;
  approvalsTotal: number;
  activations: number;
  channels: string[];
};

const confidenceValue = { High: 100, Medium: 65, Low: 35 } as const;
const urgencyValue = { Immediate: 100, Soon: 70, Watch: 35 } as const;

export function OpportunityExplorer({ items }: { items: ExplorerItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.fixtureId ?? "");
  const selected = useMemo(() => items.find((item) => item.fixtureId === selectedId) ?? items[0], [items, selectedId]);
  const maxDays = Math.max(30, ...items.map((item) => Math.max(0, item.daysToFixture)));

  if (!selected) return null;

  const score = selected.opportunityScore ?? 0;
  const evidence = Math.min(100, selected.materialSignalCount * 20);
  const approval = selected.approvalsTotal ? Math.round((selected.approvalsReady / selected.approvalsTotal) * 100) : 0;

  return (
    <section className={styles.wrap} aria-label="Visual opportunity explorer">
      <div className={styles.head}>
        <div>
          <span>Visual intelligence</span>
          <h2>See where to act before reading the detail.</h2>
          <p>Select a fixture to update the decision view. Position reflects time to fixture and opportunity score; driver bars are separate signals, not an additive score formula.</p>
        </div>
        <Link href="/app/season">Open Season Intelligence →</Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.plotCard}>
          <div className={styles.plotTitle}>
            <span>Opportunity map</span>
            <strong>Higher = stronger opportunity · Left = less time to act</strong>
          </div>
          <div className={styles.plot}>
            <span className={styles.yHigh}>High opportunity</span>
            <span className={styles.yLow}>Lower opportunity</span>
            <span className={styles.xNow}>Act sooner</span>
            <span className={styles.xLater}>More runway</span>
            <div className={styles.gridH1} /><div className={styles.gridH2} /><div className={styles.gridV1} /><div className={styles.gridV2} />
            {items.map((item) => {
              const left = 8 + (Math.max(0, item.daysToFixture) / maxDays) * 84;
              const bottom = 12 + ((item.opportunityScore ?? 45) / 100) * 74;
              return (
                <button
                  key={item.fixtureId}
                  type="button"
                  className={[styles.dot, item.fixtureId === selected.fixtureId ? styles.dotActive : ""].join(" ")}
                  style={{ left: `${left}%`, bottom: `${bottom}%` }}
                  onClick={() => setSelectedId(item.fixtureId)}
                  aria-label={`${item.opponent}, opportunity ${item.opportunityScore ?? "under review"}, ${item.daysToFixture} days to fixture`}
                >
                  <i />
                  <span>{item.opponent.replace("Manchester ","Man ").replace("Crystal ","")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className={styles.selection}>
          <div className={styles.selectionTop}>
            <div><span>Selected fixture</span><h3>{selected.opponent}</h3><small>{selected.date} · {selected.radarState}</small></div>
            <strong>{selected.opportunityScore ?? "—"}</strong>
          </div>
          <p>{selected.opportunity}</p>

          <div className={styles.drivers}>
            {[
              ["Opportunity", score],
              ["Confidence", confidenceValue[selected.confidence]],
              ["Urgency", urgencyValue[selected.urgency]],
              ["Evidence", evidence]
            ].map(([label,value]) => (
              <div key={String(label)}>
                <span><b>{label}</b><small>{value}%</small></span>
                <i><em style={{ width: `${value}%` }} /></i>
              </div>
            ))}
          </div>

          <div className={styles.readiness}>
            <div><span>Campaign readiness</span><strong>{approval}%</strong></div>
            <i><em style={{ width: `${approval}%` }} /></i>
            <small>{selected.approvalsReady}/{selected.approvalsTotal || 0} approvals ready · {selected.activations} drafted activations</small>
          </div>

          <div className={styles.signalPulse}>
            <span>Signal pulse</span>
            <strong>{selected.recentMaterialSignalCount ? `${selected.recentMaterialSignalCount} new material signal${selected.recentMaterialSignalCount === 1 ? "" : "s"} in 7d` : "No new material signal in 7d"}</strong>
            <small>{selected.materialSignalCount} material · {selected.signalCount} total signals</small>
          </div>

          <div className={styles.channels}>
            {selected.channels.length ? selected.channels.slice(0,5).map((channel) => <b key={channel}>{channel}</b>) : <span>No campaign channels drafted yet</span>}
          </div>

          <Link className={styles.open} href={`/app/matches/${selected.fixtureId}`}>Open decision workspace →</Link>
        </aside>
      </div>
    </section>
  );
}
