import Link from "next/link";
import type { CalendarFixture, NewsRadarConfig, NewsRadarData } from "@/lib/models";
import { WorkspaceCard, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./NewsRadarPanel.module.css";

const SHOWN = 8;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
}

/** Unreviewed public headlines from the configured news searches, tagged by topic and fixture. */
export function NewsRadarPanel({ radar, config, calendar }: { radar: NewsRadarData; config: NewsRadarConfig; calendar: CalendarFixture[] }) {
  const topicLabel = new Map(config.topics.map((topic) => [topic.id, topic.label]));
  const fixtureById = new Map(calendar.map((fixture) => [fixture.id, fixture]));
  const items = radar.items.slice(0, SHOWN);
  const topicCounts = config.topics
    .map((topic) => ({ ...topic, count: radar.items.filter((item) => item.topics.includes(topic.id)).length }))
    .filter((topic) => topic.count > 0);

  return (
    <WorkspaceCard className={styles.panel}>
      <WorkspaceSectionHeader
        eyebrow="News radar"
        title={`Unreviewed headlines · last ${config.retentionDays} days`}
        action={<span className={styles.checked}>{radar.checkedAt ? "Checked " + formatDate(radar.checkedAt) : "Not run yet"}</span>}
      />
      <p className={styles.rule}>Headlines are context to review. They never change a score, confidence or rank.</p>

      {topicCounts.length ? (
        <ul className={styles.topics} aria-label="Headlines by topic">
          {topicCounts.map((topic) => <li key={topic.id}>{topic.label} <b>{topic.count}</b></li>)}
        </ul>
      ) : null}

      {items.length ? (
        <ol className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
              <small>
                {[item.outlet, formatDate(item.publishedAt)].filter(Boolean).join(" · ")}
                {item.topics.map((topic) => <span key={topic} className={styles.tag}>{topicLabel.get(topic) ?? topic}</span>)}
                {item.fixtureIds.map((id) => {
                  const fixture = fixtureById.get(id);
                  if (!fixture) return null;
                  const label = "v " + fixture.opponent;
                  return fixture.homeAway === "home"
                    ? <Link key={id} className={styles.fixtureLink} href={"/app/matches/" + id}><span className={styles.fixture}>{label}</span></Link>
                    : <span key={id} className={styles.fixture}>{label}</span>;
                })}
              </small>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>
          {radar.lastSuccessfulAt
            ? `No headlines matched the ${config.feeds.length} searches in the last ${config.retentionDays} days.`
            : "No headlines collected yet. The radar runs with the next daily data refresh."}
        </p>
      )}

      {radar.failures.length ? <p className={styles.empty}>{radar.failures.length} of {config.feeds.length} searches failed on the last check.</p> : null}
      <p className={styles.searches}>Watching: {config.feeds.map((feed) => feed.label).join(" · ")}</p>
    </WorkspaceCard>
  );
}
