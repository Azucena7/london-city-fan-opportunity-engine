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

test("app page titles keep workspace scale, not landing-page scale", async ({ page, isMobile }) => {
  for (const route of ["/app", "/app/matches", "/app/players", "/app/executive"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const size = await page.locator("h1").evaluate((heading) => getComputedStyle(heading).fontSize);
    expect(size, `${route} h1`).toBe(isMobile ? "19px" : "25px");
  }
});

test("core work is visible without opening a panel", async ({ page }) => {
  await page.goto("/app/campaigns");
  await expect(page.getByRole("heading", { name: "All campaign work" })).toBeVisible();
  await expect(page.locator("header", { hasText: "Needs decision" })).toBeVisible();
  // Fixtures are shown by name, not by internal id.
  await expect(page.locator("text=/\\d{4}-\\d{2}-\\d{2}-[a-z]+-h/")).toHaveCount(0);

  await page.goto("/app/sponsors");
  const queue = page.getByRole("list", { name: "Sponsor prospecting queue" });
  await expect(queue).toBeVisible();
  expect(await queue.getByRole("listitem").count()).toBeGreaterThan(0);
  await expect(page.locator('[role="table"]')).toHaveCount(0);
});

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
