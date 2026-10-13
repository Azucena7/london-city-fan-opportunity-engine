import { expect, test } from "@playwright/test";

test.describe("mobile workspace navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile-only behaviour");

  test("shows the four primary destinations and keeps the rest in More", async ({ page }) => {
    await page.goto("/app");
    const nav = page.getByRole("navigation", { name: "Club workflow" });
    for (const label of ["Home", "Radar", "Campaigns", "Players"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    for (const label of ["Sponsors", "Calendar", "Learning"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeHidden();
    }

    const more = page.locator("summary", { hasText: "More" });
    await more.click();
    await expect(page.getByRole("link", { name: "Sponsors", exact: true }).last()).toBeVisible();
  });

  test("More carries the active destination when it lives in the overflow", async ({ page }) => {
    await page.goto("/app/sponsors");
    await page.waitForLoadState("networkidle");
    const summary = page.getByRole("complementary", { name: "AVELA club app navigation" }).locator("summary");
    await expect(summary).toHaveText("Sponsors");
  });

  test("the page does not scroll horizontally", async ({ page }) => {
    for (const route of ["/app", "/app/matches", "/app/campaigns", "/app/players"]) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} horizontal overflow (px)`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("desktop workspace navigation", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "desktop-only behaviour");

  test("marks the current destination with aria-current", async ({ page }) => {
    await page.goto("/app/campaigns");
    const current = page.locator('aside a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("href", "/app/campaigns");
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/app");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
});
