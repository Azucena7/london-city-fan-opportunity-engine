import type { Metadata } from "next";
import { LocalizedTerritoriesPage } from "@/components/LocalizedTerritoriesPage";
import { territories } from "@/lib/data";

export const metadata: Metadata = { title: "Territories" };

export default function TerritoriesPage() {
  return <LocalizedTerritoriesPage territories={territories} />;
}
