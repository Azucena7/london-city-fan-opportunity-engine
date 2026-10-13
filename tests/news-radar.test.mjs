import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classify, feedUrl, mergeHeadlines, opponentAliases, parseRss, upcomingFixtures } from "../scripts/lib/news-radar.mjs";

const config = JSON.parse(readFileSync("data/seed/news-radar.json", "utf8"));
const rss = `<?xml version="1.0"?><rss><channel>
<item><title>London City Lionesses sell out ahead of Everton clash - BBC Sport</title><link>https://news.google.com/rss/articles/a1</link><pubDate>Mon, 12 Oct 2026 09:00:00 GMT</pubDate><source url="https://www.bbc.co.uk">BBC Sport</source></item>
<item><title><![CDATA[Alexia Putellas &amp; London City: new sponsor partnership]]></title><link>https://news.google.com/rss/articles/a2</link><pubDate>Sun, 11 Oct 2026 18:30:00 GMT</pubDate><source url="https://as.com">AS</source></item>
<item><title>No date headline</title><link>https://news.google.com/rss/articles/a3</link></item>
</channel></rss>`;
const fixtures = [
  { id: "2026-10-18-eve-h", date: "2026-10-18", opponent: "Everton", homeAway: "home", status: "scheduled" },
  { id: "2026-11-01-mci-a", date: "2026-11-01", opponent: "Manchester City", homeAway: "away", status: "scheduled" },
  { id: "2026-11-08-mun-a", date: "2026-11-08", opponent: "Manchester United", homeAway: "away", status: "scheduled" },
  { id: "2026-09-01-ars-h", date: "2026-09-01", opponent: "Arsenal", homeAway: "home", status: "final" }
];

test("builds a Google News search URL for the configured market", () => {
  const url = new URL(feedUrl({ query: "\"London City Lionesses\"", language: "en-GB", country: "GB" }));
  assert.equal(url.hostname, "news.google.com");
  assert.equal(url.searchParams.get("q"), "\"London City Lionesses\"");
  assert.equal(url.searchParams.get("ceid"), "GB:en");
});

test("parses RSS items, strips the outlet suffix and drops undated items", () => {
  const items = parseRss(rss);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, "London City Lionesses sell out ahead of Everton clash");
  assert.equal(items[0].outlet, "BBC Sport");
  assert.equal(items[0].publishedAt, "2026-10-12T09:00:00.000Z");
  assert.equal(items[1].title, "Alexia Putellas & London City: new sponsor partnership");
});

test("tags topics and upcoming fixtures without ambiguous short names", () => {
  const upcoming = upcomingFixtures(fixtures, "2026-10-13", 45);
  assert.deepEqual(upcoming.map((fixture) => fixture.id), ["2026-10-18-eve-h", "2026-11-01-mci-a", "2026-11-08-mun-a"]);
  const aliases = opponentAliases(upcoming.map((fixture) => fixture.opponent));
  assert.deepEqual(aliases.get("Manchester City"), ["Manchester City"], "Manchester is shared, so it is not an alias");

  const [sellOut, sponsor] = parseRss(rss).map((item) => classify(item, config, upcoming));
  assert.deepEqual(sellOut.topics, ["ticketing"]);
  assert.deepEqual(sellOut.fixtureIds, ["2026-10-18-eve-h"]);
  assert.deepEqual(sponsor.topics, ["commercial"]);
  assert.deepEqual(sponsor.fixtureIds, []);
  const manchester = classify({ title: "Manchester derby preview" }, config, upcoming);
  assert.deepEqual(manchester.fixtureIds, []);
});

test("merges repeat headlines, keeps first sighting and drops old ones", () => {
  const now = "2026-10-13T06:00:00.000Z";
  const first = mergeHeadlines([], parseRss(rss).map((item) => ({ ...item, feedIds: ["club-uk"], topics: [], fixtureIds: [] })), now, config);
  assert.equal(first.length, 2);
  assert.match(first[0].id, /^news-[0-9a-f]{12}$/);
  const again = mergeHeadlines(first, [{ ...parseRss(rss)[0], feedIds: ["club-alt-uk"], topics: [], fixtureIds: [] }], "2026-10-14T06:00:00.000Z", config);
  assert.equal(again.length, 2);
  assert.equal(again[0].firstSeenAt, now);
  assert.deepEqual(again[0].feedIds, ["club-uk", "club-alt-uk"]);
  const later = mergeHeadlines(again, [], "2026-11-20T06:00:00.000Z", config);
  assert.equal(later.length, 0, "headlines older than the retention window are dropped");
});

test("the radar is configured, wired into the daily refresh and never writes signals", () => {
  assert.ok(config.feeds.length > 0 && config.topics.length > 0);
  assert.ok(config.feeds.every((feed) => feed.id && feed.query && /^[a-z]{2}(-[A-Z]{2})?$/.test(feed.language) && /^[A-Z]{2}$/.test(feed.country)));
  const workflow = readFileSync(".github/workflows/daily-data-refresh.yml", "utf8");
  assert.match(workflow, /npm run refresh:news-radar/);
  assert.match(workflow, /git add [^\n]*data\/live\/news-radar\.json/);
  const script = readFileSync("scripts/refresh-news-radar.mjs", "utf8");
  assert.doesNotMatch(script, /signals\.json/);
});
