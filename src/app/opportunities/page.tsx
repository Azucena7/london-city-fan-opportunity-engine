import { fixtures, territories } from "@/lib/data";
import { LocalizedOpportunitiesPage } from "@/components/LocalizedOpportunitiesPage";

export default function OpportunitiesPage() {
  return <LocalizedOpportunitiesPage fixtures={fixtures} territories={territories}/>;
}
