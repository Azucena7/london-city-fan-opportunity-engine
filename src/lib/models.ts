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
  refresh?: PublicSignalRefresh;
};

export type PublicSignalRefresh = {
  automated: boolean;
  cadence: "weekly-and-fixture-windows";
  lastAttemptAt: string;
  lastSuccessfulAt: string | null;
  state: "fresh" | "partial" | "waiting";
  sources: Array<{
    id: string;
    label: string;
    state: "measured" | "waiting";
    confidence: "high" | "medium" | "unavailable";
    checkedAt: string;
    sourceUrl: string;
    message?: string;
  }>;
};

export type CampaignState = "suggested" | "draft" | "ready" | "live" | "closed";
export type CampaignOperationalState = "complete" | "ready" | "planned" | "briefed" | "requires-approval" | "requires-partner" | "requires-instrumentation" | "requires-access" | "public-inferred" | "public-measurable" | "pending-source";

export type CampaignPlan = {
  id: string;
  fixtureId: string;
  status: CampaignState;
  utmCampaign: string;
  title: LocalizedText;
  objective: LocalizedText;
  whyNow: LocalizedText;
  triggerSignalIds: string[];
  audiences: Array<{ id: string; label: LocalizedText; state: "public-inferred" | "requires-access" }>;
  proposition: LocalizedText;
  message: LocalizedText;
  offer: { description: LocalizedText; state: "requires-approval" | "approved" };
  activations: Array<{
    id: string;
    playbookId: string;
    title: LocalizedText;
    channel: string;
    role: LocalizedText;
    asset: LocalizedText;
    trackingCampaignIds: string[];
    utmSource: string;
    utmMedium: string;
    utmContent: string;
    state: "briefed" | "requires-partner" | "ready";
  }>;
  schedule: Array<{ window: string; date: string; action: LocalizedText; state: "complete" | "planned" | "requires-approval" }>;
  budgetMix: Array<{ channel: string; share: number }>;
  measurement: Array<{ id: string; label: LocalizedText; state: "public-measurable" | "pending-source" | "requires-instrumentation" | "requires-access"; target: LocalizedText }>;
  approvals: Array<{ id: string; label: LocalizedText; state: "ready" | "requires-approval" | "requires-instrumentation" | "requires-access" }>;
  guardrails: LocalizedText[];
  nextApproval: LocalizedText;
};

export type CampaignPlanData = {
  version: "1.0";
  checkedAt: string;
  principle: LocalizedText;
  playbooks: Array<{ id: string; name: string; purpose: LocalizedText }>;
  campaigns: CampaignPlan[];
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

export type PostMatchEvidenceState = "public-measured" | "public-reported" | "synthetic-demo" | "requires-access" | "waiting";

export type PostMatchReview = {
  fixtureId: string;
  status: string;
  updatedAt: string;
  result: string;
  ticketsSold: number;
  ticketsSoldQualifier?: string;
  attendance: number;
  attendanceState: "measured" | "reported";
  occupancy: string;
  headline: LocalizedText;
  learning: LocalizedText;
  nextAction: LocalizedText;
  dataGaps: string[];
};

export type PostMatchScorecardMetric = {
  id: string;
  label: LocalizedText;
  value: string;
  state: PostMatchEvidenceState;
};

export type PostMatchScorecardWindow = {
  id: "T+1" | "T+7" | "T+30" | "T+60" | "T+90";
  dueAfterDays: number;
  status: "complete" | "partial" | "waiting" | "demo";
  objective: LocalizedText;
};

export type PostMatchScorecard = {
  fixtureId: string;
  fixtureDate: string;
  opponent: string;
  mode: "public" | "synthetic-demo";
  headline: LocalizedText;
  interpretation: LocalizedText;
  nextAction: LocalizedText;
  metrics: PostMatchScorecardMetric[];
  windows: PostMatchScorecardWindow[];
  dataGaps: string[];
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
