import type { Metadata } from "next";
import { LocalizedMethodPage } from "@/components/LocalizedMethodPage";

export const metadata: Metadata = {
  title: "How it works",
  description: "The decision lifecycle, stop rules, scoring logic, evidence boundaries and human gates behind the fan opportunity engine."
};

export default function MethodPage() {
  return <LocalizedMethodPage />;
}
