import type { Metadata } from "next";
import { LocalizedSourcesPage } from "@/components/LocalizedSourcesPage";
import { sourceHealth } from "@/lib/sourceHealth";

export const metadata: Metadata = {
  title: "Source Health",
  description: "Availability, access method, freshness and next action for every source used by the opportunity engine."
};

export default function SourcesPage() {
  return <LocalizedSourcesPage data={sourceHealth} />;
}
