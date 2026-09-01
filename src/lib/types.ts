export type Territory = {
  id?: string;
  lsoa?: string;
  name?: string;
  borough?: string;
  opportunityScore?: number;
  opportunity_score?: number;
  familyScore?: number;
  girlsNetworkScore?: number;
  travelMinutes?: number;
  competitionPressure?: number;
  strategy?: string;
};

export type Fixture = {
  date?: string;
  opponent?: string;
  ko?: string;
  targetTerritory?: string;
  territoryOpportunity?: number;
  calendarWhitespace?: number;
  attentionPressure?: number;
  attentionAvailability?: number;
  fixtureAppeal?: number;
  weatherSuitability?: number | null;
  attendanceMomentum?: number | null;
  planningScore?: number;
  liveScore?: number | null;
  decision?: string;
  product?: string;
  channel?: string;
  message?: string;
};
