export function planningScore(input: {
  territory: number;
  calendar: number;
  attentionAvailability: number;
  fixtureAppeal: number;
}) {
  const score =
    input.territory * 0.35 +
    input.calendar * 0.25 +
    input.attentionAvailability * 0.2 +
    input.fixtureAppeal * 0.2;

  return Math.round(score);
}

export function decisionFromScore(score: number) {
  if (score >= 85) return "ATTACK HARD";
  if (score >= 72) return "ATTACK";
  if (score >= 58) return "TEST / SELECTIVE";
  return "DEFEND CORE";
}
