import type { Metadata } from "next";
import { ClubSetup } from "@/components/ClubSetup";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./setup.module.css";

export const metadata: Metadata = {
  title: "Club setup · Fan Growth Engine",
  description: "Configure fixtures, channels, objectives, brand rules and approvals once for the club."
};

export default function ClubSetupPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="setup" />
      <ClubSetup />
    </main>
  );
}
