// The generic work-system webhook: the contract between AVELA and whatever runs the club's
// work (Asana, Monday, Jira, Planner — directly or through Zapier, Make or n8n). AVELA sends an
// approved package once; the tool answers with the state of each task. AVELA never edits tasks:
// the external tool stays the source of truth, and AVELA only reads its status back.

export type WorkItemCategory = "approval" | "activation" | "schedule";
export type ExternalItemState = "created" | "in-progress" | "blocked" | "done";

export type DispatchItem = { key: string; category: WorkItemCategory; title?: string };

export type DispatchPayload = {
  version: "1";
  idempotencyKey: string;
  clubId: string;
  decisionId: string;
  package: { key: string; title: string; items: DispatchItem[] };
  callbackUrl: string;
  sentAt: string;
};

export type CallbackItem = {
  key: string;
  externalRef: string;
  url: string | null;
  state: ExternalItemState;
  assignee: string | null;
  dueAt: string | null;
  blocker: string | null;
};

export type ParsedCallback = {
  idempotencyKey: string;
  packageRef: string | null;
  packageUrl: string | null;
  items: CallbackItem[];
};

const CATEGORIES = new Set(["approval", "activation", "schedule"]);
const STATES = new Set(["created", "in-progress", "blocked", "done"]);

/** One key per club, decision and package: resending the same package never creates new tasks. */
export function idempotencyKey(clubId: string, decisionId: string, packageKey: string) {
  return `${clubId}:${decisionId}:${packageKey}`;
}

export function splitIdempotencyKey(key: string) {
  const [clubId, decisionId, ...rest] = key.split(":");
  const packageKey = rest.join(":");
  return clubId && decisionId && packageKey ? { clubId, decisionId, packageKey } : null;
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function httpsUrl(value: unknown) {
  const candidate = text(value, 500);
  try {
    return candidate && new URL(candidate).protocol === "https:" ? candidate : null;
  } catch {
    return null;
  }
}

export function dispatchPayload(input: {
  clubId: string;
  decisionId: string;
  packageKey: string;
  title: string;
  items: Array<{ key?: unknown; category?: unknown; title?: unknown }>;
  callbackUrl: string;
  sentAt: string;
}): DispatchPayload | null {
  const items = input.items
    .map((item) => ({ key: text(item.key, 180), category: text(item.category, 40), title: text(item.title, 200) }))
    .filter((item): item is { key: string; category: WorkItemCategory; title: string } => Boolean(item.key) && CATEGORIES.has(item.category))
    .slice(0, 250)
    .map(({ key, category, title }) => (title ? { key, category, title } : { key, category }));
  if (!input.clubId || !input.decisionId || !input.packageKey || !input.title || !items.length) return null;
  return {
    version: "1",
    idempotencyKey: idempotencyKey(input.clubId, input.decisionId, input.packageKey),
    clubId: input.clubId,
    decisionId: input.decisionId,
    package: { key: input.packageKey, title: input.title, items },
    callbackUrl: input.callbackUrl,
    sentAt: input.sentAt
  };
}

/** Reads the tool's status callback; anything malformed is rejected rather than half-stored. */
export function parseCallback(body: unknown): ParsedCallback | { error: string } {
  if (!body || typeof body !== "object") return { error: "Body must be a JSON object." };
  const record = body as Record<string, unknown>;
  const key = text(record.idempotencyKey, 500);
  if (!splitIdempotencyKey(key)) return { error: "idempotencyKey is missing or malformed." };
  if (!Array.isArray(record.items) || !record.items.length) return { error: "items must list at least one task." };
  const items: CallbackItem[] = [];
  for (const raw of record.items.slice(0, 250)) {
    const item = (raw ?? {}) as Record<string, unknown>;
    const itemKey = text(item.key, 180);
    const externalRef = text(item.externalRef, 220);
    const state = text(item.state, 20);
    if (!itemKey || !externalRef || !STATES.has(state)) {
      return { error: "Each item needs key, externalRef and a state of created, in-progress, blocked or done." };
    }
    const dueAt = text(item.dueAt, 40);
    items.push({
      key: itemKey,
      externalRef,
      url: httpsUrl(item.url),
      state: state as ExternalItemState,
      assignee: text(item.assignee, 120) || null,
      dueAt: dueAt && !Number.isNaN(Date.parse(dueAt)) ? new Date(dueAt).toISOString() : null,
      blocker: text(item.blocker, 240) || null
    });
  }
  return {
    idempotencyKey: key,
    packageRef: text(record.packageRef, 220) || null,
    packageUrl: httpsUrl(record.packageUrl),
    items
  };
}

/**
 * Package counts from the latest known state of every task. Completion is what the tool reports:
 * done tasks over tasks sent, never an estimated percentage.
 */
export function packageProgress(itemCount: number, states: ExternalItemState[]) {
  const completed = states.filter((state) => state === "done").length;
  const blocked = states.filter((state) => state === "blocked").length;
  return {
    completed_count: Math.min(completed, itemCount),
    blocked_count: Math.min(blocked, itemCount),
    sync_state: states.length >= itemCount ? "synced" as const : "partial" as const
  };
}
