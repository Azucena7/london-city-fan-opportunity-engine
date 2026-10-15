import { expect, test } from "@playwright/test";

// The pilot page as a visitor sees it: the bounded offer, the four public cycles with states
// read from the calendar, and the three end-of-pilot paths.

test("pilot shows the four public cycles with calendar states and the proof-of-method boundary", async ({ page }) => {
  await page.goto("/pilot");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Point the engine at your next 4–6 fixtures.");
  const window = page.getByRole("region", { name: "Four cycles. Four different decisions. One learning system." });
  const cycles = window.getByRole("listitem");
  await expect(cycles).toHaveCount(4);
  for (const fixture of ["Brighton · 26 Sep", "Everton · 18 Oct", "Crystal Palace · 28 Oct", "Manchester City · 1 Nov"]) {
    await expect(window.getByRole("heading", { name: fixture })).toHaveCount(1);
  }
  // On the frozen product date Everton is the next fixture ahead, so it is the active cycle.
  await expect(cycles.filter({ hasText: "Everton · 18 Oct" })).toHaveAttribute("data-state", "active");
  await expect(window).toContainText("proof of method, not proof of club adoption");
});

test("pilot ends on a decision about AVELA and its links carry pilot attribution", async ({ page }) => {
  await page.goto("/pilot");
  const paths = page.getByRole("region", { name: "The output is a decision about AVELA too." });
  for (const path of ["CONTINUE", "ADJUST", "STOP"]) await expect(paths.getByText(path, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the Operating Pack" })).toHaveAttribute("href", /\/pilot\/operating-pack\?utm_source=pilot/);
  for (const href of await page.locator('main > :not(nav) a[href*="utm_"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    expect(href).toContain("utm_source=pilot&utm_medium=internal_cta");
  }
  // A stray escaped newline once rendered as text between the closing links.
  await expect(page.locator("main")).not.toContainText("\\n");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});
