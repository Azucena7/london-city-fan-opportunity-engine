import { fixtures, territories } from "@/lib/data";
import { LocalizedHome } from "@/components/LocalizedHome";

export default function Home() {
  return <LocalizedHome fixtures={fixtures} territories={territories} />;
}
