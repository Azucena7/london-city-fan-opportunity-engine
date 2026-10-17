import styles from "./EngineStory.module.css";

const useCases = [
  ["Attendance & recurrence", "A same-slot WSL fixture or a Premier League kick-off nearby", "Who to re-invite, with which message, and when."],
  ["Matchday opportunity", "An England match the same evening, a bank holiday weekend, a dry and mild forecast", "Whether to extend the day, and what to build around the match."],
  ["Commercial activation", "A broadcast pick or a partner moment in the calendar", "Which activation to prioritise, and how to sell what the stadium adds."],
  ["Partner & people context", "Partner obligations, player and staff availability", "Whether the move can actually be delivered — and by whom."]
] as const;

export function EngineUseCases() {
  return (
    <section className={styles.cases} aria-labelledby="cases-title">
      <div className={styles.statement}>
        <h2 id="cases-title">Four decisions it is built to change.</h2>
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
