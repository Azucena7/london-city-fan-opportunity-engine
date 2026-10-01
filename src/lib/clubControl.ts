import type { Player, Appearance } from "./clubStrategy";

export type ReviewKind = "operations" | "brand" | "rights" | "finance";
export type ControlSettings = { budget: number; minors: boolean; purposeAllowed: boolean; syntheticLikeness: boolean };
export const defaultControl: ControlSettings = { budget: 0, minors: false, purposeAllowed: true, syntheticLikeness: false };
export const demoPolicy = { id: "POLICY-DEMO-1", version: 1, start: "2026-07-01", end: "2027-06-30", source: "Synthetic club policy · not legal advice", aiProvider: "none", privateDataAllowed: false };
export type Review = { kind: ReviewKind; version: string; reviewer: string; evidence: string; at: string };
export type ControlEvent = { id: number; at: string; action: string; event: string; version: string; actor: string; evidence: string };
export const reviewers: Record<ReviewKind, string> = { operations: "ticketing", brand: "communications", rights: "compliance", finance: "finance" };
export const evidenceIds: Record<ReviewKind, string> = { operations: "EVIDENCE-DEMO-AUDIENCE", brand: "EVIDENCE-DEMO-BRAND", rights: "EVIDENCE-DEMO-RIGHTS", finance: "EVIDENCE-DEMO-BUDGET" };
export function requiredReviews(settings: ControlSettings): ReviewKind[] {
  return settings.budget > 0 ? ["operations", "brand", "rights", "finance"] : ["operations", "brand", "rights"];
}
export function attestReview(kind: ReviewKind, version: string, owner: string, reviewer: string, evidence: string, role: string, at: string): Review | null {
  if (role !== "approver" || !owner || reviewer === owner || reviewer !== reviewers[kind] || evidence !== evidenceIds[kind] || !version) return null;
  return { kind, version, reviewer, evidence, at };
}
export function controlBlockers(settings: ControlSettings, date: string, paused: boolean, version: string, reviews: Review[], owner: string, hasCreative: boolean): string[] {
  const reasons: string[] = [];
  if (paused) reasons.push("paused");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date || date < demoPolicy.start || date > demoPolicy.end) reasons.push("policy");
  if (!Number.isFinite(settings.budget) || settings.budget < 0) reasons.push("budget");
  if (!settings.purposeAllowed) reasons.push("purpose");
  if (settings.minors) reasons.push("minors");
  if (settings.syntheticLikeness) reasons.push("likeness");
  if (!hasCreative) reasons.push("creative");
  for (const kind of requiredReviews(settings)) {
    if (!reviews.some((r) => r.kind === kind && r.version === version && r.reviewer !== owner && r.reviewer === reviewers[kind] && r.evidence === evidenceIds[kind])) reasons.push(kind);
  }
  return reasons;
}
// Revalidate the existing reservation; do not attempt to reserve again (would cause a collision).
export function talentLaunchBlockers(player: Player | undefined, talentSelected: boolean, appearances: Appearance[], date: string, channel: string, territory: string, budget: number): string[] {
  if (!talentSelected) return [];
  if (!player) return ["talent"];
  const reservation = appearances.find((a) => a.playerId === player.id && a.date === date && a.status === "reserved" && a.channel === "club-social" && a.territory === territory);
  const reasons: string[] = [];
  if (!reservation) reasons.push("reservation");
  if (!player.signed || !player.validated || !player.document) reasons.push("agreement");
  if (date < player.start || date > player.end || !player.confirmedDates.includes(date)) reasons.push("dates");
  if (!["instagram", "linkedin"].includes(channel) || !player.channels.includes("club-social")) reasons.push("channel");
  if (!player.territories.includes(territory)) reasons.push("territory");
  if (reservation && player.blockedCategories.includes(reservation.category)) reasons.push("conflict");
  const used = appearances.filter((a) => a.playerId === player.id && a.status !== "cancelled" && a.date >= player.start && a.date <= player.end).length;
  if (player.quota === null || used > player.quota) reasons.push("quota");
  if (!Number.isFinite(budget) || budget < player.fee) reasons.push("talentBudget");
  return reasons;
}
