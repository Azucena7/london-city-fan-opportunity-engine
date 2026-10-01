import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { calendar, campaignPlans, decisionValidation } from "@/lib/data";
import { CommercialCaseStory } from "@/components/CommercialCaseStory";

const ids = { everton: "2026-10-18-eve-h", brighton: "2026-09-26-bha-h" } as const;

export async function generateMetadata({ params }: { params: Promise<{ case: string }> }): Promise<Metadata> {
  const key = (await params).case;
  return { title: key === "everton" ? "Everton · Proposed decision" : "Brighton · Evidence and learning" };
}

export default async function CommercialCasePage({ params }: { params: Promise<{ case: string }> }) {
  const key = (await params).case;
  if (key !== "everton" && key !== "brighton") notFound();
  const fixture = calendar.find((f) => f.id === ids[key]);
  const campaign = campaignPlans.campaigns.find((c) => c.fixtureId === ids[key]);
  if (!fixture || !campaign) notFound();
  const { objective, whyNow, audiences, approvals, schedule, nextApproval } = campaign;
  return <CommercialCaseStory kind={key} fixture={fixture} campaign={{ objective, whyNow, audiences, approvals, schedule, nextApproval }}
    validation={key === "brighton" ? decisionValidation.cases.find((c) => c.fixtureId === ids[key]) : undefined} />;
}
