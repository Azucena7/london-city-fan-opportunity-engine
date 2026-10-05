import type { CalendarFixture, CampaignPlanData } from "@/lib/models";
import type { CalendarRelationship } from "@/lib/calendarIntelligence";
import { supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

type AvailabilityRow = {
  id: string;
  subject_type: "squad" | "player" | "staff-role" | "team" | "department" | "venue";
  subject_id?: string | null;
  subject_label: string;
  availability_type: "hard-unavailable" | "protected" | "preferred" | "busy" | "tentative" | "available";
  reason_type: "off-day" | "christmas-break" | "recovery" | "travel" | "training" | "international-duty" | "internal-event" | "external-event" | "personal-calendar" | "venue-block" | "other";
  title: string;
  starts_at: string;
  ends_at: string;
  source_type: "internal" | "external" | "connector" | "user";
  confidence: "confirmed" | "likely" | "tentative";
};

export type InternalCalendarRelationshipResult = {
  state: "connected" | "unavailable";
  relationships: CalendarRelationship[];
};

function overlapsDay(date: string, row: AvailabilityRow) {
  const start = Date.parse(date + "T00:00:00Z");
  const end = Date.parse(date + "T23:59:59Z");
  const windowStart = Date.parse(row.starts_at);
  const windowEnd = Date.parse(row.ends_at);
  if ([start,end,windowStart,windowEnd].some(Number.isNaN)) return false;
  return start < windowEnd && end > windowStart;
}

function publicSubject(row: AvailabilityRow) {
  if (row.reason_type === "personal-calendar") return "Internal personal availability";
  if (row.subject_type === "player" && row.reason_type !== "international-duty") return "Player availability";
  return row.subject_label || "Internal availability";
}

function relationType(row: AvailabilityRow): "conflict" | "avoidance" {
  return row.availability_type === "hard-unavailable" ? "conflict" : "avoidance";
}

function strength(row: AvailabilityRow): "high" | "medium" {
  return row.availability_type === "hard-unavailable" ? "high" : "medium";
}

function reasonLabel(row: AvailabilityRow) {
  return row.reason_type.replaceAll("-"," ");
}

export async function getInternalCalendarRelationships({
  clubId,
  fixtures,
  campaignPlans,
  fromDate,
  toDate
}: {
  clubId?: string | null;
  fixtures: CalendarFixture[];
  campaignPlans: CampaignPlanData;
  fromDate: string;
  toDate: string;
}): Promise<InternalCalendarRelationshipResult> {
  if (!clubId || !supabaseConfigured()) return { state: "unavailable", relationships: [] };

  const response = await supabaseRequest(
    "/rest/v1/availability_windows?club_id=eq." + encodeURIComponent(clubId) +
    "&ends_at=gte." + encodeURIComponent(fromDate + "T00:00:00Z") +
    "&starts_at=lte." + encodeURIComponent(toDate + "T23:59:59Z") +
    "&availability_type=in.(hard-unavailable,protected,busy,tentative)" +
    "&select=id,subject_type,subject_id,subject_label,availability_type,reason_type,title,starts_at,ends_at,source_type,confidence" +
    "&order=starts_at.asc&limit=500"
  );

  if (!response.ok) return { state: "unavailable", relationships: [] };
  const windows = await response.json() as AvailabilityRow[];
  const relationships: CalendarRelationship[] = [];

  for (const window of windows) {
    const subject = publicSubject(window);
    for (const fixture of fixtures.filter((item) => item.date >= fromDate && item.date <= toDate)) {
      if (!overlapsDay(fixture.date,window)) continue;
      relationships.push({
        id: "internal-fixture:" + window.id + ":" + fixture.id,
        type: relationType(window),
        secondaryTypes: [],
        strength: strength(window),
        date: fixture.date,
        title: subject + " overlaps " + (fixture.homeAway === "home" ? "v " : "at ") + fixture.opponent,
        rationale: "A " + reasonLabel(window) + " window is recorded across this fixture date.",
        fixtureIds: [fixture.id],
        sourceKind: "internal-availability",
        sourceLabel: "Internal availability",
        evidence: [
          "Availability: " + window.availability_type,
          "Reason: " + reasonLabel(window),
          "Confidence: " + window.confidence
        ],
        action: window.availability_type === "hard-unavailable"
          ? "Review player/staff/venue dependency before committing execution."
          : "Keep the internal constraint visible when sequencing campaign work."
      });
    }

    for (const campaign of campaignPlans.campaigns) {
      for (const item of campaign.schedule.filter((entry) => entry.state !== "complete")) {
        if (item.date < fromDate || item.date > toDate || !overlapsDay(item.date,window)) continue;
        relationships.push({
          id: "internal-campaign:" + window.id + ":" + campaign.id + ":" + item.date,
          type: relationType(window),
          secondaryTypes: [],
          strength: strength(window),
          date: item.date,
          title: subject + " overlaps campaign work",
          rationale: item.action.en + " for " + campaign.title.en + " falls inside a recorded " + reasonLabel(window) + " window.",
          fixtureIds: [campaign.fixtureId],
          sourceKind: "internal-availability",
          sourceLabel: "Internal availability",
          evidence: [
            "Campaign action: " + item.action.en,
            "Availability: " + window.availability_type,
            "Reason: " + reasonLabel(window),
            "Confidence: " + window.confidence
          ],
          action: window.availability_type === "hard-unavailable"
            ? "Move, simplify or reassign the affected work before the window becomes critical."
            : "Review whether the campaign action should be resequenced."
        });
      }
    }
  }

  return {
    state: "connected",
    relationships: relationships
      .sort((a,b) => (a.strength === b.strength ? a.date.localeCompare(b.date) : a.strength === "high" ? -1 : 1))
      .slice(0, 60)
  };
}
