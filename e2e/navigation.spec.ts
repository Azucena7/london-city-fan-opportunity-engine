import { expect, test } from "@playwright/test";

test.describe("mobile workspace navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile-only behaviour");

  // /app streams a loading shell first; wait for the page to settle so only one sidebar exists.
  const sidebar = (page: import("@playwright/test").Page) =>
    page.getByRole("complementary", { name: "AVELA club app navigation" });

  test("shows the four primary destinations and keeps the rest in More", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");
    const nav = sidebar(page).getByRole("navigation", { name: "Club workflow" });
    for (const label of ["Home", "Radar", "Campaigns", "Players"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    for (const label of ["Sponsors", "Calendar", "Learning"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeHidden();
    }

    const more = sidebar(page).locator("summary");
    await expect(more).toHaveText("More");
    await more.click();
    await expect(sidebar(page).locator("details").getByRole("link", { name: "Sponsors", exact: true })).toBeVisible();
  });

  for (const [route, label] of [
    ["/app/sponsors", "Sponsors"],
    ["/app/season", "Calendar"],
    ["/app/executive", "Executive view"],
    ["/app/contracts", "Contracts"],
    ["/app/sources", "Sources"],
    ["/app/access", "Team"],
    ["/app/help", "Help"]
  ] as const) {
    test(`More carries the active destination on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await expect(sidebar(page).locator("summary")).toHaveText(label);
    });
  }

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

  for (const route of ["/app", "/app/matches", "/for-clubs", "/case-study"]) {
    test(`keyboard focus uses the one solid AVELA outline on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      // Tab past the skip link to the first real control.
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      const outline = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return null;
        const style = getComputedStyle(element);
        return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor };
      });
      expect(outline).toEqual({ style: "solid", width: "3px", color: "rgb(47, 143, 131)" });
    });
  }

  test("topbar icons render as line icons, not filled shapes", async ({ page }) => {
    await page.goto("/app");
    const icons = page.locator('header a[aria-label="Open AVELA help"] svg, header a[aria-label="Open calendar"] svg');
    await expect(icons).toHaveCount(2);
    for (const icon of await icons.all()) {
      const style = await icon.evaluate((svg) => { const s = getComputedStyle(svg); return { fill: s.fill, width: s.width }; });
      expect(style).toEqual({ fill: "none", width: "17px" });
    }
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
