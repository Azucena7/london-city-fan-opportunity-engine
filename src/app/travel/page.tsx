import { fixtures } from "@/lib/data";
import { isoDateForWeather, nextHomeFixture } from "@/lib/fixtures";
import { LocalizedTravelPage } from "@/components/LocalizedTravelPage";

export default function TravelPage() {
  const nextFixture = nextHomeFixture(fixtures);
  const matchDate = isoDateForWeather(nextFixture);

  return <LocalizedTravelPage matchDate={matchDate} />;
}
