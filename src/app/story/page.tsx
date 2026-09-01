import { territories } from "@/lib/data";
import { LocalizedStoryPage } from "@/components/LocalizedStoryPage";

export default function StoryPage() {
  return <LocalizedStoryPage territories={territories} />;
}
