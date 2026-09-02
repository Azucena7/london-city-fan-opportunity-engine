import { fixtures } from "@/lib/data";
import { nextHomeFixture } from "@/lib/fixtures";
import { LocalizedThisWeek } from "@/components/LocalizedThisWeek";
import { NavTabs } from "@/components/NavTabs";

export default function ThisWeekPage() {
 const fixture=nextHomeFixture(fixtures);
 if(!fixture) return <main><NavTabs/><section className="compactIntro"><h1>No upcoming home fixture</h1></section></main>;
 return <LocalizedThisWeek fixture={fixture}/>;
}
