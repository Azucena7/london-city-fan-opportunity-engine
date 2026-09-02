export type Decision = "ATTACK HARD" | "ATTACK" | "TEST / SELECTIVE" | "DEFEND CORE";

export type Fixture = {
  date: string;
  opponent: string;
  kickoff?: string;
  targetTerritory: string;
  territoryOpportunity: number;
  calendarWhitespace: number;
  attentionPressure: number;
  attentionAvailability: number;
  fixtureAppeal: number;
  weatherSuitability?: number | null;
  planningScore: number;
  decision: Decision;
  product: string;
  channel: string;
  message: string;
  venue?: string;
  stadium?: string;
};

export type Territory = {
  id?: string;
  name?: string;
  lsoa?: string;
  lsoaName?: string;
  borough?: string;
  area?: string;
  opportunityScore?: number;
  finalOpportunity?: number;
  score?: number;
  familyScore?: number;
  householdsWithDependentChildren?: number;
  familyDensity?: number;
  girlsNetworkScore?: number;
  sundayTravelMinutes?: number;
  travelMinutes?: number;
  transfers?: number;
  competitionPressure?: number;
  strategy?: string;
  play?: string;
  [key: string]: unknown;
};

export type LiveMatchState = {
  fixture: Fixture;
  weatherSuitability: number | null;
  attendanceMomentum: number | null;
  planningScore: number;
  liveScore: number | null;
  activeScore: number;
  decision: Decision;
  readiness: number;
  totalSignals: 6;
  updatedAt: string | null;
};
