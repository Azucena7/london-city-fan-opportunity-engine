import type { Metadata } from "next";
import { LocalizedCalendarPage } from "@/components/LocalizedCalendarPage";
import { attendanceHistory, calendar, fixtures } from "@/lib/data";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return <LocalizedCalendarPage calendar={calendar} plans={fixtures} history={attendanceHistory} />;
}
