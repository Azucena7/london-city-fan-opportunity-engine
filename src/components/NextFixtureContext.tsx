export function NextFixtureContext({
  opponent,
  date,
  venue
}: {
  opponent: string;
  date?: string;
  venue?: string;
}) {
  return (
    <section className="nextFixtureContext">
      <div>
        <div className="eyebrow">NEXT HOME FIXTURE</div>
        <h2>{opponent}</h2>
      </div>

      <div className="nextFixtureMeta">
        <div>
          <span>Date</span>
          <strong>{date ?? "Unknown"}</strong>
        </div>
        <div>
          <span>Venue</span>
          <strong>{venue ?? "Hayes Lane"}</strong>
        </div>
        <div>
          <span>Selection</span>
          <strong>Automatic</strong>
        </div>
      </div>
    </section>
  );
}
