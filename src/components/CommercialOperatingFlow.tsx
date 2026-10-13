import styles from "./CommercialOperatingFlow.module.css";

const sources = [
  ["Outside the club", "Weather · transport · city · football"],
  ["Fan demand", "CRM · ticketing · behaviour"],
  ["Commercial truth", "Partners · rights · contracts"],
  ["Availability", "People · fixtures · calendars"],
  ["Performance", "Content · analytics · learning"]
] as const;

const steps = [
  ["01", "Detect", "What changed"],
  ["02", "Interpret", "Why it matters"],
  ["03", "Prepare", "What to do next"],
  ["04", "Learn", "What improves"]
] as const;

const outcomes = [
  ["Attendance pressure", "Know what could weaken demand"],
  ["Opportunity window", "Know what could strengthen the proposition"],
  ["Decision change", "Know when timing, message or activation should move"]
] as const;

const plays = [
  {
    kicker: "Attendance & recurrence",
    title: "What could change whether people come?",
    detail: "Weather, travel, competing attention, family calendar and demand context are read together."
  },
  {
    kicker: "Matchday opportunity",
    title: "What is happening around the fixture that we can use?",
    detail: "AVELA looks for adjacent sporting, city and audience moments that can strengthen the day."
  },
  {
    kicker: "Commercial activation",
    title: "Can we turn that signal into something the club can actually do?",
    detail: "Rights, partners, people and execution capacity validate the opportunity instead of defining it."
  }
] as const;

export function CommercialOperatingFlow() {
  return (
    <section className={styles.wrap} id="how-it-works" aria-labelledby="operating-flow-title">
      <div className={styles.intro}>
        <span>How the engine works</span>
        <div>
          <h2 id="operating-flow-title">The signal comes first. Club context tells AVELA whether it is actionable.</h2>
          <p>
            AVELA is not valuable because it stores more internal information. It is valuable because it can connect an external change with the club context needed to decide whether that change creates risk, opportunity or no meaningful action.
          </p>
        </div>
      </div>

      <div className={styles.stage} aria-label="AVELA opportunity engine flow">
        <div className={styles.sourcesLabel}>Signals the engine combines</div>
        <div className={styles.sourceRail}>
          {sources.map(([label, detail]) => (
            <div className={styles.source} key={label}>
              <small>{label}</small>
              <strong>{detail}</strong>
            </div>
          ))}
        </div>

        <div className={styles.engine}>
          <div className={styles.engineMark}>
            <span>AVELA</span>
            <strong>Opportunity Engine</strong>
          </div>
          <div className={styles.stepRail}>
            {steps.map(([num, label, detail], index) => (
              <div className={styles.step} key={label}>
                <span>{num}</span>
                <div><strong>{label}</strong><small>{detail}</small></div>
                {index < steps.length - 1 ? <i aria-hidden="true">→</i> : null}
              </div>
            ))}
          </div>
          <div className={styles.approval}>Human decision stays final</div>
        </div>

        <div className={styles.outcomes}>
          {outcomes.map(([title, detail], index) => (
            <div key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.playGrid}>
        {plays.map((play) => (
          <article key={play.kicker}>
            <span>{play.kicker}</span>
            <h3>{play.title}</h3>
            <p>{play.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
