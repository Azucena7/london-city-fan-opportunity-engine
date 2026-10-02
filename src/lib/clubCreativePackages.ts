import type { Action, Channel, Creative } from "./clubOperations";

export type CreativePackages = Partial<Record<string, Creative>>;
const key = (id: Action["id"], channel: Channel) => `${id}:${channel}`;
// Keep SVG headline lines readable; never split a normal word between lines.
export function headlineLines(text: string, limit = 30): [string, string] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let first = "";
  while (words.length && `${first} ${words[0]}`.trim().length <= limit) first = `${first} ${words.shift()}`.trim();
  if (!first && words.length) first = `${words.shift()!.slice(0, limit - 1)}…`;
  let second = "";
  while (words.length && `${second} ${words[0]}`.trim().length <= limit - 1) second = `${second} ${words.shift()}`.trim();
  if (words.length) second = `${second}…`;
  return [first, second];
}
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
