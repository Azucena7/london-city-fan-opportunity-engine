import type { Action, Plan } from "./clubOperations";

// Workflow labels describe a synthetic rehearsal, never real delivery.
export function rehearsalStage(action: Action, version: string) {
  if (action.simulatedVersion === version) return "simulated";
  if (action.approvedVersion === version) return "approved";
  if (!action.owner || !action.audienceReviewed || !action.measurement) return "preparing";
  return "review";
}

export function visibleTasks(plan: Plan, owner: string, status: string, actionId = "all", phase = "all") {
  return plan.actions.flatMap(action => action.tasks.map(task => ({ action, task })))
    .filter(({ action, task }) => (actionId === "all" || action.id === actionId) && (phase === "all" || (phase === "before" ? task.offset < 0 : phase === "matchday" ? task.offset === 0 : phase === "after" ? task.offset > 0 : false)))
    .filter(({ task }) => owner === "all" || (owner === "unassigned" ? !task.owner : task.owner === owner))
    .filter(({ task }) => status === "all" || (status === "done" ? task.done : !task.done))
    .sort((a, b) => a.task.offset - b.task.offset || a.task.id.localeCompare(b.task.id));
}

export function taskGroups(tasks: ReturnType<typeof visibleTasks>) {
  const groups = new Map<number, typeof tasks>();
  for (const entry of tasks) {
    const group = groups.get(entry.task.offset) ?? [];
    group.push(entry);
    groups.set(entry.task.offset, group);
  }
  return [...groups].sort(([a], [b]) => a - b).map(([offset, entries]) => ({ offset, entries }));
}

export function actionTaskProgress(action: Action) {
  return { total: action.tasks.length, done: action.tasks.filter(t => t.done).length, unassigned: action.tasks.filter(t => !t.owner).length,
    firstOffset: action.tasks.length ? Math.min(...action.tasks.map(t => t.offset)) : null,
    lastOffset: action.tasks.length ? Math.max(...action.tasks.map(t => t.offset)) : null };
}
