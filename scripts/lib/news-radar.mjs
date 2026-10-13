// News radar: public Google News RSS searches, tagged by topic and upcoming fixture.
// Headlines are stored as unreviewed context (title, outlet, link, date) and never as signals.

import { createHash } from "node:crypto";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match)
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decode(match[1]) : null;
}

export function feedUrl(feed) {
  const [lang] = feed.language.split("-");
  const params = new URLSearchParams({ q: feed.query, hl: feed.language, gl: feed.country, ceid: `${feed.country}:${lang}` });
  return `https://news.google.com/rss/search?${params}`;
}

/** Parses RSS 2.0 items into headline records. Google News appends " - Outlet" to titles. */
export function parseRss(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([, block]) => {
    const outlet = tag(block, "source");
    let title = tag(block, "title") ?? "";
    if (outlet && title.endsWith(` - ${outlet}`)) title = title.slice(0, -(outlet.length + 3));
    const published = tag(block, "pubDate");
    const publishedAt = published && !Number.isNaN(Date.parse(published)) ? new Date(published).toISOString() : null;
    return { title, outlet, url: tag(block, "link"), publishedAt };
  }).filter((item) => item.title && item.url && item.publishedAt);
}

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentions(text, phrase) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escape(phrase)}($|[^\\p{L}\\p{N}])`, "iu").test(text);
}

/** Opponent names to look for: the full name, plus the first word when it is distinctive. */
export function opponentAliases(opponents) {
  const firstWords = opponents.map((name) => name.split(/\s+/)[0]);
  return new Map(opponents.map((name) => {
    const first = name.split(/\s+/)[0];
    const distinctive = first !== name && first.length >= 5 && firstWords.filter((word) => word === first).length === 1 && first !== "London";
    return [name, distinctive ? [name, first] : [name]];
  }));
}

/** Upcoming fixtures in the window, the nearest one per opponent. */
export function upcomingFixtures(calendar, today, windowDays) {
  const end = new Date(`${today}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + windowDays);
  const until = end.toISOString().slice(0, 10);
  const nearest = new Map();
  for (const fixture of calendar) {
    if (fixture.status !== "scheduled" || fixture.date < today || fixture.date > until) continue;
    if (!nearest.has(fixture.opponent) || nearest.get(fixture.opponent).date > fixture.date) nearest.set(fixture.opponent, fixture);
  }
  return [...nearest.values()];
}

export function classify(item, config, fixtures) {
  const aliases = opponentAliases(fixtures.map((fixture) => fixture.opponent));
  return {
    ...item,
    topics: config.topics.filter((topic) => topic.keywords.some((keyword) => mentions(item.title, keyword))).map((topic) => topic.id),
    fixtureIds: fixtures.filter((fixture) => aliases.get(fixture.opponent).some((alias) => mentions(item.title, alias))).map((fixture) => fixture.id)
  };
}

function key(item) {
  return `${item.title.toLowerCase().replace(/\s+/g, " ")}|${(item.outlet ?? "").toLowerCase()}`;
}

/**
 * Merges fresh headlines into the stored list: keeps the first time each headline was seen and
 * the feeds that found it, drops excluded outlets and items older than the retention window,
 * newest first. Exclusions also remove headlines stored before the outlet was excluded, and a
 * headline found only by a search that is no longer configured is dropped.
 */
export function mergeHeadlines(existing, incoming, now, config) {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - config.retentionDays);
  const excluded = new Set((config.excludeOutlets ?? []).map((outlet) => outlet.toLowerCase()));
  const feeds = new Set(config.feeds.map((feed) => feed.id));
  const byKey = new Map(existing.map((item) => [key(item), item]));
  for (const item of incoming) {
    const previous = byKey.get(key(item));
    byKey.set(key(item), {
      ...item,
      id: previous?.id ?? `news-${createHash("sha1").update(key(item)).digest("hex").slice(0, 12)}`,
      feedIds: [...new Set([...(previous?.feedIds ?? []), ...item.feedIds])],
      firstSeenAt: previous?.firstSeenAt ?? now
    });
  }
  return [...byKey.values()]
    .filter((item) => item.publishedAt >= cutoff.toISOString())
    .filter((item) => !excluded.has((item.outlet ?? "").toLowerCase()))
    .map((item) => ({ ...item, feedIds: item.feedIds.filter((id) => feeds.has(id)) }))
    .filter((item) => item.feedIds.length > 0)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, config.maxItems);
}
