"use client";

import { useEffect, useMemo, useState } from "react";
import { assessAvailability, type AvailabilityWindow } from "@/lib/availabilityIntelligence";
import styles from "./AvailabilityPlanner.module.css";

type Club = { id: string; name: string; role: string };

type ApiWindow = {
  id: string;
  subject_type: AvailabilityWindow["subjectType"];
  subject_id?: string | null;
  subject_label: string;
  availability_type: AvailabilityWindow["availabilityType"];
  reason_type: AvailabilityWindow["reasonType"];
  title: string;
  detail?: string | null;
  starts_at: string;
  ends_at: string;
  source_type: AvailabilityWindow["sourceType"];
  confidence: AvailabilityWindow["confidence"];
};

function mapWindow(row: ApiWindow): AvailabilityWindow {
  return {
    id: row.id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    subjectLabel: row.subject_label,
    availabilityType: row.availability_type,
    reasonType: row.reason_type,
    title: row.title,
    detail: row.detail,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    sourceType: row.source_type,
    confidence: row.confidence
  };
}

export function AvailabilityPlanner({
  fixtureDate,
  fixtureLabel
}: {
  fixtureDate: string;
  fixtureLabel: string;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fixtureStart = `${fixtureDate}T00:00:00Z`;
  const fixtureEnd = `${fixtureDate}T23:59:59Z`;
  const assessment = useMemo(() => assessAvailability(fixtureStart, fixtureEnd, windows), [fixtureStart, fixtureEnd, windows]);

  async function load(clubId: string) {
    try {
      const response = await fetch(`/api/availability?clubId=${encodeURIComponent(clubId)}&from=${encodeURIComponent(fixtureStart)}&to=${encodeURIComponent(fixtureEnd)}`, { cache: "no-store" });
      const result = await response.json() as { windows?: ApiWindow[]; error?: string };
      setWindows(response.ok && Array.isArray(result.windows) ? result.windows.map(mapWindow) : []);
      if (!response.ok) setStatus(result.error || "Internal availability could not be loaded.");
    } catch {
      setWindows([]);
      setStatus("Internal availability service is unreachable. No availability state was changed.");
    }
  }

  useEffect(() => {
    void (async () => {
      try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
      const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(nextClubs);
      if (result.authenticated && nextClubs.length) {
        setActiveClubId(nextClubs[0].id);
        await load(nextClubs[0].id);
      } else {
        setStatus("Sign in to use internal availability intelligence.");
      }
      } catch {
        setClubs([]);
        setStatus("Account state could not be loaded. No availability state was changed.");
      }
    })();
  }, [fixtureDate]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addPreset(kind: "off" | "christmas" | "recovery") {
    if (!activeClubId || saving) return;
    setSaving(true);
    setStatus("");
    const preset = kind === "off"
      ? { availabilityType: "hard-unavailable", reasonType: "off-day", title: "Squad off day", detail: "Internal club off day." }
      : kind === "christmas"
        ? { availabilityType: "hard-unavailable", reasonType: "christmas-break", title: "Christmas break", detail: "Internal Christmas break / protected squad downtime." }
        : { availabilityType: "protected", reasonType: "recovery", title: "Recovery window", detail: "Avoid commercial activation unless operationally necessary." };

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          subjectType: "squad",
          subjectLabel: "First-team squad",
          availabilityType: preset.availabilityType,
          reasonType: preset.reasonType,
          title: preset.title,
          detail: preset.detail,
          startsAt: fixtureStart,
          endsAt: fixtureEnd,
          confidence: "confirmed"
        })
      });

      if (response.ok) {
        setStatus("Internal availability recorded in club workspace.");
        await load(activeClubId);
      } else {
        setStatus("Availability could not be saved. No availability window was added.");
      }
    } catch {
      setStatus("The club workspace is unreachable. No availability window was added.");
    } finally {
      setSaving(false);
    }
  }

  if (!clubs.length) return null;

  return (
    <section className={styles.wrap} aria-label="Internal availability intelligence">
      <div className={styles.head}>
        <div>
          <span>Internal availability</span>
          <h2>What does the club know that public signals cannot see?</h2>
          <p>Off days, Christmas breaks, recovery, travel and protected windows override naive “player available” assumptions.</p>
        </div>
        <div className={styles.assessment} data-state={assessment.status}>
          <span>Fixture-day availability</span>
          <strong>{assessment.label}</strong>
          <small>{assessment.summary}</small>
        </div>
      </div>

      <div className={styles.quickAdd}>
        <button type="button" disabled={saving} onClick={() => void addPreset("off")}>+ Squad off day</button>
        <button type="button" disabled={saving} onClick={() => void addPreset("recovery")}>+ Recovery / protected</button>
        <button type="button" disabled={saving} onClick={() => void addPreset("christmas")}>+ Christmas break</button>
      </div>

      <div className={styles.windowList}>
        {windows.length ? windows.map((window) => (
          <article key={window.id}>
            <span data-type={window.availabilityType}>{window.availabilityType.replaceAll("-", " ")}</span>
            <div>
              <strong>{window.subjectLabel} · {window.title}</strong>
              <p>{window.detail || window.reasonType.replaceAll("-", " ")}</p>
            </div>
            <small>{window.confidence}</small>
          </article>
        )) : (
          <div className={styles.empty}>
            <strong>No internal availability conflict recorded for {fixtureLabel}.</strong>
            <p>This does not prove availability; it means AVELA has no internal block for this date yet.</p>
          </div>
        )}
      </div>

      {status ? <p className={styles.status}>{status}</p> : null}
    </section>
  );
}
