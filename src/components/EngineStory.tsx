import styles from "./EngineStory.module.css";

const steps = [
  ["Signal", "AVELA watches what is happening around each fixture: weather, city events, competing football and calendar moments — and, in a pilot, transport, CRM and ticketing."],
  ["Impact", "It asks whether the signal touches attendance, recurrence, timing, a campaign or a partner activation. Most signals do not, and they stay quiet."],
  ["Opportunity or pressure", "When one does, it names the opportunity or the pressure and the evidence behind it, with known, assumed and missing kept apart."],
  ["Prepared decision", "Internal context validates it — who can be reached, what rights allow, who is available — and the result is one move with an owner and a deadline."],
  ["Learning", "After the match the outcome is compared with the recommendation, so the next read starts from what actually happened."]
] as const;

const useCases = [
  ["Attendance & recurrence", "A same-slot WSL fixture or a Premier League kick-off nearby", "Who to re-invite, with which message, and when."],
  ["Matchday opportunity", "An England match the same evening, a festival, a dry and mild forecast", "Whether to extend the day, and what to build around the match."],
  ["Commercial activation", "A broadcast pick or a partner moment in the calendar", "Which activation to prioritise, and how to sell what the stadium adds."],
  ["Partner & people context", "Partner obligations, player and staff availability", "Whether the move can actually be delivered — and by whom."]
] as const;

export function HowTheEngineWorks() {
  return (
    <section className={styles.how} id="how-it-works" aria-labelledby="how-title">
      <h2 id="how-title">Only the signals that change the decision.</h2>
      <ol className={styles.steps}>
        {steps.map(([title, body]) => (
          <li key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function EngineUseCases() {
  return (
    <section className={styles.cases} aria-labelledby="cases-title">
      <div className={styles.statement}>
        <h2 id="cases-title">Four decisions the engine is built to change.</h2>
        <p>The signal comes first. Internal context validates the opportunity; it never replaces the signal.</p>
      </div>
      <div className={styles.caseList}>
        {useCases.map(([title, signal, decision]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p><span>Signal</span>{signal}</p>
            <p><span>Decision it changes</span>{decision}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
