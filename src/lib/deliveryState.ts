// "Delivered" is operational: did the club's tool report the approved work as done?
// It says nothing about whether the work changed demand; that is "Worked", read from measurement.

export type DeliveryPackage = { sync_state: string; item_count: number; completed_count: number; blocked_count: number };

export type DeliveryState =
  | { state: "not-sent" }
  | { state: "in-flight" | "delivered"; done: number; total: number; blocked: number };

export function deliveryState(packages: DeliveryPackage[]): DeliveryState {
  const sent = packages.filter((pkg) => pkg.sync_state !== "proposed" && pkg.sync_state !== "error" && pkg.sync_state !== "archived");
  const total = sent.reduce((sum, pkg) => sum + Math.max(0, pkg.item_count), 0);
  if (!total) return { state: "not-sent" };
  const done = Math.min(total, sent.reduce((sum, pkg) => sum + Math.max(0, pkg.completed_count), 0));
  const blocked = sent.reduce((sum, pkg) => sum + Math.max(0, pkg.blocked_count), 0);
  return { state: done === total ? "delivered" : "in-flight", done, total, blocked };
}
