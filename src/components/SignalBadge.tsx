export function SignalBadge({
  type
}: {
  type: "MEASURED" | "INFERRED" | "LIVE" | "WAITING" | "STRUCTURAL";
}) {
  const cls = type.toLowerCase();
  return <span className={`signalBadge ${cls}`}>{type}</span>;
}
