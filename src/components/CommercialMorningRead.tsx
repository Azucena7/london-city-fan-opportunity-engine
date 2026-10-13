import styles from "./CommercialMorningRead.module.css";

const priorities = [
  {
    state: "External pressure",
    title: "Saturday · rail disruption + rain now affect the attendance plan",
    detail: "Walk-up confidence is lower. AVELA recommends earlier CRM, clearer travel messaging and a review of the walk-up assumption.",
    action: "Review matchday response"
  },
  {
    state: "Competing attention",
    title: "Major televised fixture overlaps the strongest campaign window",
    detail: "The message and send timing should move rather than compete head-on for the same attention window.",
    action: "Adjust campaign timing"
  },
  {
    state: "Opportunity",
    title: "School holiday + no major city conflict opens a stronger family window",
    detail: "Family proposition fit improves. Rights and operational capacity still need to remain clear before launch.",
    action: "Open opportunity"
  }
] as const;

const signals = [
  ["2", "fixtures with external attendance pressure"],
  ["1", "travel disruption requiring action"],
  ["2", "opportunity windows strengthened"],
  ["Ready", "next matchday except creative approval"]
] as const;

export function CommercialMorningRead() {
  return (
    <section className={styles.wrap} aria-labelledby="morning-read-title">
      <div className={styles.intro}>
        <span>What AVELA sees before you do</span>
        <div>
          <h2 id="morning-read-title">Start the day knowing what outside the club could change the plan.</h2>
          <p>
            Weather, transport, city events, competing football and calendar moments are easy to miss.
            AVELA brings only the signals that materially change attendance, timing, activation or execution into the morning read.
          </p>
        </div>
      </div>

      <div className={styles.cockpit}>
        <div className={styles.cockpitTop}>
          <div>
            <span>Tuesday · 08:42</span>
            <strong>Morning commercial read</strong>
          </div>
          <div className={styles.status}>Synthetic external + club context</div>
        </div>

        <div className={styles.signalStrip}>
          {signals.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.body}>
          <div className={styles.priorityList}>
            <div className={styles.columnLabel}>What changed outside the club</div>
            {priorities.map((item, index) => (
              <article key={item.title}>
                <div className={styles.rank}>{String(index + 1).padStart(2, "0")}</div>
                <div className={styles.priorityCopy}>
                  <span>{item.state}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                <button type="button">{item.action}</button>
              </article>
            ))}
          </div>

          <aside className={styles.readiness}>
            <div className={styles.columnLabel}>Next matchday</div>
            <div className={styles.matchdayCard}>
              <span>Home · 18 Oct</span>
              <strong>Plan needs one adjustment</strong>
              <div className={styles.readyLine}>
                <i />
                <span>Rights, people and partner plan clear</span>
              </div>
              <div className={styles.reviewLine}>
                <i />
                <span>Transport pressure changes fan messaging</span>
              </div>
              <div className={styles.matchdayMeta}>
                <div><span>Weather</span><strong>Rain risk</strong></div>
                <div><span>Travel</span><strong>Disruption</strong></div>
                <div><span>Attention</span><strong>Competing fixture</strong></div>
              </div>
              <div className={styles.nextAction}>
                <span>Director decision</span>
                <strong>Approve earlier CRM + travel message</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className={styles.caption}>
        <strong>The value is not more data.</strong>
        <span>It is knowing which external signal should actually change the club’s next decision.</span>
      </div>
    </section>
  );
}
