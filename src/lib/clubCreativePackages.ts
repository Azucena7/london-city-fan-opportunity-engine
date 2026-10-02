import type { Action, Channel, Creative } from "./clubOperations";

export type CreativePackages = Partial<Record<string, Creative>>;
const key = (id: Action["id"], channel: Channel) => `${id}:${channel}`;
export function findCreative(packages: CreativePackages, id: Action["id"], channel: Channel): Creative | null {
  const creative = packages[key(id, channel)];
  return creative?.actionId === id && creative.channel === channel ? creative : null;
}
export function storeCreative(packages: CreativePackages, id: Action["id"], channel: Channel, creative: Creative | null): CreativePackages {
  if (creative && (creative.actionId !== id || creative.channel !== channel)) return packages;
  const next = { ...packages };
  if (creative) next[key(id, channel)] = creative;
  else delete next[key(id, channel)];
  return next;
}
export function clearActionCreatives(packages: CreativePackages, id: Action["id"]): CreativePackages {
  return Object.fromEntries(Object.entries(packages).filter(([k]) => !k.startsWith(`${id}:`)));
}
