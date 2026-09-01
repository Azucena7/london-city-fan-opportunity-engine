export function ScoreBadge({
  score,
  label
}: {
  score: number;
  label?: string;
}) {
  const tone = score >= 85 ? "hot" : score >= 72 ? "good" : score >= 58 ? "mid" : "low";

  return (
    <div className={`scoreBadge ${tone}`}>
      <span className="score">{score}</span>
      <span>{label ?? "score"}</span>
    </div>
  );
}
