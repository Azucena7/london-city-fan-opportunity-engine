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
  sourceDiscrepancies?: SourceDiscrepancy[];
};

export type SourceDiscrepancy = {
  field: "kickoff" | "date" | "venue";
  detectedAt: string;
  state: "unresolved" | "resolved";
  values: Array<{
    value: string;
    sourceName: string;
    sourceUrl: string;
    checkedAt: string;
  }>;
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

export type EventLandscapeData = {
  version: string;
  checkedAt: string | null;
  state: "operational" | "degraded" | "waiting";
  source: { name: string; url: string };
  sources?: Array<{ name: string; url: string }>;
  window: { startDate: string | null; endDate: string | null; city: string };
  rawEventCount?: number;
  excludedEventCount?: number;
  events: Array<{
    id: string;
    name: string;
    date: string;
    time: string | null;
    venue: string;
    city: string;
    category: string;
    genre: string | null;
    competition?: string;
    url: string;
    fixtureIds: string[];
    kind?: "public-event" | "same-league-fixture" | "england-men-fixture" | "london-premier-league-fixture" | "london-europe-fixture" | "london-efl-fixture" | "national-marquee-fixture";
    sourceName?: string;
    sourceUrl?: string;
    latitude?: number | null;
    longitude?: number | null;
    slotCount?: number;
    score?: number;
    level?: "high" | "medium" | "context";
    reasons?: LocalizedText[];
    fixtureScores?: Array<{
      fixtureId: string;
      score: number;
      level: "high" | "medium" | "context";
      timeGapMinutes: number | null;
      distanceKm: number | null;
      reasons: LocalizedText[];
    }>;
  }>;
  refresh: {
    lastAttemptAt: string | null;
    lastSuccessfulAt: string | null;
    message: string | null;
  };
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

export type SearchDemandState = "measured" | "insufficient-sample" | "source-unavailable" | "requires-access";

export type SearchDemandData = {
  checkedAt: string;
  status: "baseline-pending" | "baseline-ready";
  source: {
    name: string;
    url: string;
    access: "public-ui" | "alpha-api";
    state: SearchDemandState;
    note: LocalizedText;
  };
  methodology: {
    window: string;
    normalization: string;
    rule: LocalizedText;
  };
  markets: Array<{
    code: "GB" | "ES";
    label: LocalizedText;
    comparisonSets: Array<{
      id: string;
      label: LocalizedText;
      terms: Array<{ id: string; query: string; stage: "player" | "club" | "fixture" | "ticket" | "travel" }>;
      exploreUrl: string;
      snapshots: Array<{
        observedAt: string;
        state: SearchDemandState;
        series: Array<{ date: string; termId: string; value: number }>;
        note: LocalizedText;
      }>;
    }>;
  }>;
  ladder: Array<{
    stage: "player" | "club" | "fixture" | "ticket" | "travel";
    label: LocalizedText;
    question: LocalizedText;
    state: "tracked" | "waiting";
  }>;
  activationLinks: Array<{
    activationId: string;
    expectedStage: "player" | "club" | "fixture" | "ticket" | "travel";
    hypothesis: LocalizedText;
    measurementState: "waiting" | "measurable";
  }>;
  experienceGates: Array<{
    id: string;
    label: LocalizedText;
    threshold: LocalizedText;
    state: "waiting" | "passed" | "failed";
  }>;
};

export type ExperienceDemandData = {
  version: "1.0";
  checkedAt: string;
  status: "validation-concept" | "collecting-interest" | "partner-review" | "sellable";
  headline: LocalizedText;
  principle: LocalizedText;
  concepts: Array<{
    id: string;
    title: LocalizedText;
    strapline: LocalizedText;
    audience: LocalizedText;
    currency: "GBP" | "EUR";
    state: "concept" | "validation" | "partner-required" | "sellable";
    includes: LocalizedText[];
    excludes: LocalizedText[];
    priceBands: Array<{ id: string; label: string }>;
  }>;
  fixtures: Array<{ id: string; date: string; opponent: string; label: LocalizedText }>;
  origins: Array<{ id: string; market: "GB" | "ES" | "OTHER"; label: LocalizedText }>;
  partySizes: Array<{ id: string; label: LocalizedText }>;
  funnel: Array<{
    id: "view" | "concept_select" | "configuration_complete" | "register_interest" | "deposit" | "purchase";
    label: LocalizedText;
    state: "ready" | "requires-instrumentation" | "blocked";
    measure: LocalizedText;
  }>;
  searchDemandGateIds: string[];
  launchGates: Array<{ id: string; label: LocalizedText; owner: LocalizedText; state: "waiting" | "ready" }>;
  analytics: {
    eventName: string;
    state: "requires-instrumentation" | "ready";
    fields: string[];
    prohibitedFields: string[];
  };
  guardrails: Array<{ id: string; text: LocalizedText }>;
};

export type MobilityPartnershipData = {
  version: "1.0";
  checkedAt: string;
  status: "planning-scenario" | "partner-review" | "pilot-approved";
  demandState: "requires-instrumentation" | "measured-aggregate";
  headline: LocalizedText;
  principle: LocalizedText;
  pilots: Array<{
    fixtureId: string;
    label: LocalizedText;
    appealScore: number;
    purpose: LocalizedText;
  }>;
  corridors: Array<{
    id: string;
    label: LocalizedText;
    representativeOrigins: string[];
    evidenceState: "modelled-scenario" | "measured-aggregate";
    territoryOpportunity: number;
    travelFriction: number;
    groupSuitability: number;
    note: LocalizedText;
  }>;
  partnerModels: Array<{
    id: string;
    category: "journey-technology" | "rail" | "vehicle-operator";
    candidate: string;
    state: "candidate-not-contacted" | "under-review" | "approved";
    role: LocalizedText;
  }>;
  scoring: {
    weights: {
      territoryOpportunity: number;
      travelFriction: number;
      groupSuitability: number;
      fixtureAppeal: number;
    };
    explanation: LocalizedText;
  };
  simulator: {
    currency: "GBP";
    minimumAggregateCohort: number;
    defaultFarePerRider: number;
    capacities: Array<{ seats: number; scenarioCost: number }>;
    warning: LocalizedText;
  };
  experienceEvent: {
    eventName: string;
    demandField: string;
    state: "requires-instrumentation" | "ready";
  };
  guardrails: Array<{ id: string; text: LocalizedText }>;
};

export type ExperimentMeasurementData = {
  version: "1.0";
  checkedAt: string;
  status: "provider-not-configured" | "test-collecting" | "production-collecting";
  headline: LocalizedText;
  principle: LocalizedText;
  minimumAggregateCohort: number;
  experiments: Array<{
    id: string;
    fixtureId: string;
    label: LocalizedText;
    objective: LocalizedText;
  }>;
  events: Array<{
    name: "experience_concept_selected" | "experience_validation_complete" | "mobility_scenario_evaluated";
    source: "experience" | "mobility";
    label: LocalizedText;
    allowedProperties: string[];
    requiredProperties: string[];
    propertyTypes: Partial<Record<string, string>>;
    state: "provider-ready";
  }>;
  cohorts: Array<{
    fixtureId: string;
    sampleSize: number | null;
    transportInterestCount: number | null;
    mobilityScenarioCount: number | null;
    state: "not-instrumented" | "insufficient-sample" | "threshold-met";
  }>;
  provider: {
    ingestEnvironmentVariable: string;
    summaryEnvironmentVariable: string;
    secretEnvironmentVariable: string;
    modeEnvironmentVariable: string;
    defaultMode: "test";
    maximumRetentionDays: number;
  };
  commonFields: string[];
  prohibitedFields: string[];
  qualityRules: Array<{ id: string; text: LocalizedText }>;
  guardrails: Array<{ id: string; text: LocalizedText }>;
};

export type PartnerEvidenceState = "public-verified" | "modelled-scenario" | "requires-measurement" | "requires-partner";

export type PartnerCommercialPackData = {
  version: "1.0";
  checkedAt: string;
  status: "prospecting-draft" | "partner-review" | "approved";
  measurementState: "provider-not-configured" | "test-collecting" | "production-collecting";
  headline: LocalizedText;
  principle: LocalizedText;
  fixtures: Array<{ fixtureId: string; label: LocalizedText }>;
  packs: Array<{
    id: string;
    category: "journey-technology" | "rail" | "vehicle-operator" | "travel-hospitality";
    candidate: string;
    relationshipState: "candidate-not-contacted" | "exploratory" | "approved";
    title: LocalizedText;
    proposition: LocalizedText;
    whyFit: LocalizedText;
    recommendedFixtureIds: string[];
    clubOffers: LocalizedText[];
    partnerContributes: LocalizedText[];
    activationAssets: LocalizedText[];
    commercialAsk: LocalizedText;
    evidence: Array<{
      id: string;
      label: LocalizedText;
      state: PartnerEvidenceState;
      detail: LocalizedText;
    }>;
    kpis: Array<{
      id: string;
      label: LocalizedText;
      state: "public-measurable" | "requires-instrumentation" | "requires-partner" | "requires-access";
    }>;
  }>;
  pilotPhases: Array<{
    id: string;
    label: LocalizedText;
    output: LocalizedText;
    state: "ready" | "waiting";
  }>;
  approvalGates: Array<{
    id: string;
    label: LocalizedText;
    owner: LocalizedText;
    state: "waiting" | "ready";
  }>;
  guardrails: Array<{ id: string; text: LocalizedText }>;
};

export type PilotReadinessState = "ready" | "waiting" | "blocked";

export type PilotReadinessData = {
  version: "1.0";
  checkedAt: string;
  status: "decision-draft" | "ready-for-review" | "approved";
  recommendationState: "provisional" | "approved";
  recommendedPackId: string;
  recommendedFixtureId: string;
  headline: LocalizedText;
  principle: LocalizedText;
  scoringModel: {
    scale: "1-5";
    dimensions: Array<{
      id: "impact" | "feasibility" | "evidence" | "speed" | "control";
      label: LocalizedText;
      weight: number;
    }>;
  };
  candidates: Array<{
    packId: string;
    fixtureId: string;
    rank: number;
    scores: Record<"impact" | "feasibility" | "evidence" | "speed" | "control", number>;
    weightedScore: number;
    decision: "recommended-for-review" | "hold" | "not-prioritised";
    rationale: LocalizedText;
    blockers: string[];
  }>;
  owners: Array<{
    id: string;
    label: LocalizedText;
    remit: LocalizedText;
    state: "awaiting-assignment" | "assigned";
  }>;
  checklist: Array<{
    id: string;
    category: "evidence" | "commercial" | "operations" | "rights" | "privacy" | "measurement";
    label: LocalizedText;
    ownerId: string;
    state: PilotReadinessState;
    sourceRef: string;
  }>;
  timeline: Array<{
    id: string;
    offset: "T-90" | "T-60" | "T-30" | "T-14" | "T-7" | "MATCHDAY" | "T+7";
    label: LocalizedText;
    output: LocalizedText;
    ownerId: string;
    state: "planned" | "waiting" | "blocked";
  }>;
  budgetInputs: Array<{
    id: string;
    label: LocalizedText;
    currency: "GBP";
    value: null;
    state: "required-input";
  }>;
  outreachDraft: {
    state: "not-approved" | "approved";
    sendEnabled: false;
    subject: LocalizedText;
    opening: LocalizedText;
    agenda: LocalizedText[];
  };
  decision: {
    state: "hold" | "ready-for-review" | "go" | "no-go";
    blockingChecklistIds: string[];
    nextReview: LocalizedText;
  };
  guardrails: Array<{ id: string; text: LocalizedText }>;
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

export type ActivationChannel = "website" | "ticketing" | "instagram" | "news" | "matchday" | "partner";
export type FunnelStage = "awareness" | "consideration" | "conversion" | "experience" | "retention";

export type ClubActivation = {
  id: string;
  fixtureId: string;
  observedAt: string;
  window: string;
  channel: ActivationChannel;
  funnelStage: FunnelStage;
  audience: LocalizedText;
  title: LocalizedText;
  messageAngle: LocalizedText;
  product: LocalizedText;
  callToAction: LocalizedText;
  sourceName: string;
  sourceUrl: string;
  evidenceState: "observed" | "partially-observed" | "cannot-verify";
  confidence: "high" | "medium" | "low";
};

export type StrategyHypothesis = {
  id: string;
  title: LocalizedText;
  rationale: LocalizedText;
  confidence: "high" | "medium" | "low";
  evidenceIds: string[];
};

export type ActivationAlignment = {
  id: string;
  recommendation: LocalizedText;
  observed: LocalizedText;
  status: "deployed" | "partially-observed" | "not-publicly-observed" | "cannot-verify";
};

export type ClubActivationDataset = {
  fixtureId: string;
  comparisonFixtureId: string;
  checkedAt: string;
  coverage: Array<{
    channel: ActivationChannel;
    state: "covered" | "partial" | "unavailable";
    note: LocalizedText;
  }>;
  observations: ClubActivation[];
  hypotheses: StrategyHypothesis[];
  alignment: ActivationAlignment[];
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
