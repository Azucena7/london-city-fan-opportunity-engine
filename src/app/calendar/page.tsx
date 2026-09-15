import type { Metadata } from "next";
import { LocalizedCalendarPage } from "@/components/LocalizedCalendarPage";
import { attendanceHistory, audienceReach, calendar, crmTicketingDemo, crmTicketingReadiness, fixtures, leagueAttendanceBenchmark, postMatchScorecards } from "@/lib/data";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return <LocalizedCalendarPage calendar={calendar} plans={fixtures} history={attendanceHistory} benchmark={leagueAttendanceBenchmark} audience={audienceReach} crmReadiness={crmTicketingReadiness} crmDemo={crmTicketingDemo} scorecards={postMatchScorecards} />;
}
