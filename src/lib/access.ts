export function accessScore(input: {
  duration: number;
  changes: number;
  walkingMinutes: number;
  disruptions: number;
}) {
  let score = 100;

  // Family-oriented friction heuristic.
  if (input.duration > 25) score -= Math.min(35, (input.duration - 25) * 1.15);
  score -= input.changes * 9;
  if (input.walkingMinutes > 12) {
    score -= Math.min(18, (input.walkingMinutes - 12) * 0.8);
  }
  score -= Math.min(25, input.disruptions * 12);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function accessLabel(score: number) {
  if (score >= 85) return "LOW FRICTION";
  if (score >= 70) return "GOOD";
  if (score >= 55) return "MANAGEABLE";
  return "HIGH FRICTION";
}
