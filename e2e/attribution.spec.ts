import { expect, test } from "@playwright/test";

test("a pilot request keeps the campaign the visitor arrived with", async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), "desktop flow");
  let posted: Record<string, unknown> | null = null;
  await page.route("**/api/commercial-lead", async (route) => {
    posted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ json: { ok: true } });
  });

  await page.goto("/?utm_source=linkedin&utm_medium=social&utm_campaign=launch&utm_content=post-1");
  await page.waitForLoadState("networkidle");
  await page.goto("/for-clubs?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=desktop#demo");
  await page.waitForLoadState("networkidle");

  await page.locator('input[name="clubName"]').fill("Demo club");
  await page.locator('input[name="role"]').fill("Marketing");
  await page.locator('input[name="workEmail"]').fill("person@example.com");
  await page.locator('input[name="consent"]').check();
  await page.locator('form:has(input[name="clubName"]) [type="submit"]').click();

  await expect.poll(() => posted).not.toBeNull();
  expect(posted).toMatchObject({ utmSource: "linkedin", utmMedium: "social", utmCampaign: "launch", utmContent: "post-1" });
});
