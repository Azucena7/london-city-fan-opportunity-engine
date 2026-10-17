import { expect, test, type Page } from "@playwright/test";

// Club setup for a signed-in club admin, with the club APIs mocked in the browser.
async function signIn(page: Page, setup: Record<string, unknown> | null, venuesAvailable = true) {
  const saved: Array<Record<string, unknown>> = [];
  await page.route("**/api/auth/session", (route) => route.fulfill({
    json: { configured: true, authenticated: true, clubs: [{ id: "club-1", name: "Demo club", role: "admin" }] }
  }));
  await page.route("**/api/club-setup**", async (route) => {
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      saved.push(body);
      return route.fulfill({ json: { persistence: "club", setup: {}, venuesSaved: venuesAvailable } });
    }
    return route.fulfill({ json: { persistence: "club", setup, venuesAvailable } });
  });
  return saved;
}

test("a club admin records a venue's capacity once in Club setup", async ({ page }) => {
  const saved = await signIn(page, { fixture_source: "manual", venues: [] });
  await page.goto("/app/setup");
  const venues = page.getByRole("article", { name: "Venues and capacity" });
  await expect(venues).toBeVisible();
  await expect(page.getByLabel("Club setup progress")).toContainText("Add capacity");

  await venues.getByRole("button", { name: "Add venue" }).click();
  const venue = venues.getByRole("group");
  await venue.getByLabel("Venue name").fill("CopperJax Community Stadium");
  await venue.getByLabel("Other names in fixture feeds").fill("The CopperJax Community Stadium, Bromley\nHayes Lane");
  await venue.getByLabel("Total capacity").fill("5,000");
  await venue.getByLabel("Sellable for home fixtures").fill("4500");
  await venue.getByLabel("Capacity state").selectOption("club-confirmed");
  await venue.getByLabel("Source").fill("Safety certificate 2026/27");
  await expect(venue.getByLabel("Regular home venue")).toBeChecked();
  await expect(page.getByLabel("Club setup progress")).toContainText("1 with capacity");

  await page.getByRole("button", { name: "Save and use for next fixture" }).click();
  await expect(page.getByRole("status")).toHaveText("Club setup saved to the club workspace.");
  expect(saved).toHaveLength(1);
  expect(saved[0].venues).toEqual([expect.objectContaining({
    name: "CopperJax Community Stadium",
    aliases: ["The CopperJax Community Stadium, Bromley", "Hayes Lane"],
    home: true,
    totalCapacity: "5000",
    sellableCapacity: "4500",
    capacityState: "club-confirmed",
    source: "Safety certificate 2026/27"
  })]);
});

test("Club setup still saves when the club database has no venues column yet", async ({ page }) => {
  const saved = await signIn(page, { fixture_source: "manual" }, false);
  await page.goto("/app/setup");
  const venues = page.getByRole("article", { name: "Venues and capacity" });
  await expect(venues.getByRole("note")).toHaveText("Venues need a club database update before they can be saved here.");
  await expect(venues.getByRole("button", { name: "Add venue" })).toHaveCount(0);
  await page.getByRole("button", { name: "Save and use for next fixture" }).click();
  await expect(page.getByRole("status")).toHaveText("Club setup saved to the club workspace.");
  expect(saved[0]).not.toHaveProperty("venues");
});

test("a club admin chooses the execution tool that receives approved work", async ({ page }) => {
  await signIn(page, { fixture_source: "manual" });
  const posted: Array<Record<string, unknown>> = [];
  let saved = false;
  await page.route("**/api/work-system/connection**", async (route) => {
    if (route.request().method() === "POST") {
      posted.push(route.request().postDataJSON() as Record<string, unknown>);
      saved = true;
      return route.fulfill({ json: { saved: true, webhookConfigured: true } });
    }
    return route.fulfill({ json: saved
      ? { enabled: true, webhookConfigured: true, connections: [{ id: "conn-1", system: "monday", label: "Marketing board", state: "connected", last_sync_at: null }], rules: [{ id: "r1", connection_id: "conn-1", categories: ["approval", "schedule"], enabled: true }] }
      : { enabled: true, webhookConfigured: true, connections: [], rules: [] } });
  });
  await page.goto("/app/setup");
  const panel = page.getByRole("region", { name: "Where approved work is executed" });
  await expect(panel).toContainText("Webhook configured");
  await expect(panel).toContainText("Configured is not the same as working");

  await panel.getByLabel("Tool").selectOption("monday");
  await panel.getByLabel("Name shown to the team").fill("Marketing board");
  await panel.getByLabel(/Activation/).uncheck();
  await panel.getByRole("button", { name: "Use this tool" }).click();
  await expect(panel.getByRole("status")).toHaveText("Saved. Approved work can now be sent from each Opportunity Brief.");
  expect(posted).toEqual([{ clubId: "club-1", system: "monday", label: "Marketing board", categories: ["approval", "schedule"] }]);
  await expect(panel.getByRole("button", { name: "Update execution tool" })).toBeVisible();
  await expect(panel).toContainText("Marketing board · connected");
});
