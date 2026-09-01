export function WeeklyDecisionHero({
  opponent,
  date,
  score,
  decision,
  territory,
  product,
  channel,
  message
}: {
  opponent: string;
  date: string;
  score: number;
  decision: string;
  territory: string;
  product: string;
  channel: string;
  message: string;
}) {
  return (
    <section className="weeklyHero">
      <div className="weeklyHeroLeft">
        <div className="eyebrow">WEEKLY DECISION</div>
        <div className="weeklyScore">{score}</div>
        <div className="weeklyDecision">{decision}</div>
      </div>

      <div className="weeklyHeroMain">
        <span className="muted">{date}</span>
        <h2>London City v {opponent}</h2>
        <blockquote>“{message}”</blockquote>
      </div>

      <div className="weeklyHeroSide">
        <div><span>Target</span><strong>{territory}</strong></div>
        <div><span>Product</span><strong>{product}</strong></div>
        <div><span>Channel</span><strong>{channel}</strong></div>
      </div>
    </section>
  );
}
