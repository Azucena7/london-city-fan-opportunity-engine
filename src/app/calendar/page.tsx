import type { Metadata } from "next";
import { LocalizedCalendarPage } from "@/components/LocalizedCalendarPage";
import { attendanceHistory, audienceReach, calendar, campaignPlans, clubActivations, crmTicketingDemo, crmTicketingReadiness, eventLandscape, fixtures, leagueAttendanceBenchmark, liveSignals, postMatchScorecards, searchDemand } from "@/lib/data";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return <LocalizedCalendarPage calendar={calendar} plans={fixtures} history={attendanceHistory} benchmark={leagueAttendanceBenchmark} audience={audienceReach} eventLandscape={eventLandscape} searchDemand={searchDemand} crmReadiness={crmTicketingReadiness} crmDemo={crmTicketingDemo} scorecards={postMatchScorecards} campaigns={campaignPlans.campaigns} signals={liveSignals} activations={clubActivations} />;
}
