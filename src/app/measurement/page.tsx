import type { Metadata } from "next";
import { decisionValidation, experimentMeasurement } from "@/lib/data";
import { MeasurementDashboard } from "@/components/MeasurementDashboard";

export const metadata: Metadata = {
  title: "Evidence & Decision Validation",
  description: "Evidence control, real-world decision validation and consent-safe experiment measurement."
};

export default function MeasurementPage() {
  return <MeasurementDashboard data={experimentMeasurement} validation={decisionValidation} />;
}
