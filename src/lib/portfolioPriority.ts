export type PortfolioCandidateInput = {
  id: string;
  label: string;
  opportunityScore: number | null;
  daysToFixture: number;
  unresolvedApprovals: number;
  estimatedMinutes: number;
};

export type PortfolioCandidate = PortfolioCandidateInput & {
  priorityScore: number;
  urgencyScore: number;
  blockerPressure: number;
  priorityLabel: "Protect" | "Prioritise" | "Review";
};

function urgencyScore(daysToFixture: number) {
  if (daysToFixture <= 7) return 100;
  if (daysToFixture <= 14) return 80;
  if (daysToFixture <= 28) return 60;
  if (daysToFixture <= 42) return 40;
  return 20;
}

export function rankCampaignPortfolio(candidates: PortfolioCandidateInput[]): PortfolioCandidate[] {
  return candidates
    .map((candidate) => {
      const opportunity = candidate.opportunityScore ?? 50;
      const urgency = urgencyScore(candidate.daysToFixture);
      const blockerPressure = Math.min(100, candidate.unresolvedApprovals * 25);
      const priorityScore = Math.round(opportunity * 0.5 + urgency * 0.35 + blockerPressure * 0.15);
      const priorityLabel: PortfolioCandidate["priorityLabel"] =
        priorityScore >= 78 ? "Protect" :
        priorityScore >= 62 ? "Prioritise" : "Review";

      return {
        ...candidate,
        urgencyScore: urgency,
        blockerPressure,
        priorityScore,
        priorityLabel
      };
    })
    .sort((a,b) => b.priorityScore - a.priorityScore || a.daysToFixture - b.daysToFixture);
}

export type PortfolioCapacityAdvice = {
  state: "unknown" | "available" | "tight" | "overloaded";
  headline: string;
  actions: Array<{
    campaignId: string;
    action: "protect" | "simplify" | "defer" | "sequence";
    reason: string;
  }>;
  contractNote: string;
};

export function advisePortfolioCapacity({
  ranked,
  capacityState
}: {
  ranked: PortfolioCandidate[];
  capacityState: PortfolioCapacityAdvice["state"];
}): PortfolioCapacityAdvice {
  const contractNote = "Verified contractual obligation is not scored until contract data is connected and reviewed.";

  if (!ranked.length) {
    return { state: capacityState, headline: "No campaign portfolio is available to sequence.", actions: [], contractNote };
  }

  if (capacityState === "unknown") {
    return {
      state: capacityState,
      headline: "Priority is visible, but delivery sequencing is not reliable until workload and capacity are connected.",
      actions: ranked.slice(0,3).map((item) => ({
        campaignId: item.id,
        action: "sequence",
        reason: "Keep decision priority visible, but do not infer delivery capacity."
      })),
      contractNote
    };
  }

  if (capacityState === "overloaded") {
    return {
      state: capacityState,
      headline: "Recorded workload exceeds capacity. Protect the highest-value work and reduce simultaneous scope.",
      actions: ranked.slice(0,4).map((item,index) => ({
        campaignId: item.id,
        action: index === 0 ? "protect" : index === 1 ? "simplify" : "defer",
        reason:
          index === 0 ? "Highest combined opportunity, urgency and blocker pressure." :
          index === 1 ? "Keep the opportunity alive with a reduced-scope execution." :
          "Move lower-priority work unless a verified obligation changes the order."
      })),
      contractNote
    };
  }

  if (capacityState === "tight") {
    return {
      state: capacityState,
      headline: "Capacity is tight. Protect the top decision and keep a reduced-scope fallback for the next one.",
      actions: ranked.slice(0,4).map((item,index) => ({
        campaignId: item.id,
        action: index === 0 ? "protect" : index === 1 ? "simplify" : "sequence",
        reason:
          index === 0 ? "Highest current decision pressure." :
          index === 1 ? "Prepare a lower-effort fallback before adding scope." :
          "Sequence after higher-priority work unless circumstances change."
      })),
      contractNote
    };
  }

  return {
    state: capacityState,
    headline: "Recorded capacity supports the current priority order, subject to unresolved approvals and unknown contractual obligations.",
    actions: ranked.slice(0,4).map((item,index) => ({
      campaignId: item.id,
      action: index === 0 ? "protect" : "sequence",
      reason: index === 0 ? "Highest current decision pressure." : "Sequence behind the higher-priority campaign."
    })),
    contractNote
  };
}
