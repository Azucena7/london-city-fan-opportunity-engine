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

export type CalendarFixture = {
  id: string;
  date: string;
  kickoff?: string;
  opponent: string;
  homeAway: "home" | "away";
  competition: string;
  venue: string;
  status: "scheduled" | "final" | "completed-pending-data";
  result?: { for: number; against: number };
  attendance?: number;
  attendanceState?: "measured" | "reported";
};

export type LocalizedText = { en: string; es: string };

export type LiveSignal = {
  id: string;
  fixtureId?: string;
  category: "demand" | "attention" | "weather" | "sponsorship" | "consumer" | "access";
  state: "measured" | "confirmed" | "reported" | "forecast" | "inferred" | "waiting";
  direction: "positive" | "negative" | "mixed" | "neutral";
  materiality: "high" | "medium" | "low";
  observedAt: string;
  title: LocalizedText;
  summary: LocalizedText;
  marketingAction: LocalizedText;
  sourceName: string;
  sourceUrl: string;
};

export type AttendanceHistoryMatch = {
  id: string;
  season: string;
  date: string;
  kickoff?: string;
  opponent: string;
  competition: string;
  venue: string;
  venueGroup: "hayes-lane" | "the-den";
  attendance: number;
  attendanceState: "measured" | "reported";
  soldOut?: boolean;
  result?: { for: number; against: number };
  sourceName: string;
  sourceUrl: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type AttendanceHistory = {
  season: string;
  scope: string;
  checkedAt: string;
  currentBenchmark: {
    season: string;
    date: string;
    opponent: string;
    attendance: number;
    attendanceState: "measured" | "reported";
    soldOut?: boolean;
    sourceName: string;
    sourceUrl: string;
  };
  discrepancyNote: LocalizedText;
  sources: Array<{ name: string; url: string; role: string }>;
  matches: AttendanceHistoryMatch[];
};

export type LeagueAttendanceClub = {
  club: string;
  attendance: number | null;
  homeMatchesObserved: number;
  state: "measured" | "pending";
  londonMarket: boolean;
  directCohort: boolean;
  soldOut?: boolean;
};

export type LeagueAttendanceSnapshot = {
  id: string;
  label: LocalizedText;
  throughDate: string;
  completeness: LocalizedText;
  clubs: LeagueAttendanceClub[];
};

export type LeagueAttendanceBenchmark = {
  season: string;
  scope: string;
  checkedAt: string;
  targetClub: string;
  sourceName: string;
  sourceUrl: string;
  methodology: LocalizedText;
  marketingImplication: LocalizedText;
  snapshots: LeagueAttendanceSnapshot[];
};

export type AudienceMetric = {
  label: LocalizedText;
  value: string;
  state: "measured" | "confirmed" | "pending";
};

export type AudienceChannel = {
  id: string;
  name: string;
  category: "owned" | "partner" | "broadcast" | "search" | "conversion";
  state: "measured" | "confirmed" | "ready-to-measure" | "requires-access";
  role: LocalizedText;
  metrics: AudienceMetric[];
  known: LocalizedText;
  missing: LocalizedText;
  action: LocalizedText;
  sourceName: string;
  sourceUrl: string;
};

export type AudienceSnapshotMetric = {
  key: string;
  label: LocalizedText;
  value: number | null;
  displayValue: string;
  unit: "subscribers" | "videos" | "views" | "index" | "audience";
  state: "measured" | "confirmed" | "pending" | "requires-access";
  sourceName: string;
  sourceUrl: string;
};

export type AudienceSnapshot = {
  id: string;
  observedAt: string;
  label: LocalizedText;
  fixtureId?: string;
  metrics: AudienceSnapshotMetric[];
};

export type AudienceImpactEvent = {
  id: string;
  date: string;
  category: "player" | "partner" | "broadcast" | "fixture" | "measurement";
  title: LocalizedText;
  hypothesis: LocalizedText;
};

export type AudienceReadinessItem = {
  id: string;
  label: LocalizedText;
  state: "ready" | "planned" | "blocked";
  action: LocalizedText;
};

export type AudienceReachData = {
  checkedAt: string;
  scope: string;
  headline: LocalizedText;
  principle: LocalizedText;
  channels: AudienceChannel[];
  snapshots: AudienceSnapshot[];
  impactTimeline: AudienceImpactEvent[];
  measurementReadiness: AudienceReadinessItem[];
  funnel: Array<{ id: string; label: LocalizedText; measure: LocalizedText }>;
  searchPlan: {
    terms: string[];
    markets: string[];
    windows: string[];
    annotations: Array<{ date: string; event: LocalizedText }>;
  };
  fixtureTests: Array<{
    fixtureId: string;
    date: string;
    opponent: string;
    stage: string;
    attendance: number | null;
    distribution: string;
    conversionState: string;
    nextAction: LocalizedText;
  }>;
};

export type CrmTicketingRecord = {
  schema_version: "1.0";
  fixture_id: string;
  campaign_id: string | null;
  channel: "owned" | "partner" | "broadcast" | "paid" | "organic" | "direct" | "community" | "unknown";
  content_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  supporter_id_hash: string;
  order_id_hash: string;
  ticket_id_hash: string;
  order_timestamp: string;
  ticket_product: string;
  quantity: 1;
  realised_unit_price: number;
  currency: "GBP";
  scan_status: "scanned" | "not_scanned" | "unknown";
  scan_timestamp: string | null;
  postcode_sector: string | null;
  first_time_buyer: boolean | null;
  consent_status: "consented" | "not_consented" | "unknown";
  source_system: string;
  extracted_at: string;
};

export type CrmTicketingDemo = {
  datasetState: "synthetic-demo";
  fixtureId: string;
  label: LocalizedText;
  disclaimer: LocalizedText;
  records: CrmTicketingRecord[];
};

export type CrmTicketingReadiness = {
  checkedAt: string;
  contractVersion: string;
  mode: "synthetic-demo";
  headline: LocalizedText;
  principle: LocalizedText;
  templateUrl: string;
  schemaUrl: string;
  coverage: Array<{
    id: string;
    label: LocalizedText;
    state: "ready" | "demo" | "requires-access";
    detail: LocalizedText;
  }>;
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
