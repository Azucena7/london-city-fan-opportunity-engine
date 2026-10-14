import { calendar, campaignPlans, currentState, eventLandscape } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildCalendarRelationships } from "@/lib/calendarIntelligence";
import { getInternalCalendarRelationships } from "@/lib/calendarIntelligenceServer";
import { applyCalendarDecisionPressure } from "@/lib/calendarDecisionPressure";
import { currentProductDate } from "@/lib/currentProductDate";
import type { ProductOpportunity } from "@/lib/productOpportunity";

// The one decision queue that Home, Radar and Executive read: the same upcoming home
// fixtures, the same attention order and the same decision state, so the "#1 decision"
// and every count agree wherever they appear.

/** How many upcoming home fixtures the decision queue covers. */
export const DECISION_HORIZON = 8;

export async function getDecisionQueue() {
  const today = currentProductDate(currentState.updated_at);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, DECISION_HORIZON);

  const clubContext = await getCurrentClubOperatingContext();
  const opportunityRadar = buildOpportunityRadar(upcoming.map((fixture) => fixture.id), clubContext);
  const calendarToDate = calendar.map((item) => item.date).sort().at(-1) ?? today;
  const externalCalendarRelationships = buildCalendarRelationships({
    fixtures: calendar,
    campaignPlans,
    eventLandscape,
    fromDate: today
  });
  const internalCalendar = await getInternalCalendarRelationships({
    clubId: clubContext?.clubId,
    fixtures: calendar,
    campaignPlans,
    fromDate: today,
    toDate: calendarToDate
  });
  const calendarRelationships = [...externalCalendarRelationships, ...internalCalendar.relationships];
  // Attention order: the queue's first item is the #1 decision on every surface.
  const radar = applyCalendarDecisionPressure(opportunityRadar, calendarRelationships);

  return { today, upcoming, clubContext, calendarRelationships, radar };
}

/**
 * The decision badge for a fixture's decision state. A decision on HOLD has an unresolved
 * blocker; one ready for review waits on a human decision. Used wherever the state is shown.
 */
export function decisionBadge(state: ProductOpportunity["decisionState"]) {
  return state === "HOLD" ? ("BLOCKED" as const) : ("REVIEW" as const);
}
