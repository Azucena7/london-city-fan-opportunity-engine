import type { Metadata } from "next";
import { LocalizedSourcesPage } from "@/components/LocalizedSourcesPage";
import { sourceHealth } from "@/lib/sourceHealth";

export const metadata: Metadata = {
  title: "Data & Sources",
  description: "Decision reliability, source confidence, blockers and next actions across the opportunity engine."
};

export default function SourcesPage() {
  return <LocalizedSourcesPage data={sourceHealth} />;
}
