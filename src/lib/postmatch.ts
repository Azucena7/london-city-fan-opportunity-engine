import type { CalendarFixture, CrmTicketingDemo, LocalizedText, PostMatchReview, PostMatchScorecard, PostMatchScorecardWindow } from "./models";

const windows: Array<{ id: PostMatchScorecardWindow["id"]; days: number; objective: LocalizedText }> = [
  { id: "T+1", days: 1, objective: { en: "Close result, attendance and operational facts", es: "Cerrar resultado, asistencia y hechos operativos" } },
  { id: "T+7", days: 7, objective: { en: "Close campaign, content, scans and no-show", es: "Cerrar campaña, contenido, accesos y no-show" } },
  { id: "T+30", days: 30, objective: { en: "Measure first repeat window", es: "Medir la primera ventana de repetición" } },
  { id: "T+60", days: 60, objective: { en: "Measure retained fixture demand", es: "Medir demanda retenida entre partidos" } },
  { id: "T+90", days: 90, objective: { en: "Close cohort retention", es: "Cerrar la retención de la cohorte" } }
];

function publicWindows(fixtureDate: string, asOf: Date): PostMatchScorecardWindow[] {
  const elapsedDays = Math.floor((asOf.getTime() - new Date(`${fixtureDate}T12:00:00Z`).getTime()) / 86400000);
  return windows.map((window) => ({
    id: window.id,
    dueAfterDays: window.days,
    status: elapsedDays < window.days ? "waiting" : window.id === "T+1" ? "complete" : "partial",
    objective: window.objective
  }));
}

function demoWindows(): PostMatchScorecardWindow[] {
  return windows.map((window) => ({
    id: window.id,
    dueAfterDays: window.days,
    status: window.days <= 7 ? "demo" : "waiting",
    objective: window.objective
  }));
}

function buildPublicScorecard(fixture: CalendarFixture, review: PostMatchReview, asOf: Date): PostMatchScorecard {
  const ticketValue = `${review.ticketsSoldQualifier ?? ""}${review.ticketsSold.toLocaleString("en-GB")}`;
  return {
    fixtureId: fixture.id,
    fixtureDate: fixture.date,
    opponent: fixture.opponent,
    mode: "public",
    headline: review.headline,
    interpretation: review.learning,
    nextAction: review.nextAction,
    metrics: [
      { id: "result", label: { en: "Result", es: "Resultado" }, value: review.result, state: "public-measured" },
      { id: "attendance", label: { en: "Attendance", es: "Asistencia" }, value: review.attendance.toLocaleString("en-GB"), state: review.attendanceState === "measured" ? "public-measured" : "public-reported" },
      { id: "tickets", label: { en: "Tickets sold", es: "Entradas vendidas" }, value: ticketValue, state: "public-reported" },
      { id: "occupancy", label: { en: "Occupancy", es: "Ocupación" }, value: review.occupancy, state: "public-reported" },
      { id: "scans", label: { en: "Scans", es: "Accesos" }, value: "Pending", state: "requires-access" },
      { id: "no-show", label: { en: "No-show", es: "No-show" }, value: "Pending", state: "requires-access" },
      { id: "repeat", label: { en: "30/60/90 repeat", es: "Repetición 30/60/90" }, value: "Waiting", state: "waiting" }
    ],
    windows: publicWindows(fixture.date, asOf),
    dataGaps: review.dataGaps
  };
}

function buildDemoScorecard(fixture: CalendarFixture, demo: CrmTicketingDemo): PostMatchScorecard {
  const records = demo.records;
  const scans = records.filter((row) => row.scan_status === "scanned").length;
  const noShows = records.filter((row) => row.scan_status === "not_scanned").length;
  const buyers = new Set(records.map((row) => row.supporter_id_hash));
  const firstTime = new Set(records.filter((row) => row.first_time_buyer).map((row) => row.supporter_id_hash));
  const attributed = records.filter((row) => row.campaign_id).length;
  const averagePrice = records.reduce((sum, row) => sum + row.realised_unit_price, 0) / records.length;
  return {
    fixtureId: fixture.id,
    fixtureDate: fixture.date,
    opponent: fixture.opponent,
    mode: "synthetic-demo",
    headline: demo.label,
    interpretation: {
      en: "Synthetic records prove that the scorecard can calculate conversion and attendance quality. They do not forecast Brighton or describe club performance.",
      es: "Los registros sintéticos comprueban que el scorecard calcula conversión y calidad de asistencia. No pronostican Brighton ni describen el rendimiento del club."
    },
    nextAction: {
      en: "Replace the rehearsal with an authorised export after the fixture; keep the same fixture, campaign, content, ticket and supporter keys.",
      es: "Sustituir el ensayo por un export autorizado después del partido, conservando las mismas claves de partido, campaña, contenido, entrada y aficionado."
    },
    metrics: [
      { id: "tickets", label: { en: "Demo tickets", es: "Entradas demo" }, value: records.length.toLocaleString("en-GB"), state: "synthetic-demo" },
      { id: "scans", label: { en: "Demo scans", es: "Accesos demo" }, value: scans.toLocaleString("en-GB"), state: "synthetic-demo" },
      { id: "no-show", label: { en: "Demo no-show", es: "No-show demo" }, value: `${((noShows / records.length) * 100).toFixed(1)}%`, state: "synthetic-demo" },
      { id: "buyers", label: { en: "Unique demo buyers", es: "Compradores demo únicos" }, value: buyers.size.toLocaleString("en-GB"), state: "synthetic-demo" },
      { id: "first-time", label: { en: "First-time demo buyers", es: "Nuevos compradores demo" }, value: firstTime.size.toLocaleString("en-GB"), state: "synthetic-demo" },
      { id: "yield", label: { en: "Demo average price", es: "Precio medio demo" }, value: `£${averagePrice.toFixed(2)}`, state: "synthetic-demo" },
      { id: "attribution", label: { en: "Campaign-attributed", es: "Atribuidas a campaña" }, value: `${attributed}/${records.length}`, state: "synthetic-demo" },
      { id: "repeat", label: { en: "30/60/90 repeat", es: "Repetición 30/60/90" }, value: "Requires fixtures", state: "requires-access" }
    ],
    windows: demoWindows(),
    dataGaps: ["authorised orders", "actual scans", "actual campaign source", "multi-fixture repeat"]
  };
}

export function buildPostMatchScorecards(calendar: CalendarFixture[], reviews: PostMatchReview[], demo: CrmTicketingDemo, asOf = new Date()): PostMatchScorecard[] {
  const fixtures = new Map(calendar.map((fixture) => [fixture.id, fixture]));
  const scorecards = reviews.flatMap((review) => {
    const fixture = fixtures.get(review.fixtureId);
    return fixture ? [buildPublicScorecard(fixture, review, asOf)] : [];
  });
  const demoFixture = fixtures.get(demo.fixtureId);
  if (demoFixture) scorecards.push(buildDemoScorecard(demoFixture, demo));
  return scorecards;
}
