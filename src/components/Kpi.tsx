export function Kpi({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="kpi">
      <div className="eyebrow">{label}</div>
      <div className="kpiValue">{value}</div>
      {detail ? <div className="muted">{detail}</div> : null}
    </div>
  );
}
