import { parseTicketmasterEvents, parseWslAttendanceAverages, parseYoutubeChannelResponse } from "./refresh-public-signals.mjs";
import { parseOfficialLeagueFixtures, rankEventCompetition } from "./event-competition.mjs";

const youtube = parseYoutubeChannelResponse({
  items: [{ id: "channel-1", statistics: { subscriberCount: "14700", videoCount: "143", viewCount: "2020027" } }]
});
if (youtube.subscribers !== 14_700 || youtube.videos !== 143 || youtube.channelViews !== 2_020_027) {
  throw new Error("YouTube Data API parser failed");
}

const ticketmaster = parseTicketmasterEvents({
  _embedded: { events: [{
    id: "event-1",
    name: "London event",
    url: "https://example.com/event-1",
    dates: { start: { localDate: "2026-09-26", localTime: "19:30:00" } },
    classifications: [{ primary: true, segment: { name: "Music" }, genre: { name: "Rock" } }],
    _embedded: { venues: [{ name: "London venue", city: { name: "London" } }] }
  }] }
}, [{ id: "fixture-1", date: "2026-09-26" }]);
if (ticketmaster.length !== 1 || ticketmaster[0].fixtureIds[0] !== "fixture-1") {
  throw new Error("Ticketmaster Discovery API parser failed");
}

const fixture = { id: "fixture-1", date: "2026-09-26", kickoff: "17:00", competition: "Barclays Women's Super League" };
const leagueFixtures = parseOfficialLeagueFixtures(`
  <a href="https://www.wslfootball.com/match/barclays-wsl/match-2/arsenal-v-chelsea/" aria-label="Arsenal - Chelsea">
    <time dateTime="2026-09-26T17:00:00">5:00 PM</time>
    <img alt="Barclays WSL" />
    <div class="text-grey-on-light-500">Emirates Stadium</div>
  </a>
`, [fixture]);
if (leagueFixtures.length !== 1 || leagueFixtures[0].competition !== "Barclays WSL") {
  throw new Error("Official WSL fixture parser failed");
}

const ranked = rankEventCompetition([
  ...ticketmaster,
  ...leagueFixtures,
  { ...ticketmaster[0], id: "attraction", name: "London Eye - Standard Experience" },
  ...Array.from({ length: 6 }, (_, index) => ({
    ...ticketmaster[0],
    id: `repeated-${index}`,
    name: "Repeated exhibition admission",
    category: "Miscellaneous",
    time: `${10 + index}:00:00`
  }))
], [fixture]);
const directLeagueCompetition = ranked.find((event) => event.kind === "same-league-fixture");
if (!directLeagueCompetition || directLeagueCompetition.level !== "high" || directLeagueCompetition.score < 65) {
  throw new Error("Simultaneous Barclays WSL competition scoring failed");
}
if (ranked.some((event) => event.id === "attraction")) {
  throw new Error("Permanent attraction filtering failed");
}
if (ranked.some((event) => event.name === "Repeated exhibition admission")) {
  throw new Error("Repeated miscellaneous admission filtering failed");
}

const attendance = parseWslAttendanceAverages(`
  <table><tbody>
    <tr><td>1</td><td>Arsenal</td><td>23,900</td></tr>
    <tr><td>2</td><td>London City Lionesses</td><td>5,402</td></tr>
  </tbody></table>
`, ["Arsenal", "London City Lionesses"]);
if (attendance.get("Arsenal") !== 23_900 || attendance.get("London City Lionesses") !== 5_402) {
  throw new Error("WSL attendance parser failed");
}

console.log(JSON.stringify({ youtube, ticketmasterEvents: ticketmaster.length, leagueFixtures: leagueFixtures.length, relevantEvents: ranked.length, attendanceRows: attendance.size }, null, 2));
