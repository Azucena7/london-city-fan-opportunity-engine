import type { Metadata } from "next";
import { calendar } from "@/lib/data";
import { ClubOperationsDemo } from "@/components/ClubOperationsDemo";
import { upcomingHomeFixtures } from "@/lib/clubFixtureCalendar";

export const metadata: Metadata = { title: "Espacio del club · Demo guiada", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function ClubDemoPage() {
  const upcoming = upcomingHomeFixtures(calendar.map(item=>({ ...item, kickoff:item.kickoff ?? "" })),new Date(),"Europe/London");
  const fixture = upcoming[0] ?? { id:"manual",opponent:"Rival por definir",date:"",kickoff:"",venue:"Bromley" };
  return <ClubOperationsDemo fixture={fixture} fixtures={upcoming} />;
}
