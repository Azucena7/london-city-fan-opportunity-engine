import Link from "next/link";
import type { CrmTicketingFixtureAggregate, CrmTicketingOrigins } from "@/lib/models";
import styles from "./SupporterJourneyPanel.module.css";

// Season-ticket attendance, entry timing and where supporters travel from, for one played
// fixture, from the club's authorised aggregate. A suppressed or missing value is never a zero.

const BANDS: Array<[keyof NonNullable<CrmTicketingFixtureAggregate["entryTiming"]>, string]> = [
  ["more-than-60-before", "60+ min before"],
  ["60-to-30-before", "60–30 min"],
  ["30-to-0-before", "Last 30 min"],
  ["after-kickoff", "After kickoff"]
];

const count = (value: number | null | undefined) => (value === null ? "Under 10" : value === undefined ? "—" : value.toLocaleString("en-GB"));

function Origins({ title, origins }: { title: string; origins: CrmTicketingOrigins | null }) {
  if (!origins) return <div className={styles.block}><span>{title}</span><p>Not in the club export.</p></div>;
  return (
    <div className={styles.block}>
      <span>{title}</span>
      <ol className={styles.origins}>
        {origins.districts.map((item) => <li key={item.district}><b>{item.district}</b><small>{count(item.supporters)} supporters</small></li>)}
        <li><b>Other districts</b><small>{count(origins.otherSupporters)} supporters</small></li>
      </ol>
    </div>
  );
}

export function SupporterJourneyPanel({ summary, fixtureLabel }: { summary: CrmTicketingFixtureAggregate | null; fixtureLabel: string }) {
  if (!summary) {
    return (
      <section className={styles.panel} aria-label="Supporter journey">
        <div className={styles.head}>
          <span>Supporter journey</span>
          <strong>Season tickets, arrival and travel origin for {fixtureLabel}</strong>
        </div>
        <p className={styles.empty}>
          Requires the club&apos;s authorised ticketing and access aggregate. Supporter records stay in the club&apos;s systems; only counts of 10 or more reach AVELA.{" "}
          <Link href="/app/sources">Check data sources →</Link>
        </p>
      </section>
    );
  }

  const season = summary.ticketTypes?.season;
  const timing = summary.entryTiming;
  const timingMax = Math.max(1, ...BANDS.map(([band]) => timing?.[band] ?? 0));
  return (
    <section className={styles.panel} aria-label="Supporter journey">
      <div className={styles.head}>
        <span>Supporter journey · club aggregate</span>
        <strong>Season tickets, arrival and travel origin for {fixtureLabel}</strong>
      </div>
      <div className={styles.grid}>
        <div className={styles.block}>
          <span>Season-ticket holders</span>
          {season ? (
            <>
              <strong>{summary.seasonTicketScanRate === null || summary.seasonTicketScanRate === undefined ? "—" : `${Math.round(summary.seasonTicketScanRate * 100)}% came in`}</strong>
              <p>{count(season.scans)} scanned of {count(season.tickets)} season tickets.</p>
            </>
          ) : <p>{summary.ticketTypes === null || summary.ticketTypes === undefined ? "Ticket type is not in the club export." : "No season tickets in this export."}</p>}
        </div>
        <div className={styles.block}>
          <span>When supporters arrived</span>
          {timing ? (
            <ul className={styles.bars}>
              {BANDS.map(([band, label]) => (
                <li key={band}>
                  <small>{label}</small>
                  <i aria-hidden="true"><em style={{ width: `${Math.round(((timing[band] ?? 0) / timingMax) * 100)}%` }} /></i>
                  <b>{count(timing[band])}</b>
                </li>
              ))}
            </ul>
          ) : <p>Scan times or kickoff are not available for this fixture.</p>}
        </div>
        <Origins title="Where buyers travel from" origins={summary.origins?.all ?? null} />
        <Origins title="Where season-ticket holders travel from" origins={summary.origins?.seasonTicketHolders ?? null} />
      </div>
      <p className={styles.note}>Postcode districts only, counted once per supporter. Groups under 10 are withheld.</p>
    </section>
  );
}
