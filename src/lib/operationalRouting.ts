export type OperationalHandoffSuggestion = {
  requestType: "player" | "sponsor-activation" | "representation" | "operations";
  stage: "heads-up" | "formal-request";
  recipientRole: string;
  title: string;
  hint: string;
  subject: string;
  urgency: "now" | "soon" | "plan";
  reason: string;
  ruleId: string;
};

function urgency(daysToFixture: number) {
  if (daysToFixture <= 7) return "now" as const;
  if (daysToFixture <= 21) return "soon" as const;
  return "plan" as const;
}

export function buildOperationalHandoffSuggestions({
  fixtureLabel,
  recommendation,
  daysToFixture,
  activationText,
  approvalText
}: {
  fixtureLabel: string;
  recommendation: string;
  daysToFixture: number;
  activationText: string;
  approvalText: string;
}): OperationalHandoffSuggestion[] {
  const text = [recommendation, activationText, approvalText].join(" ");
  const suggestions: OperationalHandoffSuggestion[] = [];
  const timing = urgency(daysToFixture);

  if (/player|player-led|appearance|talent|jugadora|jugadoras/i.test(text)) {
    suggestions.push({
      requestType: "player",
      stage: "heads-up",
      recipientRole: "Team Manager",
      title: "Player heads-up",
      hint: "Warn Team Manager before a formal player request is needed.",
      subject: `Possible player requirement · ${fixtureLabel}`,
      urgency: timing,
      reason: "The current recommendation or approval path includes player usage.",
      ruleId: "player-usage"
    });
  }

  if (/sponsor|partner|commercial partner|requires-partner|activation/i.test(text)) {
    suggestions.push({
      requestType: "sponsor-activation",
      stage: "formal-request",
      recipientRole: "Activation Manager",
      title: "Sponsor activation",
      hint: "Hand the recommended activation to the sponsor execution owner.",
      subject: `Activation requirement · ${fixtureLabel}`,
      urgency: timing,
      reason: "The current plan depends on a sponsor, partner or partner-owned activation.",
      ruleId: "partner-dependency"
    });
  }

  if (/hospitality|vip|protocol|ceremony|launch event|partner event|representation|executive attendance/i.test(text)) {
    suggestions.push({
      requestType: "representation",
      stage: "heads-up",
      recipientRole: "Secretary / Protocol",
      title: "Club representation",
      hint: "Pre-alert agenda/protocol that club representation may be required.",
      subject: `Possible club representation · ${fixtureLabel}`,
      urgency: timing,
      reason: "The action contains an event, hospitality or representation dependency.",
      ruleId: "club-representation"
    });
  }

  if (/shoot|production|venue|fanzone|logistics|matchday service|on-site|meeting point/i.test(text)) {
    suggestions.push({
      requestType: "operations",
      stage: "heads-up",
      recipientRole: "Operations",
      title: "Operations heads-up",
      hint: "Flag venue, production or logistics requirements before the execution window tightens.",
      subject: `Possible operational requirement · ${fixtureLabel}`,
      urgency: timing,
      reason: "The current plan contains a venue, production or logistics dependency.",
      ruleId: "operational-dependency"
    });
  }

  return suggestions;
}
