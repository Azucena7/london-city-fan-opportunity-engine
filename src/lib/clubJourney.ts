import type { Action, Plan } from "./clubOperations";

// Workflow labels describe a synthetic rehearsal, never real delivery.
export function rehearsalStage(action: Action, version: string) {
  if (action.simulatedVersion === version) return "simulated";
  if (action.approvedVersion === version) return "approved";
  if (!action.owner || !action.audienceReviewed || !action.measurement) return "preparing";
  return "review";
}

export function visibleTasks(plan: Plan, owner: string, status: string) {
  return plan.actions.flatMap(action => action.tasks.map(task => ({ action, task })))
    .filter(({ task }) => owner === "all" || (owner === "unassigned" ? !task.owner : task.owner === owner))
    .filter(({ task }) => status === "all" || (status === "done" ? task.done : !task.done))
    .sort((a, b) => a.task.offset - b.task.offset || a.task.id.localeCompare(b.task.id));
}
