export type WorkloadItem = {
  id: string;
  subjectLabel: string;
  estimatedMinutes: number;
  complexityScore: number;
  state: "planned" | "in-progress" | "blocked" | "done" | "cancelled";
  dueAt?: string | null;
};

export type CapacityWindow = {
  id: string;
  subjectLabel: string;
  availableMinutes: number;
  startsAt: string;
  endsAt: string;
};

export type OperationalPlanInput = {
  estimatedMinutes: number;
  taskCount: number;
  dependencyCount: number;
  teamCount: number;
  approvalCount: number;
  daysAvailable: number;
  externalParties: number;
  unknownInputs: number;
};

export type OperationalAssessment = {
  complexity: "Low" | "Medium" | "High" | "Very high";
  complexityScore: number;
  feasibility: "High" | "Medium" | "Low" | "Unknown";
  capacityUtilisation: number | null;
  reasons: string[];
  actions: string[];
};

export function calculateOperationalComplexity(input: OperationalPlanInput) {
  let score = 0;
  score += Math.min(25, Math.ceil(input.estimatedMinutes / 120) * 4);
  score += Math.min(15, input.taskCount * 1.5);
  score += Math.min(15, input.dependencyCount * 3);
  score += Math.min(12, Math.max(0, input.teamCount - 1) * 4);
  score += Math.min(12, input.approvalCount * 4);
  score += Math.min(10, input.externalParties * 3);
  score += Math.min(10, input.unknownInputs * 2);
  if (input.daysAvailable <= 3) score += 18;
  else if (input.daysAvailable <= 7) score += 10;
  else if (input.daysAvailable <= 14) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function assessOperationalCapacity({
  plan,
  workload,
  capacity
}: {
  plan: OperationalPlanInput;
  workload: WorkloadItem[];
  capacity: CapacityWindow[];
}): OperationalAssessment {
  const complexityScore = calculateOperationalComplexity(plan);
  const complexity: OperationalAssessment["complexity"] =
    complexityScore >= 80 ? "Very high" :
    complexityScore >= 60 ? "High" :
    complexityScore >= 35 ? "Medium" : "Low";

  const activeWorkload = workload
    .filter((item) => !["done","cancelled"].includes(item.state))
    .reduce((sum, item) => sum + item.estimatedMinutes, 0);
  const available = capacity.reduce((sum, item) => sum + item.availableMinutes, 0);
  const totalDemand = activeWorkload + plan.estimatedMinutes;
  const utilisation = available > 0 ? Math.round((totalDemand / available) * 100) : null;

  const reasons: string[] = [];
  if (plan.daysAvailable <= 7) reasons.push("Short execution window.");
  if (plan.dependencyCount >= 3) reasons.push("Multiple dependencies increase coordination risk.");
  if (plan.approvalCount >= 2) reasons.push("Several approval gates can become the critical path.");
  if (plan.externalParties >= 2) reasons.push("External parties reduce direct control over timing.");
  if (plan.unknownInputs >= 2) reasons.push("Important execution inputs are still unknown.");
  if (utilisation !== null && utilisation > 100) reasons.push("Known workload exceeds recorded capacity.");
  else if (utilisation !== null && utilisation >= 85) reasons.push("Recorded capacity is close to saturation.");
  if (utilisation === null) reasons.push("Capacity data is not connected yet.");

  let feasibility: OperationalAssessment["feasibility"] = "Unknown";
  if (utilisation !== null) {
    if (utilisation <= 80 && complexityScore < 70) feasibility = "High";
    else if (utilisation <= 100 && complexityScore < 85) feasibility = "Medium";
    else feasibility = "Low";
  }

  const actions: string[] = [];
  if (feasibility === "Low") {
    actions.push("Simplify scope to protect the deadline.");
    actions.push("Reallocate work from a lower-priority action.");
    actions.push("Consider external production or an alternative execution route.");
  } else if (feasibility === "Medium") {
    actions.push("Resolve the critical dependency before adding scope.");
    actions.push("Keep a reduced-scope fallback ready.");
  } else if (feasibility === "Unknown") {
    actions.push("Connect workload/capacity data before committing the full plan.");
  } else {
    actions.push("Current known capacity supports the proposed scope.");
  }

  return { complexity, complexityScore, feasibility, capacityUtilisation: utilisation, reasons, actions };
}
