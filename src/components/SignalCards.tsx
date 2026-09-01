const signals = [
  {
    title: "Weather",
    status: "WAITING",
    detail: "Activate inside the reliable 5–7 day forecast window.",
    use: "Modify conversion, travel and family messaging."
  },
  {
    title: "Attendance momentum",
    status: "WAITING",
    detail: "Requires current sales / scans / recent match performance.",
    use: "Tell us whether demand is responding."
  },
  {
    title: "Attention competition",
    status: "ACTIVE",
    detail: "Major events, TV, holidays and competing sport.",
    use: "Shift spend and message by fixture."
  },
  {
    title: "Calendar whitespace",
    status: "ACTIVE",
    detail: "Palace, Charlton, Chelsea and other local inventory.",
    use: "Find the best weeks to acquire."
  }
];

export function SignalCards() {
  return (
    <div className="signalCards">
      {signals.map((s) => (
        <article className="signalCard" key={s.title}>
          <div className="signalTop">
            <h3>{s.title}</h3>
            <span className={`signalStatus ${s.status === "ACTIVE" ? "active" : ""}`}>{s.status}</span>
          </div>
          <p>{s.detail}</p>
          <div className="muted">{s.use}</div>
        </article>
      ))}
    </div>
  );
}
