"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailabilityWindow } from "@/lib/availabilityIntelligence";
import { rankSchedulingSlots, type SchedulingRequirement } from "@/lib/schedulingIntelligence";
import styles from "./CalendarSlotFinder.module.css";

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

const roleOptions = [
  "President",
  "General Director",
  "Head of Marketing",
  "Commercial Director",
  "Secretary / Protocol"
];

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

export function CalendarSlotFinder({
  fixtureDate,
  fixtureLabel
}: {
  fixtureDate: string;
  fixtureLabel: string;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Head of Marketing", "Secretary / Protocol"]);
  const [includeSquad, setIncludeSquad] = useState(true);

  const fixture = new Date(`${fixtureDate}T12:00:00Z`);
  const rangeEnd = fixture.toISOString();
  const rangeStart = new Date(fixture.getTime() - 14 * 86400000).toISOString();

  useEffect(() => {
    void (async () => {
      const session = await fetch("/api/auth/session", { cache: "no-store" });
      const sessionResult = await session.json() as { authenticated?: boolean; clubs?: Club[] };
      const nextClubs = Array.isArray(sessionResult.clubs) ? sessionResult.clubs : [];
      setClubs(nextClubs);
      if (!sessionResult.authenticated || !nextClubs.length) return;

      const clubId = nextClubs[0].id;
      setActiveClubId(clubId);
      const response = await fetch(`/api/availability?clubId=${encodeURIComponent(clubId)}&from=${encodeURIComponent(rangeStart)}&to=${encodeURIComponent(rangeEnd)}`, { cache: "no-store" });
      const result = await response.json() as { windows?: ApiWindow[] };
      setWindows(response.ok && Array.isArray(result.windows) ? result.windows.map(mapWindow) : []);
    })();
  }, [fixtureDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const requirements = useMemo<SchedulingRequirement[]>(() => {
    const roles = selectedRoles.map((label) => ({ id: label, label, subjectType: "staff-role" as const, required: true }));
    if (!includeSquad) return roles;
    return [...roles, { id: "squad", label: "First-team squad", subjectType: "squad" as const, required: false }];
  }, [includeSquad, selectedRoles]);

  const candidates = useMemo(() => rankSchedulingSlots({
    from: rangeStart,
    to: rangeEnd,
    durationMinutes: 60,
    requirements,
    windows,
    maxResults: 5
  }), [rangeStart, rangeEnd, requirements, windows]);

  if (!clubs.length) return null;

  return (
    <section className={styles.wrap} aria-label="Calendar slot intelligence">
      <div className={styles.head}>
        <div>
          <span>Calendar intelligence</span>
          <h2>When is the best moment to make this happen?</h2>
          <p>AVELA ranks common windows before {fixtureLabel}. Unknown calendars stay unknown — they are never treated as free.</p>
        </div>
        <div className={styles.range}>
          <span>Search window</span>
          <strong>14 days before fixture</strong>
          <small>60-minute working slots</small>
        </div>
      </div>

      <div className={styles.requirements}>
        <strong>Who needs to be there?</strong>
        <div>
          {roleOptions.map((role) => (
            <label key={role}>
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={(event) => setSelectedRoles((current) => event.target.checked ? [...current, role] : current.filter((item) => item !== role))}
              />
              {role}
            </label>
          ))}
          <label>
            <input type="checkbox" checked={includeSquad} onChange={(event) => setIncludeSquad(event.target.checked)} />
            Consider squad availability
          </label>
        </div>
      </div>

      <div className={styles.candidates}>
        {candidates.map((candidate, index) => (
          <article key={candidate.startsAt} data-state={candidate.state}>
            <div className={styles.rank}>{index + 1}</div>
            <div>
              <span>{candidate.label}</span>
              <strong>{new Date(candidate.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}</strong>
              <p>
                {candidate.unknown.length
                  ? `Still need calendar data for: ${candidate.unknown.join(", ")}.`
                  : candidate.cautions.length
                    ? candidate.cautions.join(" · ")
                    : candidate.positives.length
                      ? candidate.positives.join(" · ")
                      : "No conflict recorded."}
              </p>
            </div>
            <div className={styles.score}>
              <span>Fit</span>
              <strong>{candidate.score}</strong>
            </div>
          </article>
        ))}
        {!candidates.length ? <p>No viable working slot is currently visible in this window.</p> : null}
      </div>

      <div className={styles.guardrail}>
        <strong>Scheduling rule</strong>
        <p>AVELA can rank calendars, but it will not infer availability from silence. Connect or enter President, General Director, Marketing, Protocol, player and venue calendars to turn unknowns into reliable scheduling recommendations.</p>
      </div>
    </section>
  );
}
