export type AvailabilityType = "hard-unavailable" | "protected" | "preferred" | "busy" | "tentative" | "available";
export type AvailabilityReason = "off-day" | "christmas-break" | "recovery" | "travel" | "training" | "international-duty" | "internal-event" | "external-event" | "personal-calendar" | "venue-block" | "other";

export type AvailabilityWindow = {
  id: string;
  subjectType: "squad" | "player" | "staff-role" | "team" | "department" | "venue";
  subjectId?: string | null;
  subjectLabel: string;
  availabilityType: AvailabilityType;
  reasonType: AvailabilityReason;
  title: string;
  detail?: string | null;
  startsAt: string;
  endsAt: string;
  sourceType: "internal" | "external" | "connector" | "user";
  confidence: "confirmed" | "likely" | "tentative";
};

export type AvailabilityAssessment = {
  status: "good" | "tight" | "blocked";
  label: "Good window" | "Tight window" | "Blocked";
  hardBlocks: AvailabilityWindow[];
  cautions: AvailabilityWindow[];
  positives: AvailabilityWindow[];
  summary: string;
};

function overlaps(startsAt: string, endsAt: string, window: AvailabilityWindow) {
  return new Date(startsAt).getTime() < new Date(window.endsAt).getTime()
    && new Date(endsAt).getTime() > new Date(window.startsAt).getTime();
}

export function assessAvailability(
  startsAt: string,
  endsAt: string,
  windows: AvailabilityWindow[]
): AvailabilityAssessment {
  const active = windows.filter((window) => overlaps(startsAt, endsAt, window));
  const hardBlocks = active.filter((window) => window.availabilityType === "hard-unavailable");
  const cautions = active.filter((window) => ["protected","busy","tentative"].includes(window.availabilityType));
  const positives = active.filter((window) => ["preferred","available"].includes(window.availabilityType));

  if (hardBlocks.length) {
    return {
      status: "blocked",
      label: "Blocked",
      hardBlocks,
      cautions,
      positives,
      summary: `${hardBlocks.length} hard availability conflict${hardBlocks.length === 1 ? "" : "s"} overlap this window.`
    };
  }

  if (cautions.length) {
    return {
      status: "tight",
      label: "Tight window",
      hardBlocks,
      cautions,
      positives,
      summary: `${cautions.length} protected, busy or tentative constraint${cautions.length === 1 ? "" : "s"} need review.`
    };
  }

  return {
    status: "good",
    label: "Good window",
    hardBlocks,
    cautions,
    positives,
    summary: positives.length ? "No blocking conflict and at least one preferred/available window is present." : "No internal availability conflict is currently recorded."
  };
}
