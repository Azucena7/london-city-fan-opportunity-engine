import type { AvailabilityWindow } from "@/lib/availabilityIntelligence";

export type SchedulingRequirement = {
  id: string;
  label: string;
  subjectType: AvailabilityWindow["subjectType"];
  subjectId?: string | null;
  required: boolean;
};

export type SchedulingCandidate = {
  startsAt: string;
  endsAt: string;
  score: number;
  state: "good" | "possible" | "poor" | "blocked" | "unknown";
  label: string;
  blockers: string[];
  cautions: string[];
  unknown: string[];
  positives: string[];
};

function overlaps(start: Date, end: Date, window: AvailabilityWindow) {
  return start.getTime() < new Date(window.endsAt).getTime()
    && end.getTime() > new Date(window.startsAt).getTime();
}

function matchesRequirement(window: AvailabilityWindow, requirement: SchedulingRequirement) {
  if (window.subjectType !== requirement.subjectType) return false;
  if (requirement.subjectId) return window.subjectId === requirement.subjectId;
  return window.subjectLabel.toLowerCase() === requirement.label.toLowerCase();
}

function evaluateRequirement(
  start: Date,
  end: Date,
  requirement: SchedulingRequirement,
  windows: AvailabilityWindow[]
) {
  const subjectWindows = windows.filter((window) => matchesRequirement(window, requirement));
  const active = subjectWindows.filter((window) => overlaps(start, end, window));

  if (!subjectWindows.length) {
    return { score: requirement.required ? -14 : -5, state: "unknown" as const, note: requirement.label };
  }

  const hard = active.find((window) => window.availabilityType === "hard-unavailable");
  if (hard) return { score: requirement.required ? -100 : -35, state: "blocked" as const, note: `${requirement.label}: ${hard.title}` };

  const busy = active.find((window) => window.availabilityType === "busy");
  if (busy) return { score: requirement.required ? -45 : -18, state: "caution" as const, note: `${requirement.label}: busy` };

  const protectedWindow = active.find((window) => window.availabilityType === "protected");
  if (protectedWindow) return { score: requirement.required ? -25 : -10, state: "caution" as const, note: `${requirement.label}: protected` };

  const tentative = active.find((window) => window.availabilityType === "tentative");
  if (tentative) return { score: requirement.required ? -12 : -5, state: "caution" as const, note: `${requirement.label}: tentative` };

  const preferred = active.find((window) => window.availabilityType === "preferred");
  if (preferred) return { score: 18, state: "positive" as const, note: `${requirement.label}: preferred` };

  const available = active.find((window) => window.availabilityType === "available");
  if (available) return { score: 12, state: "positive" as const, note: `${requirement.label}: available` };

  return { score: requirement.required ? -8 : -3, state: "unknown" as const, note: requirement.label };
}

export function rankSchedulingSlots({
  from,
  to,
  durationMinutes,
  requirements,
  windows,
  workdayStartHour = 9,
  workdayEndHour = 18,
  stepMinutes = 60,
  maxResults = 8
}: {
  from: string;
  to: string;
  durationMinutes: number;
  requirements: SchedulingRequirement[];
  windows: AvailabilityWindow[];
  workdayStartHour?: number;
  workdayEndHour?: number;
  stepMinutes?: number;
  maxResults?: number;
}): SchedulingCandidate[] {
  const startBoundary = new Date(from);
  const endBoundary = new Date(to);
  const candidates: SchedulingCandidate[] = [];

  for (let day = new Date(startBoundary); day <= endBoundary; day.setUTCDate(day.getUTCDate() + 1)) {
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;

    for (let minutes = workdayStartHour * 60; minutes + durationMinutes <= workdayEndHour * 60; minutes += stepMinutes) {
      const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, minutes));
      const end = new Date(start.getTime() + durationMinutes * 60000);
      if (start < startBoundary || end > endBoundary) continue;

      const evaluations = requirements.map((requirement) => evaluateRequirement(start, end, requirement, windows));
      const blockers = evaluations.filter((item) => item.state === "blocked").map((item) => item.note);
      const cautions = evaluations.filter((item) => item.state === "caution").map((item) => item.note);
      const unknown = evaluations.filter((item) => item.state === "unknown").map((item) => item.note);
      const positives = evaluations.filter((item) => item.state === "positive").map((item) => item.note);
      const score = Math.max(0, Math.min(100, 60 + evaluations.reduce((sum, item) => sum + item.score, 0)));

      const state: SchedulingCandidate["state"] = blockers.length
        ? "blocked"
        : score >= 75 && !unknown.length
          ? "good"
          : score >= 50
            ? "possible"
            : unknown.length === requirements.length
              ? "unknown"
              : "poor";

      candidates.push({
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        score,
        state,
        label: state === "good" ? "Best fit" : state === "possible" ? "Possible" : state === "blocked" ? "Blocked" : state === "unknown" ? "Needs calendar data" : "Poor fit",
        blockers,
        cautions,
        unknown,
        positives
      });
    }
  }

  return candidates
    .filter((candidate) => candidate.state !== "blocked")
    .sort((a, b) => b.score - a.score || a.startsAt.localeCompare(b.startsAt))
    .slice(0, maxResults);
}
