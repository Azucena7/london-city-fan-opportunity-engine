import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Club operations · Full rehearsal", robots: { index: false, follow: false } };

export default function ClubOperationsPage() {
  redirect("/club-demo");
}
