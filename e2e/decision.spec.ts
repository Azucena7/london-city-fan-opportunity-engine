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

test.describe("engine draft adoption on a fixture without a campaign plan", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "desktop flow");
  // Crystal Palace (28 Oct) has no curated campaign plan, so its brief opens with an engine draft.
  const draftBrief = "/app/matches/2026-10-28-cry-h";

  test("anonymous visitors see the draft but cannot adopt it", async ({ page }) => {
    await page.goto(draftBrief);
    const card = page.getByRole("region", { name: "Prepared move · engine draft" });
    await expect(card).toContainText("Sign in with club access to adopt this draft");
    await expect(card.getByRole("button")).toHaveCount(0);
  });

  test("a member sets a draft aside only with a reason, then adopts it as the working plan", async ({ page }) => {
    const posted: Array<Record<string, unknown>> = [];
    let events: Array<Record<string, unknown>> = [];
    await page.route("**/api/auth/session", (route) => route.fulfill({
      json: { configured: true, authenticated: true, clubs: [{ id: "club-1", name: "Demo club", role: "admin" }] }
    }));
    await page.route("**/api/decision-history**", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        posted.push(body);
        events = [...events, { id: String(events.length), event_type: body.eventType, state: body.state, label: body.label, detail: body.detail, created_at: new Date().toISOString() }];
        return route.fulfill({ json: { persistence: "club", recorded: true } });
      }
      return route.fulfill({ json: { persistence: "club", events } });
    });

    await page.goto(draftBrief);
    const card = page.getByRole("region", { name: "Prepared move · engine draft" });
    await card.getByRole("button", { name: "Set aside" }).click();
    await expect(card.getByRole("status")).toHaveText("Add a short reason before setting the draft aside.");
    expect(posted).toHaveLength(0);

    await card.getByRole("button", { name: "Use as the working plan" }).click();
    await expect(card).toContainText("Engine draft adopted as the working plan");
    await expect(card.getByRole("button", { name: "Adopted as working plan" })).toBeDisabled();
    expect(posted[0]).toMatchObject({
      eventType: "recommended",
      sourceType: "engine",
      state: "draft-adopted",
      decisionId: "fixture:2026-10-28-cry-h",
      subjectType: "fixture"
    });
    // Adopting is not the club's verdict: the human decision bar still asks for one.
    await page.evaluate(() => document.querySelectorAll("details").forEach((panel) => { panel.open = true; }));
    const bar = page.getByRole("complementary", { name: "Human decision on the recommendation" });
    await expect(bar).toBeVisible();
    await expect(bar).not.toContainText("Club decision recorded");
  });
});

test("the brief says whether the play is feasible, and who owns it, before the build", async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), "desktop flow");
  await page.goto(brief);
  const verdict = page.getByLabel("Can we do it?");
  await expect(verdict).toContainText(/Not yet · \d+ approval gates? open|No approval gate open/);
  await expect(verdict).toContainText("Owner:");
  await page.getByRole("link", { name: "Check feasibility →" }).click();
  await expect(page.locator("#readiness")).toBeVisible();
});

test("the brief keeps the decision within reach once its summary scrolls away", async ({ page }) => {
  await page.goto("/app/matches/2026-10-18-eve-h");
  await page.waitForLoadState("networkidle");
  const bar = page.getByRole("complementary", { name: "Decision bar" });
  // At the top the summary already shows the decision, so the bar stays out of the way.
  await expect(bar).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, document.getElementById("decision")!.getBoundingClientRect().bottom + window.scrollY + 400));
  await expect(bar).toBeVisible();
  await expect(bar).toContainText(/approval gate|No approval gate open/);
  // It only links: the decision opens in its own section, where it is recorded.
  await bar.getByRole("link", { name: /Decide →|Review the hold →/ }).click();
  await expect(page).toHaveURL(/#human-decision$/);
  await expect(page.getByRole("region", { name: "Human decision" })).toBeInViewport();
  await expect(bar).toBeHidden();
});

test("the brief shows what the decision stands on before anyone approves it", async ({ page }) => {
  await page.goto("/app/matches/2026-10-18-eve-h");
  const inputs = page.getByRole("region", { name: "What this decision stands on" });
  await expect(inputs).toBeVisible();
  for (const label of ["Known", "Assumed", "Missing"]) await expect(inputs.getByRole("heading", { name: new RegExp("^" + label + " \\d+$") })).toBeVisible();
  // Without club data the audience and outcome evidence are missing, never presented as known.
  await expect(inputs.locator("[data-tone='missing']")).not.toContainText("Nothing");
  await inputs.getByRole("link", { name: "All evidence →" }).click();
  await expect(page).toHaveURL(/#signals$/);
});
