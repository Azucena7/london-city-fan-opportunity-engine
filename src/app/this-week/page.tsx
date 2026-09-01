import { fixtures } from "@/lib/data";
import { nextHomeFixture } from "@/lib/fixtures";
import { LocalizedThisWeek } from "@/components/LocalizedThisWeek";

export default function ThisWeekPage() {
 const fixture=nextHomeFixture(fixtures);
 if(!fixture) return <main><h1>No upcoming home fixture</h1></main>;
 return <LocalizedThisWeek fixture={fixture}/>;
}
