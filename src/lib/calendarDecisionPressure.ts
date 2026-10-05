import type { CalendarRelationship } from "@/lib/calendarIntelligence";
import type { OpportunityRadarItem } from "@/lib/opportunityRadar";

export type CalendarPressureState = "Act now" | "Review" | "Watch" | "None";

export type FixtureCalendarPressure = {
  state: CalendarPressureState;
  highConflicts: number;
  mediumConstraints: number;
  internalBlocks: number;
  sequenceOpportunities: number;
  drivers: string[];
  relationships: CalendarRelationship[];
};

export type DecisionAttentionItem = OpportunityRadarItem & {
  attentionState: OpportunityRadarItem["radarState"];
  calendarPressure: FixtureCalendarPressure;
  attentionReason: string;
};

function calendarPressure(item: OpportunityRadarItem, relationships: CalendarRelationship[]): FixtureCalendarPressure {
  const related = relationships.filter((relationship) => relationship.fixtureIds.includes(item.fixtureId));
  const highConflicts = related.filter((relationship) => relationship.type === "conflict" && relationship.strength === "high").length;
  const mediumConstraints = related.filter((relationship) =>
    ["conflict","avoidance"].includes(relationship.type) && relationship.strength === "medium"
  ).length;
  const internalBlocks = related.filter((relationship) =>
    relationship.sourceKind === "internal-availability"
    && relationship.type === "conflict"
    && relationship.strength === "high"
  ).length;
  const sequenceOpportunities = related.filter((relationship) =>
    relationship.type === "sequence"
    || relationship.secondaryTypes.includes("content-transfer")
    || relationship.secondaryTypes.includes("resource-efficiency")
  ).length;

  let state: CalendarPressureState = "None";
  if ((internalBlocks > 0 || highConflicts > 0) && item.daysToFixture <= 14) state = "Act now";
  else if (highConflicts >= 2 && item.daysToFixture <= 28) state = "Act now";
  else if (highConflicts > 0 || mediumConstraints > 0) state = "Review";
  else if (sequenceOpportunities > 0) state = "Watch";

  return {
    state,
    highConflicts,
    mediumConstraints,
    internalBlocks,
    sequenceOpportunities,
    drivers: related.slice(0, 4).map((relationship) => relationship.title),
    relationships: related
  };
}

function radarWeight(state: OpportunityRadarItem["radarState"]) {
  if (state === "Act now") return 3;
  if (state === "Review") return 2;
  if (state === "Monitor") return 1;
  return 0;
}

function pressureWeight(state: CalendarPressureState) {
  if (state === "Act now") return 3;
  if (state === "Review") return 2;
  if (state === "Watch") return 1;
  return 0;
}

function combinedState(
  radarState: OpportunityRadarItem["radarState"],
  pressureState: CalendarPressureState
): OpportunityRadarItem["radarState"] {
  const weight = Math.max(radarWeight(radarState), pressureWeight(pressureState));
  if (weight === 3) return "Act now";
  if (weight === 2) return "Review";
  if (weight === 1) return "Monitor";
  return "No material opportunity";
}

export function applyCalendarDecisionPressure(
  radar: OpportunityRadarItem[],
  relationships: CalendarRelationship[]
): DecisionAttentionItem[] {
  return radar
    .map((item) => {
      const pressure = calendarPressure(item,relationships);
      const attentionState = combinedState(item.radarState,pressure.state);
      const elevated = radarWeight(attentionState) > radarWeight(item.radarState);
      const leadDriver = pressure.drivers[0] ?? "No material calendar relationship is currently derived.";

      return {
        ...item,
        attentionState,
        calendarPressure: pressure,
        attentionReason: elevated
          ? "Calendar pressure elevates " + item.radarState + " → " + attentionState + ": " + leadDriver
          : pressure.state === "None"
            ? "No material calendar pressure changes the opportunity state."
            : "Opportunity state remains " + item.radarState + "; calendar pressure is " + pressure.state + ": " + leadDriver
      };
    })
    .sort((a,b) =>
      radarWeight(b.attentionState) - radarWeight(a.attentionState)
      || b.rank - a.rank
      || a.date.localeCompare(b.date)
    );
}
