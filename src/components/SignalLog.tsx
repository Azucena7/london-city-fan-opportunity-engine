import { DataTable, type DataColumn } from "@/components/DataTable";
import { WorkspaceBadge, WorkspaceCard, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import { summariseSignalLog, type SignalEffectKind, type SignalLogEntry } from "@/lib/signalLog";
import styles from "./SignalLog.module.css";

const effectTone: Record<SignalEffectKind, "coral" | "warning" | "teal" | "neutral"> = {
  state: "coral",
  confidence: "warning",
  priority: "teal",
  none: "neutral",
  "off-radar": "neutral"
};

const effectName: Record<SignalEffectKind, string> = {
  state: "Changed state",
  confidence: "Changed confidence",
  priority: "Raised priority",
  none: "No change",
  "off-radar": "Not on the Radar"
};

function when(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
}

const columns: DataColumn<SignalLogEntry>[] = [
  {
    key: "signal",
    header: "Signal",
    cell: (entry) => (
      <div className={styles.signal}>
        <strong>{entry.title}</strong>
        <small>
          <a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.sourceName}</a> · {entry.state} · {entry.materiality} materiality
        </small>
      </div>
    )
  },
  {
    key: "when",
    header: "Arrived",
    cell: (entry) => (
      <span className={styles.when}>
        <time dateTime={entry.observedAt}>{when(entry.observedAt)}</time>
        {entry.isNew ? <WorkspaceBadge tone="teal">New</WorkspaceBadge> : null}
      </span>
    )
  },
  {
    key: "effect",
    header: "What it changed",
    cell: (entry) => (
      <div className={styles.effect}>
        <WorkspaceBadge tone={effectTone[entry.strongest]}>{effectName[entry.strongest]}</WorkspaceBadge>
        <ul>{entry.effects.map((effect) => <li key={effect.label}>{effect.label}</li>)}</ul>
      </div>
    )
  }
];

/**
 * Every sourced signal, newest first, and what it measurably changed on the Radar: each
 * signal is removed and the fixture re-read with the same engine, so no effect is narrated.
 */
export function SignalLog({ entries, shown = 10 }: { entries: SignalLogEntry[]; shown?: number }) {
  const summary = summariseSignalLog(entries);
  const latest = entries.slice(0, shown);
  const earlier = entries.slice(shown);
  return (
    <WorkspaceCard className={styles.card}>
      <div id="signal-log" className={styles.anchor} />
      <WorkspaceSectionHeader eyebrow="Signal log" title="What arrived and what it changed" />
      <p className={styles.summary}>
        <strong>{summary.total} signals</strong>, {summary.recent} in the last 7 days.{" "}
        {summary.changedState} changed a fixture&apos;s state, {summary.changedConfidence} changed confidence,{" "}
        {summary.changedPriority} raised priority and {summary.noChange} changed nothing on the Radar.
      </p>
      <p className={styles.method}>
        Each signal is removed and the fixture read again with the same engine, so &ldquo;changed&rdquo; is measured, not
        narrated. A signal with no Radar effect can still be evidence inside the fixture&apos;s brief. Calendar pressure can
        raise a fixture&apos;s attention separately.
      </p>
      <DataTable caption="Signals, newest first, with their measured effect on the Radar" columns={columns} rows={latest} rowKey={(entry) => entry.id} empty="No signals have been recorded yet." />
      {earlier.length ? (
        <details className={styles.more}>
          <summary>Show {earlier.length} earlier signals</summary>
          <DataTable caption="Earlier signals" columns={columns} rows={earlier} rowKey={(entry) => entry.id} empty="" />
        </details>
      ) : null}
    </WorkspaceCard>
  );
}
