import type { WorkPackage, WorkPackageItem, WorkSystemId } from "@/lib/workSystemOrchestration";

export type WorkRoutingRule = {
  id: string;
  label: string;
  enabled: boolean;
  categories: Array<WorkPackageItem["category"]>;
  destinationSystem: WorkSystemId;
  connectionRef: string;
  requireConfirmation: boolean;
  priority: number;
};

export type RoutedWorkPackage = {
  workPackageId: string;
  destinationSystem: WorkSystemId | null;
  connectionRef: string | null;
  matchedRuleId: string | null;
  requireConfirmation: boolean;
  unroutedItemKeys: string[];
  rationale: string;
};

function categorySet(workPackage: WorkPackage) {
  return new Set(workPackage.items.map((item) => item.category));
}

export function routeWorkPackage({
  workPackage,
  rules
}: {
  workPackage: WorkPackage;
  rules: WorkRoutingRule[];
}): RoutedWorkPackage {
  const categories = categorySet(workPackage);
  const candidates = rules
    .filter((rule) => rule.enabled)
    .filter((rule) => rule.categories.some((category) => categories.has(category)))
    .sort((a,b) => b.priority - a.priority || a.label.localeCompare(b.label));

  const selected = candidates[0] ?? null;
  if (!selected) {
    return {
      workPackageId: workPackage.id,
      destinationSystem: null,
      connectionRef: null,
      matchedRuleId: null,
      requireConfirmation: true,
      unroutedItemKeys: workPackage.items.map((item) => item.key),
      rationale: "No enabled work-system routing rule matches this package. Keep the package in AVELA preview only."
    };
  }

  const routedCategories = new Set(selected.categories);
  const unroutedItemKeys = workPackage.items
    .filter((item) => !routedCategories.has(item.category))
    .map((item) => item.key);

  return {
    workPackageId: workPackage.id,
    destinationSystem: selected.destinationSystem,
    connectionRef: selected.connectionRef,
    matchedRuleId: selected.id,
    requireConfirmation: selected.requireConfirmation,
    unroutedItemKeys,
    rationale: unroutedItemKeys.length
      ? `Route matching work to ${selected.destinationSystem}; ${unroutedItemKeys.length} item(s) remain outside this rule.`
      : `Route the full package to ${selected.destinationSystem} using the highest-priority matching rule.`
  };
}

export function defaultRoutingRules(): WorkRoutingRule[] {
  return [];
}
