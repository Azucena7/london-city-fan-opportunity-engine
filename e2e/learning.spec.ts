import { expect, test } from "@playwright/test";

test("Learning keeps Delivered (the club's tool) apart from Worked (measurement)", async ({ page }) => {
  await page.route("**/api/auth/session", (route) => route.fulfill({
    json: { configured: true, authenticated: true, clubs: [{ id: "club-1", name: "Demo club", role: "admin" }] }
  }));
  await page.route("**/api/work-system/status**", (route) => route.fulfill({ json: {
    enabled: true,
    packages: [
      { id: "p1", connection_id: "c1", package_key: "wp", title: "Activation", sync_state: "synced", item_count: 3, completed_count: 2, blocked_count: 1, estimated_minutes: 60 },
      { id: "p2", connection_id: "c1", package_key: "wp2", title: "Draft", sync_state: "proposed", item_count: 4, completed_count: 0, blocked_count: 0, estimated_minutes: 30 }
    ],
    items: [],
    connections: []
  } }));
  await page.goto("/app/learning");
  const panel = page.getByRole("region", { name: "Delivered and worked" });
  await expect(panel).toContainText("2 of 3 tasks done");
  await expect(panel).toContainText("1 blocked.");
  await expect(panel).toContainText("Worked · business impact");
  await expect(panel).toContainText("Delivered is not Worked");
  await expect(panel).not.toContainText("%");
});

test("Learning says when nothing was sent instead of implying delivery", async ({ page }) => {
  await page.goto("/app/learning");
  const panel = page.getByRole("region", { name: "Delivered and worked" });
  await expect(panel.getByRole("article").first()).toContainText(/Not available|Not sent to a work tool/);
});
