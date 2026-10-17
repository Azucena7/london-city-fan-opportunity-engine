import { expect, test } from "@playwright/test";

// For Clubs as a visitor sees it: the offer, the boundaries it states and the request form.

test("For Clubs states the bounded offer and the London City boundary", async ({ page }) => {
  await page.goto("/for-clubs");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Read your next 4⁠–⁠6 matches early.");
  await expect(page.getByText("4–6 fixtures · 1–2 priority decisions · measurement agreed up front")).toBeVisible();
  for (const name of ["Define. Test. Learn.", "Today’s reads, and what a pilot adds.", "Start without connecting everything."]) {
    await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(1);
  }
  const proof = page.getByRole("region", { name: "Public method, no private access." });
  await expect(proof).toContainText("does not imply the club is a customer or has seen or used AVELA");
  for (const href of await page.locator('main > :not(nav) a[href*="utm_"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    expect(href).toContain("utm_source=for_clubs&utm_medium=internal_cta");
  }
});

test("For Clubs switches to Spanish without losing the request form", async ({ page }) => {
  await page.goto("/for-clubs");
  await page.getByRole("group", { name: "Language" }).getByRole("button", { name: "Español" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Anticípate a tus próximos");
  await expect(page.getByLabel("Email de trabajo")).toBeVisible();
});

test("the pilot request form is labelled and asks for consent before sending", async ({ page }) => {
  await page.goto("/for-clubs#demo");
  const form = page.getByRole("region", { name: "Name the decision to improve." });
  for (const label of ["Club", "Your role", "Work email", "Priority (optional)"]) await expect(form.getByLabel(label)).toBeVisible();
  await expect(form.getByRole("checkbox")).toHaveAttribute("required", "");
  await expect(form.getByRole("button", { name: "Request a conversation →" })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test("the club page shows a short tour recorded on the real app, labelled as a public demonstration", async ({ page }) => {
  await page.goto("/for-clubs");
  const tour = page.getByRole("region", { name: /The product, in 50 seconds/ });
  const video = tour.locator("video");
  await expect(video).toHaveAttribute("src", "/media/avela-tour.mp4");
  await expect(video).toHaveAttribute("poster", "/media/avela-tour-poster.jpg");
  await expect(tour).toContainText("London City is not an AVELA customer");
  const response = await page.request.get("/media/avela-tour.mp4");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("video/mp4");
});
