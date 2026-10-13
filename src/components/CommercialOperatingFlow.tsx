import styles from "./CommercialOperatingFlow.module.css";

const plays = [
  {
    num: "01",
    kicker: "Attendance & recurrence",
    title: "What could change whether people come?",
    detail: "Weather, travel, competing attention, family calendar and demand context are read together before the matchday plan is fixed.",
    result: "Pressure spotted earlier"
  },
  {
    num: "02",
    kicker: "Matchday opportunity",
    title: "What is happening around the fixture that the club could use?",
    detail: "AVELA looks for adjacent sporting, city and audience moments that can strengthen the proposition or extend the football day.",
    result: "Opportunity window identified"
  },
  {
    num: "03",
    kicker: "Commercial activation",
    title: "Can the club actually act on the signal?",
    detail: "Rights, partners, people and execution capacity validate the opportunity after it is detected — they do not define the engine.",
    result: "Actionability checked"
  }
] as const;

export function CommercialOperatingFlow() {
  return (
    <section className={styles.wrap} id="how-it-works" aria-labelledby="operating-flow-title">
      <div className={styles.intro}>
        <span>Where the engine creates value</span>
        <div>
          <h2 id="operating-flow-title">The signal comes first. Club context tells AVELA whether it is actionable.</h2>
          <p>
            The goal is not to give the team another place to manage work. It is to surface the outside change that could alter attendance, timing or activation — then connect only the internal context needed to decide what to do.
          </p>
        </div>
      </div>

      <div className={styles.playGrid}>
        {plays.map((play) => (
          <article key={play.kicker}>
            <span className={styles.playNum}>{play.num}</span>
            <span>{play.kicker}</span>
            <h3>{play.title}</h3>
            <p>{play.detail}</p>
            <strong>{play.result}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
