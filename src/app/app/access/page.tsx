import type { Metadata } from "next";
import { AccessCenter } from "@/components/AccessCenter";
import { OperationalContinuity } from "@/components/OperationalContinuity";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./access.module.css";

export const metadata: Metadata = {
  title: "Access & team · AVELA",
  description: "Create an AVELA pilot account, request club access, review memberships and protect operational continuity during staff changes."
};

export default function AccessPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="access" />
      <AccessCenter />
      <OperationalContinuity />
    </main>
  );
}
