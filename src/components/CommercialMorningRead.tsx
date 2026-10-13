import styles from "./CommercialMorningRead.module.css";

const priorities = [
  {
    state: "Decision",
    title: "Everton · family return-attendance play",
    detail: "Demand is soft. CRM audience is reachable. Rights and timing are clear.",
    action: "Review recommendation"
  },
  {
    state: "Partner risk",
    title: "Northline · 2 contractual activations still unscheduled",
    detail: "Renewal window approaching. Two suitable home fixtures remain.",
    action: "Review activation plan"
  },
  {
    state: "Commercial opportunity",
    title: "Open matchday inventory · family category",
    detail: "No exclusivity conflict detected. Inventory and operational capacity available.",
    action: "Open opportunity"
  }
] as const;

const signals = [
  ["3", "decisions need attention"],
  ["1", "partner obligation at risk"],
  ["2", "commercial opportunities"],
  ["Ready", "next matchday except creative approval"]
] as const;

export function CommercialMorningRead() {
  return (
    <section className={styles.wrap} aria-labelledby="morning-read-title">
      <div className={styles.intro}>
        <span>What you see first</span>
        <div>
          <h2 id="morning-read-title">Start the day knowing where commercial attention is needed.</h2>
          <p>
            AVELA prepares the read before the meeting: what changed, what matters, what is at risk,
            what is ready, and where a decision is needed.
          </p>
        </div>
      </div>

      <div className={styles.cockpit}>
        <div className={styles.cockpitTop}>
          <div>
            <span>Tuesday · 08:42</span>
            <strong>Morning commercial read</strong>
          </div>
          <div className={styles.status}>Prepared from connected club context</div>
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
            <div className={styles.columnLabel}>Needs your attention</div>
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
              <strong>Commercially ready</strong>
              <div className={styles.readyLine}>
                <i />
                <span>5 workstreams ready</span>
              </div>
              <div className={styles.reviewLine}>
                <i />
                <span>Creative approval needs review</span>
              </div>
              <div className={styles.matchdayMeta}>
                <div><span>Partners</span><strong>4 active</strong></div>
                <div><span>People</span><strong>Cleared</strong></div>
                <div><span>Rights</span><strong>Reviewed</strong></div>
              </div>
              <div className={styles.nextAction}>
                <span>Director decision</span>
                <strong>Approve creative route</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className={styles.caption}>
        <strong>Not another dashboard.</strong>
        <span>AVELA surfaces exceptions and prepared decisions so the team does not spend the morning rebuilding context.</span>
      </div>
    </section>
  );
}
