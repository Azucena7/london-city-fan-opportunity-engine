import { expect, test, type Page } from "@playwright/test";

// Radar, Campaigns and Player assets, checked as a signed-out visitor sees them: rendered copy,
// links and interactions, not the source text of the components that produce them.

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.querySelectorAll("details").forEach((panel) => { panel.open = true; }));
  return page.locator("#main-content");
}

test("Radar ranks fixtures by opportunity and signal movement, and opens each brief", async ({ page }) => {
  const radar = await open(page, "/app/matches");
  for (const text of ["Opportunity score", "Signal movement", "Opportunity"]) await expect(radar, text).toContainText(text);
  await expect(radar).not.toContainText("Growth opportunity");
  const brief = radar.getByRole("link", { name: /Open opportunity brief/ }).first();
  await expect(brief).toHaveAttribute("href", /^\/app\/matches\/[\w-]+$/);
});

test("Radar's Opportunity Explorer keeps its driver bars separate from any score", async ({ page }) => {
  const radar = await open(page, "/app/matches");
  for (const text of ["Opportunity map", "Campaign readiness", "Signal pulse", "Higher = stronger opportunity"]) await expect(radar, text).toContainText(text);
  await expect(radar).toContainText(/driver bars are separate signals, not an additive score formula/i);
});

test("Campaigns shows the portfolio, the next decision and campaigns that need no fixture", async ({ page }) => {
  const campaigns = await open(page, "/app/campaigns");
  for (const text of ["Portfolio overview", "Needs decision", "Next decision", "AVELA drafts. The club approves", "Campaigns that do not need a fixture to exist"]) {
    await expect(campaigns, text).toContainText(text);
  }
  await expect(campaigns).toContainText(/season tickets, Christmas, retail, community and sponsor activity/i);
  // Commercial campaigns hand player planning their own context.
  await expect(campaigns.locator('a[href^="/app/players?campaign="]').first()).toHaveCount(1);
});

test("every campaign shows a lifecycle stage and never claims to be live", async ({ page }) => {
  const campaigns = await open(page, "/app/campaigns");
  const text = await campaigns.innerText();
  expect(text).toMatch(/\b(Draft|Review|Ready|Handoff|Learning)\b/);
  expect(text).not.toMatch(/\bLive\b/);
});

test("Player assets walks a guided pack funnel with an explicit approval boundary", async ({ page }) => {
  const players = await open(page, "/app/players");
  await expect(page.getByRole("navigation", { name: "Player pack workflow" })).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Pack Optimizer recommendation" })).toHaveCount(1);
  for (const text of [
    "Campaign context", "Players needed", "Best combinations", "Recommended pack",
    "Step 02 · Constraints", "Step 03 · Recommended pack", "Step 04 · Compare", "Decision evidence",
    "Momentum Monitor", "Live scenario", "What changed"
  ]) {
    await expect(players, text).toContainText(text);
  }
  for (const id of ["campaign-context", "constraints", "availability", "player-status", "momentum", "packs", "compare", "scenario", "commit"]) {
    await expect(players.locator(`#${id}`), id).toHaveCount(1);
  }
  for (const id of ["compare", "scenario"]) await expect(players.locator(`details#${id}`), id).toHaveCount(1);
});

test("changing the pack recalculates against the recommendation and can be reset", async ({ page }) => {
  const players = await open(page, "/app/players");
  const scenario = players.locator("#scenario");
  await expect(scenario).toContainText("This is the current AVELA recommendation.");
  await players.getByRole("button", { name: "Remove from pack" }).filter({ visible: true }).first().click();
  await expect(scenario).toContainText("AVELA recalculated this combination.");
  await expect(scenario).toContainText("vs recommended");
  await scenario.getByRole("button", { name: "Reset recommendation" }).click();
  await expect(scenario).toContainText("This is the current AVELA recommendation.");
});

test("a campaign opened from Campaigns keeps its context in Player assets", async ({ page }) => {
  const campaigns = await open(page, "/app/campaigns");
  const href = await campaigns.locator('a[href^="/app/players?campaign="]').first().getAttribute("href");
  const players = await open(page, href!);
  await expect(players).toContainText("Opened from a campaign");
  await expect(players).toContainText("The selected campaign is preserved in the player planner.");
  const standalone = await open(page, "/app/players");
  await expect(standalone).toContainText("Standalone player planning");
});

test("Learning shows when each measurement window can close, without closing it early", async ({ page }) => {
  // The opener (4 Sep) is 40 days old on the frozen snapshot date (14 Oct).
  const learning = await open(page, "/app/learning?fixture=2026-09-04-mun-h");
  const windows = page.getByRole("region", { name: "Measurement windows" }).getByRole("listitem");
  await expect(windows).toHaveCount(5);
  await expect(windows.nth(0)).toContainText("T+1");
  await expect(windows.nth(0)).toContainText("Public facts in");
  for (const index of [1, 2]) await expect(windows.nth(index)).toContainText("Due · needs club data");
  await expect(windows.nth(3)).toContainText("T+60 · 3 Nov 2026");
  for (const index of [3, 4]) await expect(windows.nth(index)).toContainText("Not due yet");
  await expect(windows.nth(4)).toContainText("T+90 · 3 Dec 2026");
  for (const index of [1, 2, 3, 4]) await expect(windows.nth(index)).not.toContainText("Public facts in");
  await expect(learning).toContainText("When each part of this fixture can be closed");
});

test("without club data, Learning says which supporter and capacity evidence is missing", async ({ page }) => {
  await open(page, "/app/learning?fixture=2026-09-26-bha-h");
  const journey = page.getByRole("region", { name: "Supporter journey" });
  await expect(journey).toContainText("Requires the club's authorised ticketing and access aggregate");
  await expect(journey.getByRole("link", { name: /Check data sources/ })).toHaveAttribute("href", "/app/sources");
  const facts = page.getByRole("region", { name: "Observed fixture facts" });
  await expect(facts).toContainText("Occupancy");
  await expect(facts).toContainText("Capacity not configured");
  await expect(facts).not.toContainText(/\d+% of (sellable|total) capacity/);
});

test("without club data, the brief offers no CRM audience and says why", async ({ page }) => {
  const main = await open(page, "/app/matches/2026-10-18-eve-h");
  const audiences = main.getByRole("region", { name: "Audiences for the club CRM" });
  await expect(audiences).toContainText("Requires the club's authorised ticketing aggregate");
  await expect(audiences.getByRole("button", { name: "Copy criteria" })).toHaveCount(0);
  await expect(audiences).toContainText("No supporter list leaves the club's systems");
});

test("Contracts explains its signed-out panels, fits the screen and toggles drawer labels", async ({ page }) => {
  await page.goto("/app/contracts");
  await expect(page.getByText("Sign in as a club member to see the decisions a verified clause affects.")).toBeVisible();
  await expect(page.getByText("Sign in as a club member to review extracted clauses.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  const drawer = page.locator("details").filter({ hasText: "Sponsor contracts" }).first();
  const label = drawer.locator("summary b");
  // Both words are in the DOM; only one may be shown at a time.
  await expect.poll(() => label.innerText()).toMatch(/^open$/i);
  await drawer.locator("summary").click();
  await expect.poll(() => label.innerText()).toMatch(/^close$/i);
});

test("workspace controls carry accessible names and scroll strips are reachable by keyboard", async ({ page }) => {
  await page.goto("/app/players");
  await expect(page.getByRole("combobox", { name: "Campaign context" })).toBeVisible();
  await page.goto("/app/campaigns");
  await expect(page.getByRole("progressbar").first()).toBeVisible();
  await page.goto("/app");
  await expect(page.getByRole("region", { name: "Next 30 days" })).toHaveAttribute("tabindex", "0");
});

test("Radar map places fixtures by urgency and keeps close bubbles apart", async ({ page }) => {
  await page.goto("/app/matches");
  const points = page.locator("[class*='mapPoint']");
  await expect(points.first()).toBeVisible();
  const boxes = await points.evaluateAll((els) => els.map((el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }));
  const rows = new Set(boxes.map((box) => Math.round(box.top / 40)));
  expect(rows.size).toBeGreaterThan(1);
  let overlapping = 0;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 6 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 6) overlapping++;
  }
  expect(overlapping).toBe(0);

test("Radar keeps a signal log that says what each signal measurably changed", async ({ page }) => {
  await page.goto("/app/matches#signal-log");
  const log = page.locator("section").filter({ has: page.getByRole("heading", { name: "What arrived and what it changed" }) });
  await expect(log).toBeVisible();
  await expect(log.getByText(/signals, \d+ in the last 7 days/)).toBeVisible();
  const table = log.getByRole("table", { name: /newest first/ });
  await expect(table.getByRole("row")).not.toHaveCount(0);
  await expect(table.getByText(/No change|Raised priority|Changed state|Changed confidence|Not on the Radar/).first()).toBeVisible();
  await page.goto("/app");
  await expect(page.getByRole("link", { name: "Signal log →" })).toHaveAttribute("href", "/app/matches#signal-log");
});
