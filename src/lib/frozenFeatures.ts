// Internal work-management features frozen by decision of October 2026 (CLAUDE.md, "Execution
// boundary"): request tracking, workload/capacity planning and operational continuity. The club's
// own tool executes approved work and AVELA reads status back in the execution monitor.
// Their APIs and data stay in place until a migration is agreed; only the panels are hidden.
// Set AVELA_INTERNAL_WORK_MANAGEMENT=on to show them again, e.g. to review or export existing data.
export function internalWorkManagementVisible() {
  return process.env.AVELA_INTERNAL_WORK_MANAGEMENT?.trim().toLowerCase() === "on";
}
