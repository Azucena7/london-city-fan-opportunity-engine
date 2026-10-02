import type { Action, Plan } from "./clubOperations";

function inputs(action:Action): string {
  return JSON.stringify({ title:action.title, reason:action.reason, audience:action.audience, kpi:action.kpi, sources:action.sources, evidence:action.contextEvidence ?? [], tasks:action.tasks.map(task=>({id:task.id,title:task.title,offset:task.offset})) });
}
export function proposalChanges(current:Plan|null, proposed:Plan) {
  const oldActions = new Map(current?.actions.map(action=>[action.id,action]) ?? []);
  const newIds = new Set(proposed.actions.map(action=>action.id));
  const fixtureChanged = Boolean(current && (current.date!==proposed.date || current.kickoff!==proposed.kickoff || current.fixtureId!==proposed.fixtureId || current.timeZone!==proposed.timeZone));
  const added:Action[] = [];
  const updated:Action[] = [];
  const unchanged:Action[] = [];
  for (const action of proposed.actions) {
    const old = oldActions.get(action.id);
    if (!old) added.push(action);
    else if (fixtureChanged || inputs(old)!==inputs(action)) updated.push(action);
    else unchanged.push(action);
  }
  const oldSignals = new Map(current?.signalSnapshot?.map(signal=>[signal.id,signal.state]) ?? []);
  const signals = (proposed.signalSnapshot ?? []).filter(signal=>current && oldSignals.get(signal.id)!==signal.state).map(signal=>({id:signal.id,before:oldSignals.get(signal.id),after:signal.state}));
  return { added, updated, unchanged, removed:current?.actions.filter(action=>!newIds.has(action.id)) ?? [], fixtureChanged, signals, taskDifference:proposed.actions.reduce((n,a)=>n+a.tasks.length,0)-(current?.actions.reduce((n,a)=>n+a.tasks.length,0) ?? 0) };
}
