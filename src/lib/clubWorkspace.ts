export type ClubGoal = "repeat" | "attendance" | "revenue";
export type DemoRole = "operator" | "approver" | "viewer";
export type ClubDemoProfile = { goal: ClubGoal; planningDays: number; ownerAssigned: boolean; measurementAgreed: boolean };
export type ClubDemoAggregates = {
  synthetic: true;
  fixtureId: string;
  ticketsSold: number;
  scans: number;
  revenue: number;
  repeatEligible: number;
  repeatPurchased: number;
};

export const clubDemoDefaults: ClubDemoProfile = { goal: "repeat", planningDays: 7, ownerAssigned: false, measurementAgreed: false };
export const clubDemoExample: ClubDemoAggregates = { synthetic: true, fixtureId: "2026-09-26-bha-h", ticketsSold: 1000, scans: 800, revenue: 12000, repeatEligible: 120, repeatPurchased: 30 };

export function validateClubDemoData(data: ClubDemoAggregates): string[] {
  const errors: string[] = [];
  if (data.synthetic !== true) errors.push("synthetic-only");
  if (data.fixtureId !== "2026-09-26-bha-h") errors.push("fixture");
  const counts = [data.ticketsSold, data.scans, data.repeatEligible, data.repeatPurchased];
  if (counts.some((value) => !Number.isSafeInteger(value) || value < 0)) errors.push("counts");
  if (!Number.isFinite(data.revenue) || data.revenue < 0) errors.push("revenue");
  if (data.scans > data.ticketsSold) errors.push("scans");
  if (data.repeatPurchased > data.repeatEligible) errors.push("repeat");
  return errors;
}

export function clubDemoMetrics(data: ClubDemoAggregates | null) {
  if (!data || validateClubDemoData(data).length) return null;
  return { ...data, scanRate: data.ticketsSold > 0 ? data.scans / data.ticketsSold : null, repeatRate: data.repeatEligible > 0 ? data.repeatPurchased / data.repeatEligible : null };
}

export function canApproveClubDemo(profile: ClubDemoProfile, data: ClubDemoAggregates | null, role: DemoRole) {
  return role === "approver" && ["repeat", "attendance", "revenue"].includes(profile.goal) && [3, 7, 14].includes(profile.planningDays) && profile.ownerAssigned && profile.measurementAgreed && Boolean(data && validateClubDemoData(data).length === 0);
}

export function clubDemoVersion(profile: ClubDemoProfile, data: ClubDemoAggregates | null) {
  return JSON.stringify({ profile, data });
}
