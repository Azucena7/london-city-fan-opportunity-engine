"use client";

import { useEffect, useState } from "react";
import type { WorkPackage } from "@/lib/workSystemOrchestration";
import type { RoutedWorkPackage } from "@/lib/workSystemRouting";
import styles from "./WorkHandoffConfirmation.module.css";

type Club = { id: string; name: string; role: string; permissions?: string[] };

export function WorkHandoffConfirmation({
  decisionId,
  workPackage,
  plan
}: {
  decisionId: string;
  workPackage: WorkPackage;
  plan: RoutedWorkPackage;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [proposed, setProposed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
        const next = Array.isArray(result.clubs) ? result.clubs : [];
        setClubs(next);
        if (result.authenticated && next.length) {
          setClubId(next[0].id);
        } else {
          setMessage("Sign in to confirm a work-system handoff.");
        }
      } catch {
        setMessage("Account state is unavailable. No handoff package was proposed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!plan.destinationSystem || !plan.connectionRef || !plan.matchedRuleId) return null;

  const activeClub = clubs.find((club) => club.id === clubId) ?? null;
  const canEditCampaigns = Boolean(activeClub?.permissions?.includes("campaigns:edit"));

  async function confirmHandoff() {
    if (!clubId || busy || proposed) return;
    if (!canEditCampaigns) {
      setMessage("Your club role cannot create campaign handoff packages.");
      return;
    }

    setBusy(true);
    setMessage("Validating route and proposing handoff…");
    try {
      const response = await fetch("/api/work-system/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          decisionId,
          destinationSystem: plan.destinationSystem,
          connectionRef: plan.connectionRef,
          matchedRuleId: plan.matchedRuleId,
          workPackage: {
            id: workPackage.id,
            title: workPackage.title,
            estimatedMinutes: workPackage.estimatedMinutes,
            items: workPackage.items.map((item) => ({
              key: item.key,
              category: item.category,
              state: item.state
            }))
          }
        })
      });
      const result = await response.json().catch(() => null) as { proposed?: boolean; message?: string; error?: string } | null;
      if (!response.ok || !result?.proposed) {
        setMessage(result?.error || "Handoff package was not proposed. No external tasks were created.");
        return;
      }
      setProposed(true);
      setMessage(result.message || "Proposed in AVELA. External tasks have not been created yet.");
      window.dispatchEvent(new CustomEvent("avela:execution-handoff-proposed", { detail: { decisionId } }));
    } catch {
      setMessage("The club workspace is unreachable. No handoff package was proposed and no external tasks were created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.wrap} aria-label="Confirm external work handoff">
      <div>
        <span>Human confirmation</span>
        <strong>Propose this package for {plan.destinationSystem}?</strong>
        <p>
          Confirmation records the routed package in AVELA as <b>proposed</b>. It does not create tasks,
          publish content or send anything to the external system.
        </p>
      </div>

      {clubs.length > 1 ? (
        <label>
          Club
          <select value={clubId} disabled={busy || proposed} onChange={(event) => setClubId(event.target.value)}>
            {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
          </select>
        </label>
      ) : null}

      <button
        type="button"
        disabled={loading || busy || proposed || !clubId || !canEditCampaigns}
        onClick={() => void confirmHandoff()}
      >
        {busy ? "Proposing…" : proposed ? "Handoff proposed" : "Confirm handoff package"}
      </button>

      {!loading && clubId && !canEditCampaigns ? <small>Campaign edit permission is required.</small> : null}
      {message ? <p className={styles.status} role="status" aria-live="polite">{message}</p> : null}
    </section>
  );
}
