import type { Metadata } from "next";
import { AccessCenter } from "@/components/AccessCenter";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./access.module.css";

export const metadata: Metadata = {
  title: "Access & team · AVELA",
  description: "Create an AVELA pilot account, request club access and review memberships."
};

export default function AccessPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="access" />
      <AccessCenter />
    </main>
  );
}
