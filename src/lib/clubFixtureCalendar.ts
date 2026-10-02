export type ClubFixture = { id:string; opponent:string; date:string; kickoff:string; venue:string; homeAway?:string; status?:string };
export function upcomingHomeFixtures(fixtures:ClubFixture[], now:Date, timeZone:string): ClubFixture[] {
  const parts = new Intl.DateTimeFormat("en-GB",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
  const value = (type:string) => parts.find(p=>p.type===type)?.value ?? "";
  const date = `${value("year")}-${value("month")}-${value("day")}`;
  const time = `${value("hour")}:${value("minute")}`;
  return fixtures.filter(f=>f.homeAway==="home" && f.status!=="final" && (f.date>date || (f.date===date && (!f.kickoff || f.kickoff>=time)))).sort((a,b)=>`${a.date} ${a.kickoff}`.localeCompare(`${b.date} ${b.kickoff}`));
}
