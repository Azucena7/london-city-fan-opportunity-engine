"use client";

import { useEffect, useMemo, useState } from "react";
import { assessOperationalCapacity, type CapacityWindow, type OperationalPlanInput, type WorkloadItem } from "@/lib/operationalCapacity";
import styles from "./OperationalCapacityPanel.module.css";

type Club = { id: string; name: string; role: string };
type WorkloadRow = {
  id: string;
  subject_label: string;
  state: WorkloadItem["state"];
  estimated_minutes: number;
  complexity_score: number;
  due_at?: string | null;
};
type CapacityRow = {
  id: string;
  subject_label: string;
  available_minutes: number;
  starts_at: string;
  ends_at: string;
};

export function OperationalCapacityPanel({
  plan,
  windowStart,
  windowEnd
}: {
  plan: OperationalPlanInput;
  windowStart: string;
  windowEnd: string;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [workload, setWorkload] = useState<WorkloadItem[]>([]);
  const [capacity, setCapacity] = useState<CapacityWindow[]>([]);

  async function load(clubId: string) {
    const response = await fetch(
      `/api/operational-capacity?clubId=${encodeURIComponent(clubId)}&from=${encodeURIComponent(windowStart)}&to=${encodeURIComponent(windowEnd)}`,
      { cache: "no-store" }
    );
    const result = await response.json() as { workload?: WorkloadRow[]; capacity?: CapacityRow[] };

    setWorkload(response.ok && Array.isArray(result.workload) ? result.workload.map((row) => ({
      id: row.id,
      subjectLabel: row.subject_label,
      estimatedMinutes: row.estimated_minutes,
      complexityScore: row.complexity_score,
      state: row.state,
      dueAt: row.due_at
    })) : []);

    setCapacity(response.ok && Array.isArray(result.capacity) ? result.capacity.map((row) => ({
      id: row.id,
      subjectLabel: row.subject_label,
      availableMinutes: row.available_minutes,
      startsAt: row.starts_at,
      endsAt: row.ends_at
    })) : []);
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
  }, [windowStart, windowEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const assessment = useMemo(() => assessOperationalCapacity({ plan, workload, capacity }), [plan, workload, capacity]);

  if (!clubs.length) return null;

  return (
    <section className={styles.wrap} aria-label="Operational complexity and capacity">
      <div className={styles.head}>
        <div>
          <span>Operational intelligence</span>
          <h2>Can we realistically deliver this?</h2>
          <p>AVELA estimates difficulty from time pressure, tasks, dependencies, approvals, teams, external parties and unknowns, then compares the plan with recorded workload and capacity.</p>
        </div>
        <div className={styles.verdict} data-state={assessment.feasibility.toLowerCase()}>
          <span>Feasibility</span>
          <strong>{assessment.feasibility}</strong>
          <small>{assessment.capacityUtilisation === null ? "Capacity not connected" : `${assessment.capacityUtilisation}% of recorded capacity after this plan`}</small>
        </div>
      </div>

      <div className={styles.metrics}>
        <article>
          <span>Complexity</span>
          <strong>{assessment.complexity}</strong>
          <small>{assessment.complexityScore}/100</small>
        </article>
        <article>
          <span>Estimated work</span>
          <strong>{Math.round(plan.estimatedMinutes / 60 * 10) / 10}h</strong>
          <small>{plan.taskCount} planned actions</small>
        </article>
        <article>
          <span>Coordination</span>
          <strong>{plan.teamCount} teams</strong>
          <small>{plan.dependencyCount} dependencies · {plan.approvalCount} approvals</small>
        </article>
        <article>
          <span>Time pressure</span>
          <strong>{plan.daysAvailable}d</strong>
          <small>{plan.externalParties} external parties · {plan.unknownInputs} unknown inputs</small>
        </article>
      </div>

      <div className={styles.explain}>
        <div>
          <span>Why AVELA rates it this way</span>
          <ul>{assessment.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
        <div>
          <span>How to make it viable</span>
          <ul>{assessment.actions.map((action) => <li key={action}>{action}</li>)}</ul>
        </div>
      </div>

      <div className={styles.load}>
        <div>
          <span>Imported / recorded workload</span>
          <strong>{workload.length} active item{workload.length === 1 ? "" : "s"}</strong>
        </div>
        <div>
          <span>Capacity windows</span>
          <strong>{capacity.length} record{capacity.length === 1 ? "" : "s"}</strong>
        </div>
        <p>When Asana, Monday, Jira, Teams or another work system is connected, AVELA can use its tasks and progress here without becoming a second task manager.</p>
      </div>
    </section>
  );
}
