"use client";

import { fetchClubSession } from "@/lib/clubSessionClient";
import { useEffect, useState } from "react";
import styles from "./ExecutionToolSetup.module.css";

type Club = { id: string; name: string; role: string };
type System = "asana" | "monday" | "jira" | "notion" | "other";
type Category = "approval" | "activation" | "schedule";
type ConnectionRow = { id: string; system: System; label: string; state: string; last_sync_at?: string | null };
type RuleRow = { id: string; categories?: Category[]; connection_id: string; enabled: boolean };

const SYSTEMS: Array<[System, string]> = [["asana", "Asana"], ["monday", "Monday"], ["jira", "Jira"], ["notion", "Notion"], ["other", "Other tool"]];
const CATEGORIES: Array<[Category, string, string]> = [
  ["approval", "Approvals", "Sign-offs that must happen before activation"],
  ["activation", "Activation", "Content, offers and channel work"],
  ["schedule", "Schedule", "Dated deadlines and publishing slots"]
];

/** Where approved AVELA work is executed. AVELA sends the tasks; the club's tool stays the source of truth. */
export function ExecutionToolSetup() {
  const [clubId, setClubId] = useState("");
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [connection, setConnection] = useState<ConnectionRow | null>(null);
  const [system, setSystem] = useState<System>("asana");
  const [label, setLabel] = useState("");
  const [categories, setCategories] = useState<Category[]>(["approval", "activation", "schedule"]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load(id: string) {
    try {
      const response = await fetch("/api/work-system/connection?clubId=" + encodeURIComponent(id), { cache: "no-store" });
      const result = await response.json() as { enabled?: boolean; webhookConfigured?: boolean; connections?: ConnectionRow[]; rules?: RuleRow[]; message?: string };
      setEnabled(Boolean(response.ok && result.enabled));
      setWebhookConfigured(Boolean(result.webhookConfigured));
      const current = Array.isArray(result.connections) ? result.connections[0] ?? null : null;
      setConnection(current);
      if (current) {
        setSystem(current.system);
        setLabel(current.label);
        const rule = result.rules?.find((item) => item.connection_id === current.id);
        if (rule?.categories?.length) setCategories(rule.categories);
      }
      setMessage(result.message ?? "");
    } catch {
      setEnabled(false);
      setMessage("Execution tool settings could not be loaded. Nothing was changed.");
    }
  }

  useEffect(() => { void (async () => {
    try {
      const response = await fetchClubSession();
      const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
      const first = Array.isArray(result.clubs) ? result.clubs[0] : undefined;
      if (result.authenticated && first) { setClubId(first.id); await load(first.id); }
      else setEnabled(false);
    } catch {
      setEnabled(false);
    }
  })(); }, []);

  function toggle(category: Category) {
    setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  }

  async function save() {
    setSaving(true);
    setMessage("Saving…");
    try {
      const response = await fetch("/api/work-system/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, system, label: label.trim() || SYSTEMS.find(([key]) => key === system)?.[1], categories })
      });
      const result = await response.json() as { saved?: boolean; error?: string };
      if (!response.ok || !result.saved) { setMessage(result.error ?? "The execution tool could not be saved."); return; }
      await load(clubId);
      setMessage("Saved. Approved work can now be sent from each Opportunity Brief.");
    } catch {
      setMessage("The execution tool could not be reached. Nothing was changed.");
    } finally {
      setSaving(false);
    }
  }

  if (enabled === null) return null;
  if (!enabled) {
    return (
      <section className={styles.wrap} aria-labelledby="execution-tool-title">
        <span className={styles.eyebrow}>Execution tool</span>
        <h2 id="execution-tool-title">Where approved work is executed</h2>
        <p>{message || "Sign in with a club account to choose the tool your team uses for tasks."}</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-labelledby="execution-tool-title">
      <span className={styles.eyebrow}>Execution tool</span>
      <h2 id="execution-tool-title">Where approved work is executed</h2>
      <p>AVELA recommends and records the decision. Your team&rsquo;s tool runs the tasks and stays the source of truth for their status; AVELA only reads it back.</p>

      <dl className={styles.state}>
        <div>
          <dt>Connection</dt>
          <dd data-ok={webhookConfigured}>{webhookConfigured ? "Webhook configured" : "Webhook not configured"}</dd>
          <small>{webhookConfigured ? "Configured is not the same as working: the first task sent confirms it." : "Set WORK_WEBHOOK_URL and WORK_WEBHOOK_SECRET in the deployment. AVELA never stores them."}</small>
        </div>
        <div>
          <dt>Last update from the tool</dt>
          <dd>{connection?.last_sync_at ? new Date(connection.last_sync_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "None yet"}</dd>
          <small>{connection ? `${connection.label} · ${connection.state}` : "No tool chosen yet"}</small>
        </div>
      </dl>

      <div className={styles.form}>
        <label>
          <span>Tool</span>
          <select value={system} onChange={(event) => setSystem(event.target.value as System)}>
            {SYSTEMS.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
          </select>
        </label>
        <label>
          <span>Name shown to the team</span>
          <input value={label} maxLength={120} placeholder="e.g. Marketing board" onChange={(event) => setLabel(event.target.value)} />
        </label>
        <fieldset>
          <legend>Work AVELA may send</legend>
          {CATEGORIES.map(([key, name, detail]) => (
            <label key={key} className={styles.check}>
              <input type="checkbox" checked={categories.includes(key)} onChange={() => toggle(key)} />
              <span><strong>{name}</strong><small>{detail}</small></span>
            </label>
          ))}
        </fieldset>
      </div>
      <div className={styles.actions}>
        <button type="button" disabled={saving || !categories.length} aria-busy={saving} onClick={() => void save()}>
          {saving ? "Saving…" : connection ? "Update execution tool" : "Use this tool"}
        </button>
        <small>Every send still needs a person to confirm it in the brief.</small>
      </div>
      {message ? <p className={styles.message} role="status" aria-live="polite">{message}</p> : null}
    </section>
  );
}
