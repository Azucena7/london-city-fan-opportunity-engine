import type { Metadata } from "next";
import { LocalizedCalendarPage } from "@/components/LocalizedCalendarPage";
import { calendar, fixtures } from "@/lib/data";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return <LocalizedCalendarPage calendar={calendar} plans={fixtures} />;
}
