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
