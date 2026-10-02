import { actionVersion } from "./clubOperations";
import type { Action, Plan, SourceId, SourceState } from "./clubOperations";
import type { CreativePackages } from "./clubCreativePackages";
import { proposalChanges } from "./clubProposalChanges";

export function rebaseActionCreatives(packages:CreativePackages, action:Action, date:string, sources:Record<SourceId,SourceState>):CreativePackages {
  return Object.fromEntries(Object.entries(packages).map(([key,entry])=>[key,entry?.actionId===action.id ? { ...entry, actionVersion:actionVersion(action,date,sources), approvedVersion:null } : entry]));
}

/** Keep operational work only within the same fixture and club context. */
export function recalculatePlan(current:Plan|null, proposed:Plan, packages:CreativePackages, sources:Record<SourceId,SourceState>) {
  const sameFixture = Boolean(current && current.fixtureId===proposed.fixtureId && current.timeZone===proposed.timeZone);
  const previous = sameFixture ? current : null;
  const delta = proposalChanges(previous,proposed);
  const unchanged = new Set(delta.unchanged.filter(action=>previous?.actions.find(old=>old.id===action.id)?.strategyVersion===action.strategyVersion).map(action=>action.id));
  const plan:Plan = { ...proposed, actions:proposed.actions.map(action=>{
    const old = previous?.actions.find(item=>item.id===action.id);
    if (!old) return action;
    if (unchanged.has(action.id)) return old;
    return { ...action, owner:old.owner, tasks:action.tasks.map(task=>{
      const prior = old.tasks.find(item=>item.id===task.id);
      if (!prior) return task;
      const sameTask = !delta.fixtureChanged && JSON.stringify([prior.title,prior.department,prior.offset])===JSON.stringify([task.title,task.department,task.offset]);
      return { ...task, owner:prior.owner, done:sameTask && prior.done };
    }), approvedVersion:null, simulatedVersion:null };
  }) };
  const creatives:CreativePackages = {};
  if (previous) for (const [key,creative] of Object.entries(packages)) {
    if (!creative) continue;
    const action = plan.actions.find(item=>item.id===creative.actionId);
    if (!action) continue;
    const nextVersion = actionVersion(action,plan.date,sources);
    creatives[key] = unchanged.has(action.id) && creative.actionVersion===nextVersion ? creative : { ...creative, actionVersion:nextVersion, approvedVersion:null };
  }
  return { plan, creatives, unchangedIds:[...unchanged], delta };
}
