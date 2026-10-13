import { expect, test, type Page } from "@playwright/test";

// The Everton fixture has open approval gates in the public demo data.
const brief = "/app/matches/2026-10-18-eve-h";

async function openPanels(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.querySelectorAll("details").forEach((panel) => { panel.open = true; }));
}

test.describe("human decision on the Opportunity Brief", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "desktop flow");

  test("anonymous visitors see the recommendation but cannot record a decision", async ({ page }) => {
    await page.goto(brief);
    await openPanels(page);
    const bar = page.getByRole("complementary", { name: "Human decision on the recommendation" });
    await expect(bar).toContainText("Sign in with club access to record");
    await expect(bar.getByRole("button")).toHaveCount(0);
  });

  test("a member records one verdict and decision memory reflects it", async ({ page }) => {
    const posted: Array<Record<string, unknown>> = [];
    let events: Array<Record<string, unknown>> = [];
    await page.route("**/api/auth/session", (route) => route.fulfill({
      json: { configured: true, authenticated: true, clubs: [{ id: "club-1", name: "Demo club", role: "admin" }] }
    }));
    await page.route("**/api/decision-history**", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        posted.push(body);
        events = [...events, { id: String(events.length), event_type: body.eventType, state: body.state, label: body.label, detail: body.detail, source_type: "user", created_at: new Date().toISOString() }];
        return route.fulfill({ json: { persistence: "club", recorded: true } });
      }
      return route.fulfill({ json: { persistence: "club", events } });
    });

    await page.goto(brief);
    await openPanels(page);
    const bar = page.getByRole("complementary", { name: "Human decision on the recommendation" });
    const memory = page.getByRole("region", { name: "Decision history and execution confirmation" });

    await expect(bar.getByRole("button", { name: "Approve" })).toBeDisabled();
    await expect(memory).toContainText("Decide in step 05");
    await expect(memory.getByRole("button", { name: "Record final decision" })).toHaveCount(0);

    await bar.getByRole("button", { name: "Hold" }).click();
    await expect(bar.getByRole("status")).toHaveText("Add a short reason before choosing hold.");
    expect(posted).toHaveLength(0);

    await bar.getByRole("textbox").fill("Wait for the sponsor's answer on Friday.");
    await bar.getByRole("button", { name: "Hold" }).click();
    await expect(bar).toContainText("On hold");
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({ eventType: "reviewed", state: "human-hold", decisionId: "fixture:2026-10-18-eve-h", subjectType: "fixture" });

    await expect(memory).toContainText("On hold");
    await expect(memory).not.toContainText("Decide in step 05");
  });
});

test("the brief says which sources behind it are not operational", async ({ page }) => {
  await page.goto(brief);
  await page.waitForLoadState("networkidle");
  const coverage = page.getByRole("region", { name: "Evidence coverage" }).last();
  await expect(coverage).toContainText(/(\d+ of \d+|All \d+) sources behind this brief are operational/);
  await expect(coverage.getByRole("link", { name: "Source status →" })).toHaveAttribute("href", "/app/sources");
});

test("the section rail stays in view on desktop and scrolls away on mobile", async ({ page, isMobile }) => {
  await page.goto(brief);
  await page.waitForLoadState("networkidle");
  const rail = page.getByRole("navigation", { name: "Opportunity workspace sections" });
  await page.evaluate(() => window.scrollTo(0, 2500));
  const box = await rail.boundingBox();
  if (isMobile) {
    expect(box?.y ?? -1).toBeLessThan(0);
  } else {
    expect(Math.round(box?.y ?? 0)).toBe(66);
    await rail.getByRole("link", { name: "04 Evidence & impact" }).click();
    await expect(page).toHaveURL(/#evidence$/);
  }
});

test("the rail marks the phase on screen and counts open approval gates", async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), "the rail is sticky on desktop only");
  await page.goto(brief);
  await page.waitForLoadState("networkidle");
  const rail = page.getByRole("navigation", { name: "Opportunity workspace sections" });
  await expect(rail.locator('a[aria-current="location"]')).toHaveAttribute("href", "#decision");
  await rail.locator('a[href="#evidence"]').click();
  await expect(rail.locator('a[aria-current="location"]')).toHaveAttribute("href", "#evidence");
  await expect(rail.locator('a[aria-current="location"]')).toHaveCount(1);
  await expect(rail.locator('a[href="#execute"]')).toHaveAccessibleName(/approval gates? open/);
});

test("Build & route puts the next actions before the campaign and the handoffs", async ({ page }) => {
  await page.goto(brief + "#execute");
  await page.waitForLoadState("networkidle");
  const headings = await page.locator("details", { has: page.locator("#execute") }).locator("h2").allTextContents();
  const at = (text: string) => headings.findIndex((heading) => heading.includes(text));
  expect(at("Review the draft, then execute the next actions.")).toBeGreaterThan(-1);
  expect(at("Review the draft")).toBeLessThan(at("approval-ready campaign"));
  expect(at("approval-ready campaign")).toBeLessThan(at("Hand the work to the people and tools that run it."));
});

test("jumping to a phase keeps its heading clear of the sticky bars", async ({ page }) => {
  await page.goto(brief + "#evidence");
  await page.waitForLoadState("networkidle");
  const covered = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll("body *")]
    .filter((element) => ["sticky", "fixed"].includes(getComputedStyle(element).position) && element.getBoundingClientRect().top < 200 && element.getBoundingClientRect().height < 300)
    .map((element) => element.getBoundingClientRect().bottom)));
  await expect.poll(async () => (await page.locator("#evidence").boundingBox())?.y ?? 0).toBeGreaterThanOrEqual(covered);
});
