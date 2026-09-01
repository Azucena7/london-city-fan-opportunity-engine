import type { Decision } from "./models";

export function planningScore(input: {
  territory: number;
  calendar: number;
  attentionAvailability: number;
  fixtureAppeal: number;
}) {
  return Math.round(
    input.territory * 0.35 +
    input.calendar * 0.25 +
    input.attentionAvailability * 0.2 +
    input.fixtureAppeal * 0.2
  );
}

export function liveScore(input: {
  territory: number;
  calendar: number;
  attentionAvailability: number;
  fixtureAppeal: number;
  weather: number;
  attendanceMomentum: number;
}) {
  return Math.round(
    input.territory * 0.30 +
    input.calendar * 0.20 +
    input.attentionAvailability * 0.15 +
    input.fixtureAppeal * 0.10 +
    input.weather * 0.10 +
    input.attendanceMomentum * 0.15
  );
}

export function decisionFromScore(score: number): Decision {
  if (score >= 85) return "ATTACK HARD";
  if (score >= 72) return "ATTACK";
  if (score >= 58) return "TEST / SELECTIVE";
  return "DEFEND CORE";
}
