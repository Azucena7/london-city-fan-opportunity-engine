import {
  calendar,
  campaignPlans,
  currentState,
  fixtures,
  liveSignals
} from "@/lib/data";
import type { CampaignPlan, CalendarFixture, Fixture, LiveSignal } from "@/lib/models";

export type ProductEvidenceState = "known" | "assumption" | "missing";

export type ProductOpportunity = {
  fixtureId: string;
  fixture: {
    date: string;
    kickoff?: string;
    opponent: string;
    competition: string;
    venue: string;
  };
  score: number | null;
  opportunityLabel: string;
  opportunity: string;
  whyNow: string;
  recommendedAction: string;
  nextAction: {
    owner: string;
    deadline: string;
    measurement: string;
  };
  audience: {
    label: string;
    value: number | null;
    state: "measured" | "requires-club-data";
  };
  impact: {
    ticketsLow: number | null;
    ticketsHigh: number | null;
    state: "measured" | "scenario-only" | "requires-club-data";
  };
  confidence: {
    label: "High" | "Medium" | "Low";
    rationale: string;
  };
  readiness: {
    ready: number;
    total: number;
    label: string;
  };
  decisionState: "READY FOR REVIEW" | "HOLD";
  primaryBlocker: string;
  blockers: string[];
  known: string[];
  assumptions: string[];
  missing: string[];
  whatWouldChangeDecision: string[];
  liveSignals: Array<{
    id: string;
    title: string;
    state: LiveSignal["state"];
    materiality: LiveSignal["materiality"];
    sourceName: string;
    sourceUrl: string;
  }>;
  updatedAt: string | null;
  sourceMode: "live-engine";
};

function findCurrentFixture(): { calendarFixture: CalendarFixture; fixture: Fixture | null } | null {
  const fixtureId = currentState.next_home_fixture_id as string | undefined;
  if (!fixtureId) return null;

  const calendarFixture = calendar.find((item) => item.id === fixtureId);
  if (!calendarFixture) return null;

  const fixture = fixtures.find(
    (item) =>
      item.date === calendarFixture.date &&
      item.opponent === calendarFixture.opponent
  ) ?? null;

  return { calendarFixture, fixture };
}

function currentCampaign(fixtureId: string): CampaignPlan | null {
  return campaignPlans.campaigns.find((campaign) => campaign.fixtureId === fixtureId) ?? null;
}

function evidenceSignals(fixtureId: string, campaign: CampaignPlan | null) {
  const triggerIds = new Set(campaign?.triggerSignalIds ?? []);
  return liveSignals.filter((signal) =>
    signal.fixtureId === fixtureId ||
    triggerIds.has(signal.id) ||
    signal.id === "attendance-mun-5402"
  );
}

function decisionConfidence(signals: LiveSignal[], campaign: CampaignPlan | null) {
  const strongEvidence = signals.filter((signal) =>
    (signal.state === "measured" || signal.state === "confirmed") &&
    signal.materiality !== "low"
  ).length;

  const accessGap = campaign?.measurement.some((item) =>
    item.state === "requires-access" || item.state === "requires-instrumentation"
  ) ?? true;

  if (strongEvidence >= 3 && !accessGap) {
    return {
      label: "High" as const,
      rationale: "Multiple material signals are confirmed or measured and the key conversion evidence is connected."
    };
  }

  if (strongEvidence >= 2) {
    return {
      label: "Medium" as const,
      rationale: "The contextual case is well supported, but CRM/ticket conversion evidence is not yet connected."
    };
  }

  return {
    label: "Low" as const,
    rationale: "The opportunity still depends on limited confirmed evidence and unresolved data access."
  };
}

function approvalReadiness(campaign: CampaignPlan | null) {
  const approvals = campaign?.approvals ?? [];
  const ready = approvals.filter((item) => item.state === "ready").length;
  return {
    ready,
    total: approvals.length,
    label: approvals.length ? `${ready} of ${approvals.length} gates ready` : "No approval gates configured"
  };
}

function blockerLabels(campaign: CampaignPlan | null) {
  if (!campaign) return ["No live campaign plan is linked to this fixture."];

  return campaign.approvals
    .filter((item) => item.state !== "ready")
    .map((item) => item.label.en);
}

export function getCurrentProductOpportunity(): ProductOpportunity | null {
  const current = findCurrentFixture();
  if (!current) return null;

  const { calendarFixture, fixture } = current;
  const campaign = currentCampaign(calendarFixture.id);
  const signals = evidenceSignals(calendarFixture.id, campaign);
  const confidence = decisionConfidence(signals, campaign);
  const readiness = approvalReadiness(campaign);
  const blockers = blockerLabels(campaign);

  const openerSignal = liveSignals.find((signal) => signal.id === "attendance-mun-5402");
  const watchalongSignal = liveSignals.find((signal) => signal.id === "attention-england-spain");
  const weatherSignal = liveSignals.find((signal) => signal.id === "weather-brighton-waiting");
  const localAvailabilitySignal = liveSignals.find((signal) => signal.id === "attention-bromley-mk-dons-postponed-2026-09-23");

  const recommendedAction =
    openerSignal?.marketingAction.en ??
    campaign?.nextApproval.en ??
    "Build the highest-priority audience and validate the measurement plan before activation.";

  const known = [
    `${calendarFixture.opponent} is scheduled for ${calendarFixture.date}${calendarFixture.kickoff ? ` at ${calendarFixture.kickoff}` : ""}.`,
    openerSignal?.summary.en,
    watchalongSignal?.summary.en,
    localAvailabilitySignal?.summary.en,
    weatherSignal?.summary.en
  ].filter((item): item is string => Boolean(item));

  const assumptions = [
    "A meaningful share of opener buyers is still available to convert for Brighton.",
    "The opener non-returner cohort is contactable through authorised CRM channels.",
    "Repeat-visit propensity is stronger than cold acquisition for this fixture."
  ];

  const missing = [
    "Matched opener buyers who have not purchased Brighton.",
    "Authorised CRM addressability and consent coverage.",
    "Ticket conversion attributable to the recommended activation."
  ];

  const whatWouldChangeDecision = [
    "The matched opener non-returner audience is too small to justify activation.",
    "Organic repeat purchase is already strong enough that incremental CRM spend is unnecessary.",
    "Tracking cannot distinguish campaign-attributed ticket sales from background demand."
  ];

  const score = fixture?.planningScore ?? null;
  const opportunityLabel =
    score === null ? "Opportunity under review" :
    score >= 75 ? "Strong opportunity" :
    score >= 60 ? "Promising opportunity" :
    "Selective opportunity";

  const nextScheduledAction = campaign?.schedule.find((item) => item.state !== "complete");
  const primaryMeasurement = campaign?.measurement.find((item) => item.id === "purchase-scan-repeat")
    ?? campaign?.measurement[0];

  return {
    fixtureId: calendarFixture.id,
    fixture: {
      date: calendarFixture.date,
      kickoff: calendarFixture.kickoff,
      opponent: calendarFixture.opponent,
      competition: calendarFixture.competition,
      venue: calendarFixture.venue
    },
    score,
    opportunityLabel,
    opportunity:
      campaign?.objective.en ??
      "Convert current attention and local demand into qualified ticket intent.",
    whyNow:
      campaign?.whyNow.en ??
      "The next home fixture has active demand and attention signals that justify review.",
    recommendedAction,
    nextAction: {
      owner: "CRM / Marketing",
      deadline: nextScheduledAction
        ? `${nextScheduledAction.window} · ${nextScheduledAction.date}`
        : "Before campaign launch",
      measurement: primaryMeasurement?.label.en ?? "Matched ticket conversion"
    },
    audience: {
      label: "Opener buyers who have not yet purchased Brighton",
      value: null,
      state: "requires-club-data"
    },
    impact: {
      ticketsLow: null,
      ticketsHigh: null,
      state: "requires-club-data"
    },
    confidence,
    readiness,
    decisionState: blockers.length > 0 ? "HOLD" : "READY FOR REVIEW",
    primaryBlocker: blockers[0] ?? "No blocking approval gate is currently recorded.",
    blockers,
    known,
    assumptions,
    missing,
    whatWouldChangeDecision,
    liveSignals: signals.map((signal) => ({
      id: signal.id,
      title: signal.title.en,
      state: signal.state,
      materiality: signal.materiality,
      sourceName: signal.sourceName,
      sourceUrl: signal.sourceUrl
    })),
    updatedAt: (currentState.updated_at as string | undefined) ?? null,
    sourceMode: "live-engine"
  };
}
