import { parseWslAttendanceAverages, parseYoutubePublicAbout } from "./refresh-public-signals.mjs";

const youtube = parseYoutubePublicAbout('{"subscriberCountText":"14.7K subscribers","viewCountText":"2,020,027 views"}');
if (youtube.subscribers !== 14_700 || youtube.channelViews !== 2_020_027) {
  throw new Error("YouTube public-count parser failed");
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

console.log(JSON.stringify({ youtube, attendanceRows: attendance.size }, null, 2));
