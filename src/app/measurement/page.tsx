import type { Metadata } from "next";
import { experimentMeasurement } from "@/lib/data";
import { MeasurementDashboard } from "@/components/MeasurementDashboard";

export const metadata: Metadata = {
  title: "Experiment Measurement",
  description: "Consent-safe, provider-ready measurement for matchday experience and mobility experiments."
};

export default function MeasurementPage() {
  return <MeasurementDashboard data={experimentMeasurement} />;
}
