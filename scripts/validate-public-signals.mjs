import { parseTicketmasterEvents, parseWslAttendanceAverages, parseYoutubeChannelResponse } from "./refresh-public-signals.mjs";

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

const attendance = parseWslAttendanceAverages(`
  <table><tbody>
    <tr><td>1</td><td>Arsenal</td><td>23,900</td></tr>
    <tr><td>2</td><td>London City Lionesses</td><td>5,402</td></tr>
  </tbody></table>
`, ["Arsenal", "London City Lionesses"]);
if (attendance.get("Arsenal") !== 23_900 || attendance.get("London City Lionesses") !== 5_402) {
  throw new Error("WSL attendance parser failed");
}

console.log(JSON.stringify({ youtube, ticketmasterEvents: ticketmaster.length, attendanceRows: attendance.size }, null, 2));
