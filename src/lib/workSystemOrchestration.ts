import type { CampaignPlan } from "@/lib/models";

export type WorkSystemId = "asana" | "monday" | "jira" | "notion" | "other";

export type WorkPackageItem = {
  key: string;
  title: string;
  category: "approval" | "activation" | "schedule";
  ownerHint: string;
  dueDate: string | null;
  estimatedMinutes: number;
  dependencyKeys: string[];
  state: "planned" | "blocked" | "ready";
};

export type WorkPackage = {
  id: string;
  decisionId: string;
  title: string;
  objective: string;
  state: "proposed";
  estimatedMinutes: number;
  items: WorkPackageItem[];
  blockers: string[];
  source: "campaign-plan";
};

export type ExternalWorkItemLink = {
  packageItemKey: string;
  externalSystem: WorkSystemId;
  externalRef: string;
  externalUrl?: string | null;
  state: "created" | "in-progress" | "blocked" | "done";
  assigneeLabel?: string | null;
  dueAt?: string | null;
  updatedAt: string;
};

export type WorkPackageHandoffResult = {
  externalSystem: WorkSystemId;
  packageRef: string;
  links: ExternalWorkItemLink[];
};

export interface WorkSystemAdapter {
  readonly system: WorkSystemId;
  createWorkPackage(workPackage: WorkPackage): Promise<WorkPackageHandoffResult>;
  syncWorkPackage(packageRef: string): Promise<ExternalWorkItemLink[]>;
}

function activationEffort(channel: string, asset: string) {
  const text = (channel + " " + asset).toLowerCase();
  let minutes = 90;
  if (/video|film|shoot|edit/.test(text)) minutes += 180;
  if (/paid/.test(text)) minutes += 75;
  if (/crm|email/.test(text)) minutes += 60;
  if (/partner|community/.test(text)) minutes += 45;
  if (/static|card|carousel/.test(text)) minutes += 45;
  return minutes;
}

export function deriveCampaignWorkPackage({
  campaign,
  decisionId
}: {
  campaign: CampaignPlan;
  decisionId: string;
}): WorkPackage {
  const approvalItems: WorkPackageItem[] = campaign.approvals
    .filter((approval) => approval.state !== "ready")
    .map((approval) => ({
      key: "approval:" + approval.id,
      title: approval.label.en,
      category: "approval",
      ownerHint: "Approval owner",
      dueDate: null,
      estimatedMinutes: 30,
      dependencyKeys: [],
      state: "blocked"
    }));

  const approvalDependencies = approvalItems.map((item) => item.key);

  const activationItems: WorkPackageItem[] = campaign.activations.map((activation) => ({
    key: "activation:" + activation.id,
    title: activation.title.en,
    category: "activation",
    ownerHint: activation.channel,
    dueDate: null,
    estimatedMinutes: activationEffort(activation.channel, activation.asset.en),
    dependencyKeys: activation.state === "ready" ? [] : approvalDependencies,
    state: activation.state === "ready" ? "ready" : approvalDependencies.length ? "blocked" : "planned"
  }));

  const scheduleItems: WorkPackageItem[] = campaign.schedule
    .filter((item) => item.state !== "complete")
    .map((item, index) => ({
      key: "schedule:" + index + ":" + item.date,
      title: item.action.en,
      category: "schedule",
      ownerHint: "Campaign owner",
      dueDate: item.date,
      estimatedMinutes: 45,
      dependencyKeys: item.state === "requires-approval" ? approvalDependencies : [],
      state: item.state === "requires-approval" && approvalDependencies.length ? "blocked" : "planned"
    }));

  const items = [...approvalItems, ...activationItems, ...scheduleItems];
  const blockers = approvalItems.map((item) => item.title);

  return {
    id: "work-package:" + campaign.id,
    decisionId,
    title: campaign.title.en,
    objective: campaign.objective.en,
    state: "proposed",
    estimatedMinutes: items.reduce((sum, item) => sum + item.estimatedMinutes, 0),
    items,
    blockers,
    source: "campaign-plan"
  };
}
