"use client";

import { useEffect, useState } from "react";
import type { OperationalHandoffSuggestion } from "@/lib/operationalRouting";
import styles from "./OperationalHandoffs.module.css";

type Club = { id: string; name: string; role: string };
type RequestRow = {
  id: string;
  request_type: "player" | "sponsor-activation" | "representation" | "operations";
  stage: "heads-up" | "formal-request" | "confirmed" | "alternative" | "unavailable" | "cancelled";
  recipient_role: string;
  subject: string;
  detail?: string | null;
  due_at?: string | null;
  updated_at: string;
};

type Preset = OperationalHandoffSuggestion & { recommended: boolean };

export function OperationalHandoffs({
  decisionId,
  fixtureLabel,
  eventAt,
  recommendation,
  suggestions = []
}: {
  decisionId: string;
  fixtureLabel: string;
  eventAt?: string | null;
  recommendation: string;
  suggestions?: OperationalHandoffSuggestion[];
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const manualPresets: OperationalHandoffSuggestion[] = [
    {
      requestType: "player",
      stage: "heads-up",
      recipientRole: "Team Manager",
      title: "Player heads-up",
      hint: "Warn Team Manager before a formal player request is needed.",
      subject: `Possible player requirement · ${fixtureLabel}`,
      urgency: "plan",
      reason: "Available as a manual handoff when player involvement is known internally.",
      ruleId: "manual-player"
    },
    {
      requestType: "sponsor-activation",
      stage: "formal-request",
      recipientRole: "Activation Manager",
      title: "Sponsor activation",
      hint: "Hand the recommended activation to the sponsor execution owner.",
      subject: `Activation requirement · ${fixtureLabel}`,
      urgency: "plan",
      reason: "Available as a manual handoff when sponsor involvement is known internally.",
      ruleId: "manual-sponsor"
    },
    {
      requestType: "representation",
      stage: "heads-up",
      recipientRole: "Secretary / Protocol",
      title: "Club representation",
      hint: "Pre-alert agenda/protocol that club representation may be required.",
      subject: `Possible club representation · ${fixtureLabel}`,
      urgency: "plan",
      reason: "Available as a manual handoff when club representation is required.",
      ruleId: "manual-representation"
    }
  ];

  const suggestionKeys = new Set(suggestions.map((item) => item.requestType + ":" + item.recipientRole));
  const presets: Preset[] = [
    ...suggestions.map((item) => ({ ...item, recommended: true })),
    ...manualPresets
      .filter((item) => !suggestionKeys.has(item.requestType + ":" + item.recipientRole))
      .map((item) => ({ ...item, recommended: false }))
  ];

  async function load(clubId: string) {
    const response = await fetch(`/api/operational-requests?clubId=${encodeURIComponent(clubId)}&decisionId=${encodeURIComponent(decisionId)}`, { cache: "no-store" });
    const result = await response.json() as { requests?: RequestRow[] };
    setRequests(response.ok && Array.isArray(result.requests) ? result.requests : []);
  }

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
      const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(nextClubs);
      if (result.authenticated && nextClubs.length) {
        setActiveClubId(nextClubs[0].id);
        await load(nextClubs[0].id);
      }
    })();
  }, [decisionId]); // eslint-disable-line react-hooks/exhaustive-deps -- request queue follows the current decision

  async function updateRequest(id: string, stage: RequestRow["stage"]) {
    if (!activeClubId || busy) return;
    setBusy(id + stage);
    setStatus("");
    const response = await fetch("/api/operational-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, clubId: activeClubId, stage })
    });
    if (response.ok) {
      setStatus(stage === "confirmed" ? "Handoff confirmed." : stage === "alternative" ? "Alternative requested." : "Availability issue recorded.");
      await load(activeClubId);
    } else {
      setStatus("This handoff response could not be saved.");
    }
    setBusy(null);
  }

  async function create(preset: Preset) {
    if (!activeClubId || busy) return;
    setBusy(preset.requestType + preset.recipientRole);
    setStatus("");
    const response = await fetch("/api/operational-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId: activeClubId,
        decisionId,
        requestType: preset.requestType,
        stage: preset.stage,
        recipientRole: preset.recipientRole,
        subject: preset.subject,
        detail: recommendation,
        eventAt: eventAt || undefined,
        requirements: {
          fixture: fixtureLabel,
          recommendation,
          purpose: preset.hint,
          avelaSuggestion: preset.recommended,
          ruleId: preset.ruleId,
          reason: preset.reason,
          urgency: preset.urgency,
          requiredRoles: preset.requiredRoles ?? [],
          durationMinutes: preset.durationMinutes ?? null
        }
      })
    });
    if (response.ok) {
      setStatus(preset.stage === "heads-up" ? "Heads-up created." : "Request created.");
      await load(activeClubId);
    } else {
      setStatus("This handoff could not be created.");
    }
    setBusy(null);
  }

  if (!clubs.length) return null;

  return (
    <section className={styles.wrap} aria-label="Operational handoffs">
      <div className={styles.head}>
        <div>
          <span>Operational handoff</span>
          <h2>Who needs to know or act next?</h2>
          <p>Send the minimum useful context to the right club owner. AVELA keeps heads-ups separate from formal requests.</p>
        </div>
        {clubs.length > 1 ? (
          <label>Club
            <select value={activeClubId} onChange={(event) => { setActiveClubId(event.target.value); void load(event.target.value); }}>
              {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      <div className={styles.presetGrid}>
        {presets.map((preset) => (
          <article key={preset.requestType + preset.recipientRole} className={preset.recommended ? styles.recommendedPreset : ""}>
            <div className={styles.presetTop}>
              <span>{preset.recommended ? `AVELA suggests · ${preset.urgency}` : preset.stage === "heads-up" ? "Heads-up" : "Formal request"}</span>
              <small>{preset.recipientRole}</small>
            </div>
            <h3>{preset.title}</h3>
            <p>{preset.hint}</p>
            {preset.recommended ? <p className={styles.suggestionReason}>{preset.reason}</p> : null}
            {preset.recommended && preset.requiredRoles?.length ? (
              <p className={styles.suggestionRoles}>Needs: {preset.requiredRoles.join(" · ")} · {preset.durationMinutes ?? 60} min</p>
            ) : null}
            <button type="button" disabled={Boolean(busy)} onClick={() => void create(preset)}>
              {busy === preset.requestType + preset.recipientRole ? "Creating…" : preset.recommended ? preset.stage === "heads-up" ? "Create suggested pre-alert" : "Create suggested request" : preset.stage === "heads-up" ? "Create pre-alert" : "Create request"}
            </button>
          </article>
        ))}
      </div>

      <details className={styles.queue} open={requests.length > 0}>
        <summary>Current handoffs <span>{requests.length}</span></summary>
        <div>
          {!requests.length ? <p>No operational handoffs recorded for this decision.</p> : requests.map((request) => (
            <article key={request.id}>
              <div>
                <span>{request.stage.replaceAll("-", " ")} · {request.recipient_role}</span>
                <strong>{request.subject}</strong>
                {request.detail ? <p>{request.detail}</p> : null}
              </div>
              <div className={styles.requestActions}>
                <small>{new Date(request.updated_at).toLocaleString("en-GB")}</small>
                {request.stage === "heads-up" || request.stage === "formal-request" ? (
                  <div>
                    <button type="button" disabled={Boolean(busy)} onClick={() => void updateRequest(request.id, "confirmed")}>Confirm</button>
                    <button type="button" disabled={Boolean(busy)} onClick={() => void updateRequest(request.id, "alternative")}>Alternative</button>
                    <button type="button" disabled={Boolean(busy)} onClick={() => void updateRequest(request.id, "unavailable")}>Unavailable</button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </details>

      {status ? <p className={styles.status}>{status}</p> : null}
    </section>
  );
}
