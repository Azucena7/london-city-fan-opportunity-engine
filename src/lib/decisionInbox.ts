// Home's decision inbox: tabs, search and filters over the alerts the decision queue already
// produced. Nothing here re-ranks or re-scores; it only narrows the list the person sees.

export type InboxPriority = "blocked" | "act-now" | "review" | "monitor" | "on-track";

export type InboxItem = {
  id: string;
  category: string;
  priority: InboxPriority;
  title: string;
  recommendation: string;
  why: string;
  changed: string;
  owner?: string;
  onHold?: boolean;
};

export type InboxTab = "all" | "act-now" | "review" | "blocked";

export type InboxFilter = {
  tab: InboxTab;
  query: string;
  category: string;
  owner: string;
};

export const emptyInboxFilter: InboxFilter = { tab: "all", query: "", category: "", owner: "" };

/** Blocked covers both a blocked priority and a decision on hold: either way something stands first. */
function inTab(item: InboxItem, tab: InboxTab) {
  if (tab === "all") return true;
  if (tab === "blocked") return item.priority === "blocked" || Boolean(item.onHold);
  return item.priority === tab;
}

export function inboxCounts(items: InboxItem[]): Record<InboxTab, number> {
  return {
    all: items.length,
    "act-now": items.filter((item) => inTab(item, "act-now")).length,
    review: items.filter((item) => inTab(item, "review")).length,
    blocked: items.filter((item) => inTab(item, "blocked")).length
  };
}

export function filterInbox<T extends InboxItem>(items: T[], filter: InboxFilter): T[] {
  const terms = filter.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (!inTab(item, filter.tab)) return false;
    if (filter.category && item.category !== filter.category) return false;
    if (filter.owner && item.owner !== filter.owner) return false;
    if (!terms.length) return true;
    const text = [item.title, item.recommendation, item.why, item.changed, item.owner ?? "", item.category].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

/** The distinct values a filter can offer, in first-seen order so they follow the queue's ranking. */
export function inboxOptions(items: InboxItem[], key: "category" | "owner") {
  return Array.from(new Set(items.map((item) => item[key]).filter((value): value is string => Boolean(value))));
}

export function isFiltered(filter: InboxFilter) {
  return filter.tab !== "all" || Boolean(filter.query.trim() || filter.category || filter.owner);
}
