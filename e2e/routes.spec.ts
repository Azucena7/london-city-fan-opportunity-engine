import { expect, test } from "@playwright/test";

// Canonical surfaces from the product architecture. Each must render, expose exactly one
// page heading and run without uncaught browser errors.
const appRoutes = [
  "/app",
  "/app/matches",
  "/app/campaigns",
  "/app/campaigns/christmas-2026",
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
  // System states must not claim a destination (it used to mark Home as current).
  await expect(page.locator('aside a[aria-current="page"]')).toHaveCount(0);
});

test("Radar shows the news radar as unreviewed context", async ({ page }) => {
  await page.goto("/app/matches");
  await page.waitForLoadState("networkidle");
  const panel = page.locator("section", { hasText: "Unreviewed headlines" }).last();
  await expect(panel).toContainText("News radar");
  await expect(panel).toContainText("They never change a score, confidence or rank.");
  await expect(panel).toContainText("Watching: London City Lionesses (UK)");
});

test("Sources lists every registered source and filters by state", async ({ page }) => {
  await page.goto("/app/sources");
  await page.waitForLoadState("networkidle");
  const table = page.getByRole("table", { name: /Source register/ });
  const all = await table.locator("tbody tr").count();
  expect(all).toBeGreaterThanOrEqual(13);
  const filters = page.getByRole("navigation", { name: "Filter the source register" });
  await filters.getByRole("link", { name: /Needs attention/ }).click();
  await expect(page).toHaveURL(/state=attention/);
  await expect(filters.getByRole("link", { name: /Needs attention/ })).toHaveAttribute("aria-current", "true");
  const attention = await table.locator("tbody tr").count();
  expect(attention).toBeLessThan(all);
  await expect(table.locator("tbody tr", { hasText: "Operational" })).toHaveCount(0);
});

test("Radar filters the next opportunities by attention state", async ({ page }) => {
  await page.goto("/app/matches");
  await page.waitForLoadState("networkidle");
  const filters = page.getByRole("navigation", { name: "Filter next opportunities by attention" });
  // Opportunity rows are the fixture links that start with their radar rank (#n).
  const list = page.locator('a[href^="/app/matches/"]').filter({ hasText: /^#\d+/ });
  const all = await list.count();
  await filters.getByRole("link", { name: /^Review/ }).click();
  await expect(page).toHaveURL(/attention=review/);
  await expect(filters.getByRole("link", { name: /^Review/ })).toHaveAttribute("aria-current", "true");
  const reviewCount = Number(await filters.getByRole("link", { name: /^Review/ }).locator("span").textContent());
  await expect(list).toHaveCount(reviewCount);
  expect(reviewCount).toBeLessThanOrEqual(all);
});

test("every campaign has an address: commercial records render, fixture campaigns open their brief", async ({ page }) => {
  await page.goto("/app/campaigns");
  await page.waitForLoadState("networkidle");
  const record = page.getByRole("link", { name: "Season tickets 2027" });
  await expect(record).toHaveAttribute("href", "/app/campaigns/season-tickets-2027");
  await page.goto("/app/campaigns/season-tickets-2027");
  await expect(page.locator("h1").first()).toHaveText("Season tickets 2027");
  await expect(page.getByText("Synthetic demo brief.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Choose the 4 players/ })).toHaveAttribute("href", "/app/players?campaign=season-tickets-2027");

  await page.goto("/app/campaigns/everton-home-2026-10-18");
  await expect(page).toHaveURL(/\/app\/matches\/2026-10-18-eve-h#execute$/);

  // Streaming /app/loading.tsx means notFound() answers 200, so assert the not-found state itself.
  await page.goto("/app/campaigns/not-a-campaign");
  await expect(page.getByRole("heading", { level: 1, name: "Workspace not found" })).toBeVisible();
});

test("Players lists the constraints before recommending a pack", async ({ page }) => {
  await page.goto("/app/players");
  await page.waitForLoadState("networkidle");
  const constraints = page.getByRole("list", { name: "Constraints affecting this campaign" });
  await expect(constraints.getByRole("listitem").first()).toContainText(/International (duty|window)|pre-alert/);
});

test("public commercial pages share the public header, never the workspace sidebar", async ({ page }) => {
  for (const route of ["/", "/for-clubs", "/pilot", "/pilot/operating-pack", "/pilot/rehearsal", "/cases", "/live/london-city"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("navigation", { name: "AVELA marketing and commercial product navigation" }), route).toHaveCount(1);
    await expect(page.getByRole("complementary", { name: "AVELA club app navigation" }), route).toHaveCount(0);
  }
});

test("home leads with the Opportunity Engine and keeps live and pilot signals apart", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("See what could change the match.");
  const engine = page.getByRole("figure", { name: "AVELA Opportunity Engine" });
  await expect(engine).toBeVisible();
  await expect(engine.getByText("Reading now").first()).toBeVisible();
  await expect(engine.getByRole("listitem").filter({ hasText: "Transport" })).toContainText("In a pilot");
  for (const output of ["What changed", "Why it matters", "Prepared move"]) {
    await expect(engine.getByText(output, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/London City is an independent demonstration, not a customer/)).toBeVisible();
  // The home is full-bleed: its first band spans the viewport without horizontal scroll.
  const width = page.viewportSize()!.width;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  expect(await page.locator("main").evaluate((main) => main.getBoundingClientRect().width)).toBe(width);
});
