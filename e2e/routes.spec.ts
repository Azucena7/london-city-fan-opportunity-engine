import { expect, test } from "@playwright/test";

// Canonical surfaces from the product architecture. Each must render, expose exactly one
// page heading and run without uncaught browser errors.
const appRoutes = [
  "/app",
  "/app/matches",
  "/app/campaigns",
  "/app/players",
  "/app/sponsors",
  "/app/contracts",
  "/app/season",
  "/app/learning",
  "/app/executive",
  "/app/sources",
  "/app/setup",
  "/app/access",
  "/app/help",
  "/app/demo"
];

const publicRoutes = [
  "/",
  "/for-clubs",
  "/pilot",
  "/pilot/operating-pack",
  "/pilot/rehearsal",
  "/cases",
  "/case-study",
  "/live/london-city"
];

for (const route of [...appRoutes, ...publicRoutes]) {
  test(`${route} renders one page heading without browser errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route);
    expect(response?.status(), `${route} status`).toBe(200);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toHaveCount(1);
    expect(errors, `${route} uncaught errors`).toEqual([]);
  });
}

test("Radar opens a fixture Opportunity Brief", async ({ page }) => {
  await page.goto("/app/matches");
  const brief = page.locator('a[href^="/app/matches/"]').first();
  const href = await brief.getAttribute("href");
  expect(href).toBeTruthy();
  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Opportunity workspace sections" })).toBeVisible();
});

// /app streams its loading state first, so the HTTP status is already 200 when the
// fixture lookup fails; assert the rendered not-found state instead.
test("unknown fixture renders the not-found state", async ({ page }) => {
  await page.goto("/app/matches/not-a-fixture");
  await expect(page.getByRole("heading", { level: 1, name: "Workspace not found" })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
});
