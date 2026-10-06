import Link from "next/link";
import sourceHealth from "../../data/live/source-health.json";
import styles from "./IntelligenceSources.module.css";

const sources = [
  {
    name: "Blinkfire",
    category: "Media · sponsorship · audience",
    healthIds: ["blinkfire"],
    summary: "Use published Blinkfire reports and case studies to demonstrate how media, audience and sponsorship outcomes could feed AVELA learning.",
    available: [
      "Published social and campaign performance examples",
      "Public sponsorship and audience reports",
      "Public case studies and benchmark commentary"
    ],
    connected: [
      "Reporting API access requires an active Blinkfire licence",
      "MCP / warehouse delivery also inherit Blinkfire account permissions",
      "Private club-level data is not accessed in this demo"
    ],
    href: "https://www.blinkfire.com/d/landing/resources"
  },
  {
    name: "Club ticketing / CRM",
    category: "Conversion · attendance · retention",
    healthIds: ["crm-ticketing"],
    summary: "Adds purchases, scans, repeat attendance, realised price and consent-safe cohort evidence.",
    available: ["Synthetic demo schema and aggregate measurement model"],
    connected: ["Real club data requires an authorised club integration"],
    href: "/app/setup"
  },
  {
    name: "Fixtures + public context",
    category: "Calendar · city · competition",
    healthIds: ["club-public-web", "open-meteo", "ticketmaster-events"],
    summary: "Provides the time anchor that starts monitoring and contextual signals around each home fixture.",
    available: ["Fixture calendar", "Public event context", "Competition overlap"],
    connected: ["Live public-signal layer"],
    href: "/app/matches"
  },
  {
    name: "Web analytics",
    category: "Traffic · response",
    healthIds: ["avela-web-analytics"],
    summary: "Provides aggregate website response and campaign landing behaviour where instrumentation is available.",
    available: ["Vercel Web Analytics on AVELA properties"],
    connected: ["Club-owned analytics remains a separate permissioned source"],
    href: "/"
  }
] as const;

type HealthSource = (typeof sourceHealth.sources)[number];
const healthById = new Map(sourceHealth.sources.map((source) => [source.id, source]));

function aggregateHealth(ids: readonly string[]) {
  const items = ids.map((id) => healthById.get(id)).filter((item): item is HealthSource => Boolean(item));
  const priority: Record<HealthSource["state"], number> = {
    blocked: 5,
    "not-configured": 4,
    "requires-access": 3,
    degraded: 2,
    operational: 1
  };
  const primary = [...items].sort((a, b) => priority[b.state] - priority[a.state])[0] ?? null;
  const className = primary?.state === "operational" ? "connected" : primary?.state === "degraded" ? "demo" : "locked";
  const label = primary?.state === "operational"
    ? "Operational"
    : primary?.state === "degraded"
      ? "Degraded"
      : primary?.state === "blocked"
        ? "Blocked"
        : primary?.state === "not-configured"
          ? "Not configured"
          : primary?.state === "requires-access"
            ? "Requires access"
            : "Unknown";
  const latest = items
    .map((item) => item.lastSuccessfulAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;
  return { items, primary, className, label, latest };
}

const blinkfireEvidence = [
  {
    label: "Campaign + game-day performance",
    value: "Engagement · impressions · views · media value",
    detail: "Blinkfire publicly describes campaign tracking inside its Social KPIs reporting, with game days and campaigns marked against daily performance."
  },
  {
    label: "Public case study",
    value: "CD Leganés × Ibai Llanos",
    detail: "Blinkfire publicly documents campaign measurement before, during and after the activation, including logo and social-performance tracking."
  },
  {
    label: "Public benchmark reports",
    value: "League + sponsorship benchmarking",
    detail: "Blinkfire publishes reports across major leagues with social, sponsorship and audience benchmarks that can be used only as public contextual evidence."
  }
] as const;

const nwslPublicBenchmark = [
  { club: "San Diego Wave FC", engagement: "5.2M", videoViews: "69.5M" },
  { club: "Kansas City Current", engagement: "5.0M", videoViews: "45.1M" },
  { club: "Washington Spirit", engagement: "3.4M", videoViews: "32.7M" }
] as const;

export function IntelligenceSources() {
  const sourceRows = sources.map((source) => ({ source, health: aggregateHealth(source.healthIds) }));
  const operational = sourceRows.filter((item) => item.health.primary?.state === "operational").length;
  const degraded = sourceRows.filter((item) => item.health.primary?.state === "degraded").length;
  const access = sourceRows.filter((item) => ["requires-access","not-configured","blocked"].includes(item.health.primary?.state ?? "")).length;
  const coverage = Math.round((operational / Math.max(1, sourceRows.length)) * 100);
  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span>Intelligence connectors</span>
          <h1>Make the club stack think together.</h1>
          <p>AVELA should not recreate specialist systems. It should turn their evidence into a fixture-level decision, then send measured outcomes back into the learning loop.</p>
        </div>
        <div className={styles.legend}>
          <span><i className={styles.connected} /> Connected</span>
          <span><i className={styles.demo} /> Public demo evidence</span>
          <span><i className={styles.locked} /> Requires access</span>
        </div>
      </header>

      <section className={styles.healthMap} aria-label="Source health overview">
        <div className={styles.coverageDial} style={{ background: `conic-gradient(#2F8F83 0 ${coverage}%, #E7EBED ${coverage}% 100%)` }}>
          <span>Operational coverage</span>
          <strong>{coverage}%</strong>
          <small>{operational} of {sourceRows.length} source groups operational</small>
        </div>
        <div className={styles.healthSummary}>
          <div data-state="operational"><span>Operational</span><strong>{operational}</strong><small>Decision evidence refreshing normally</small></div>
          <div data-state="degraded"><span>Degraded</span><strong>{degraded}</strong><small>Available with reduced confidence or freshness</small></div>
          <div data-state="access"><span>Needs access / setup</span><strong>{access}</strong><small>Private or unconfigured evidence</small></div>
        </div>
        <div className={styles.healthRows}>
          {sourceRows.map(({ source, health }) => (
            <article key={source.name} data-state={health.primary?.state ?? "unknown"}>
              <div><span>{source.category}</span><strong>{source.name}</strong></div>
              <b>{health.label}</b>
              <small>{health.latest ? "Last successful refresh " + new Date(health.latest).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : health.primary?.state === "requires-access" ? "Private evidence needs club permission" : health.primary?.state === "not-configured" ? "Connection not configured yet" : health.primary?.state === "blocked" ? "Evidence currently blocked" : "No recent refresh available"}</small>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.sourceList}>
        {sourceRows.map(({ source, health }) => {
          return (
          <article key={source.name} className={styles.source}>
            <div className={styles.sourceTop}>
              <div>
                <span>{source.category}</span>
                <h2>{source.name}</h2>
              </div>
              <strong className={styles[health.className]}>{health.label}</strong>
            </div>
            <p>{source.summary}</p>
            <div className={styles.healthMeta}>
              <span>Source health · {health.items.map((item) => item.id).join(" · ")}</span>
              <strong>{health.latest ? "Last successful " + new Date(health.latest).toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC" : health.primary?.state === "requires-access" ? "Club permission required before private evidence can improve this decision" : health.primary?.state === "not-configured" ? "Configure this source when the club is ready to use it" : health.primary?.state === "blocked" ? "Resolve the source blocker before relying on this evidence" : "No recent refresh available"}</strong>
              <small>{health.primary?.ownerAction?.en ?? health.primary?.note?.en ?? "No owner action required."}</small>
            </div>
            <div className={styles.columns}>
              <div>
                <span>What AVELA can use</span>
                <ul>{source.available.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <span>Access boundary</span>
                <ul>{source.connected.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
            {source.href.startsWith("http")
              ? <a href={source.href} target="_blank" rel="noreferrer">Open public source ↗</a>
              : <Link href={source.href}>Open related AVELA surface →</Link>}
          </article>
          );
        })}
      </div>

      <section className={styles.blinkfire}>
        <div className={styles.blinkfireIntro}>
          <span>Blinkfire · demo mode</span>
          <h2>Useful now as public evidence. More powerful later as a permissioned connector.</h2>
          <p>The current demo must never imply that AVELA can see a club&apos;s Blinkfire account. Public Blinkfire material can demonstrate the type of evidence AVELA would consume; licensed API or MCP access would unlock club-specific measurement.</p>
        </div>
        <div className={styles.evidenceGrid}>
          {blinkfireEvidence.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <div className={styles.publicBenchmark}>
          <div>
            <span>Public women&apos;s-football benchmark · 2025 NWSL regular season</span>
            <strong>Example evidence AVELA can use today without private account access.</strong>
            <small>Owned-and-operated social data published by Blinkfire for 14 Mar–2 Nov 2025. Context only; not a London City comparison or a current-season forecast.</small>
          </div>
          <div className={styles.benchmarkRows}>
            {nwslPublicBenchmark.map((row) => (
              <div key={row.club}>
                <strong>{row.club}</strong>
                <span>{row.engagement}<small>engagements</small></span>
                <span>{row.videoViews}<small>video views</small></span>
              </div>
            ))}
          </div>
          <a href="https://www.blinkfire.com/d/view_upload/2025-nwsl-report" target="_blank" rel="noreferrer">Open Blinkfire public NWSL report ↗</a>
        </div>
        <div className={styles.flow}>
          <span>AVELA opportunity</span><i>→</i>
          <span>Club activation</span><i>→</i>
          <strong>Blinkfire measurement</strong><i>→</i>
          <span>AVELA learning</span>
        </div>
      </section>

      <section className={styles.contract}>
        <span>Connector contract</span>
        <h2>What a real Blinkfire integration should ingest</h2>
        <div>
          <p><strong>Before activation</strong><br />Historical content performance, audience signals, sponsor/asset context and relevant benchmarks.</p>
          <p><strong>After activation</strong><br />Campaign engagement, impressions, views, branded exposure, media value and benchmark deltas.</p>
          <p><strong>AVELA rule</strong><br />Blinkfire evidence can change learning and confidence only when source, date, scope and permission state are explicit.</p>
        </div>
      </section>
    </section>
  );
}
