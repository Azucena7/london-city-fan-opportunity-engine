import { fixtures } from "@/lib/data";
import { nextHomeFixture } from "@/lib/fixtures";
import { LocalizedTravelPage } from "@/components/LocalizedTravelPage";
export default function TravelPage(){const fixture=nextHomeFixture(fixtures); return <LocalizedTravelPage matchDate={fixture?.date} matchKickoff={fixture?.kickoff}/>}
