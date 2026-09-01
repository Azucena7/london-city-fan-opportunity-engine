import { ScoreBadge } from "./ScoreBadge";

export function DecisionCard({
  opponent,
  date,
  territory,
  score,
  decision,
  product,
  channel,
  message
}: {
  opponent: string;
  date: string;
  territory: string;
  score: number;
  decision: string;
  product: string;
  channel: string;
  message: string;
}) {
  return (
    <article className="decisionCard">
      <div className="decisionTop">
        <div>
          <div className="eyebrow">NEXT PRIORITY WINDOW</div>
          <h2>London City v {opponent}</h2>
          <div className="muted">{date}</div>
        </div>
        <ScoreBadge score={score} label="planning" />
      </div>

      <div className="decisionAction">{decision}</div>

      <div className="decisionGrid">
        <div>
          <span>Target territory</span>
          <strong>{territory}</strong>
        </div>
        <div>
          <span>Product</span>
          <strong>{product}</strong>
        </div>
        <div>
          <span>Channel</span>
          <strong>{channel}</strong>
        </div>
      </div>

      <blockquote>“{message}”</blockquote>
    </article>
  );
}
