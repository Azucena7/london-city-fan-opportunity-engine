import { expect, test, type Page } from "@playwright/test";

// The Opportunity Brief, checked as a signed-out visitor sees it: rendered copy, order and
// interactions, not the source text of the components that produce them.
const brief = "/app/matches/2026-10-18-eve-h";

async function openBrief(page: Page) {
  await page.goto(brief);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.querySelectorAll("details").forEach((panel) => { panel.open = true; }));
  return page.locator("#main-content");
}

test("the brief leads with one executive decision before the deep evidence", async ({ page }) => {
  const main = await openBrief(page);
  const cockpit = page.getByRole("region", { name: "Decision at a glance" });
  await expect(cockpit).toHaveAttribute("id", "decision");
  for (const text of ["Recommended play", "Can we do it?", "Opportunity", "Audience", "Confidence", "Next action", "Build this campaign"]) {
    await expect(cockpit, text).toContainText(text);
  }
  // The brief that follows explains the call before any phase is opened.
  for (const text of ["Commercial objective", "Evidence used", "Decision support, not autopilot", "What would change the recommendation?"]) {
    await expect(main, text).toContainText(text);
  }
  // Plan, evidence, signals and impact live in this one workspace, not on retired pages.
  await expect(main.locator('a[href="/decision-room"], a[href="/impact"]')).toHaveCount(0);
});

test("the brief phases run decide, feasibility, build, evidence, human decision, learn", async ({ page }) => {
  const main = await openBrief(page);
  const ids = ["decision", "readiness", "execute", "evidence", "human-decision", "decision-memory"];
  const tops: number[] = [];
  for (const id of ids) {
    const phase = main.locator(`#${id}`);
    await expect(phase, id).toHaveCount(1);
    tops.push(await phase.evaluate((element) => element.getBoundingClientRect().top + window.scrollY));
  }
  expect(tops).toEqual([...tops].sort((a, b) => a - b));
  for (const heading of ["Can we actually do it?", "Make the decision executable", "Why AVELA thinks this", "Human decision", "Decision memory"]) {
    await expect(main).toContainText(heading);
  }
  // Phases 02–06 are collapsible panels so the brief stays short until a phase is opened.
  expect(await page.locator("#main-content details:has(> summary) section[id]").count()).toBeGreaterThanOrEqual(5);

  const rail = page.getByRole("navigation", { name: "Opportunity workspace sections" });
  for (const [label, id] of [["01 Decide", "decision"], ["02 Feasibility", "readiness"], ["03 Build", "execute"], ["04 Evidence", "evidence"], ["05 Human decision", "human-decision"], ["06 Learn", "decision-memory"]]) {
    await expect(rail.getByRole("link", { name: new RegExp(label) })).toHaveAttribute("href", `#${id}`);
  }
});

test("a phase link opens its collapsed panel", async ({ page }) => {
  await page.goto(brief);
  await page.waitForLoadState("networkidle");
  const panel = page.locator("details").filter({ has: page.locator("#human-decision") });
  await expect(panel).not.toHaveAttribute("open", "");
  await page.getByRole("navigation", { name: "Opportunity workspace sections" }).getByRole("link", { name: /05 Human decision/ }).click();
  await expect(panel).toHaveAttribute("open", "");
  await expect(page).toHaveURL(/#human-decision$/);
});

test("the build phase proposes a campaign path with visible effort and no paywall", async ({ page }) => {
  const main = await openBrief(page);
  const build = main.locator("#execute").locator("xpath=..");
  for (const text of [
    "Review the draft, then execute the next actions",
    "Campaign path", "Opportunity", "Recipe", "Review", "Lock", "Handoff", "No auto-publish",
    "Campaign proposal", "approval-ready campaign", "Proposed campaign",
    "Delivery effort", "internal planning signal, not a purchasable currency",
    "External tools or club operators must execute the launch"
  ]) {
    await expect(build, text).toContainText(text);
  }
  for (const label of ["Audience", "Channel", "Message", "Timing", "Owner", "Measurement", "Next approval", "Review all drafted activations"]) await expect(build).toContainText(label);
  await expect(main).not.toContainText(/Explorer · preview only|included credits|Upgrade to reveal|Add credits|£175|£450|£1,000/);
});

test("the build phase previews the work package without dispatching it", async ({ page }) => {
  const main = await openBrief(page);
  for (const text of [
    "AVELA derives the work package",
    "Preview only · no external task has been created",
    "AVELA orchestrates; it does not replace project management",
    "No route configured",
    "AVELA does not dispatch this package automatically"
  ]) {
    await expect(main, text).toContainText(text);
  }
});

test("the human decision gate says recording a decision executes nothing", async ({ page }) => {
  const main = await openBrief(page);
  const gate = main.locator("#approval-gates");
  await expect(gate).toHaveCount(1);
  await expect(main).toContainText("Review required");
  await expect(main).toContainText("does not send campaigns, commit spend or execute club actions");
});

test("evidence shows the shared data-state legend", async ({ page }) => {
  const main = await openBrief(page);
  const evidence = main.locator("#evidence").locator("xpath=..");
  for (const state of ["Observed", "Forecast", "Modelled", "Missing"]) await expect(evidence).toContainText(state);
  for (const text of ["Inspect evidence, assumptions and missing inputs", "Inspect, exclude & recalculate", "Open editable impact scenario", "Open measurement & learning", "Scenario, not forecast"]) {
    await expect(main, text).toContainText(text);
  }
});

test("excluding a signal recalculates the scenario without touching source data", async ({ page }) => {
  const main = await openBrief(page);
  const controls = main.locator("div").filter({ has: page.getByText("Signals used", { exact: true }) }).filter({ has: page.getByText("How recalculation works") }).last();
  await expect(controls).toContainText("does not delete the source, edit the evidence register, change the saved Radar rank or authorise a campaign");
  await expect(controls.getByRole("checkbox", { name: /is core evidence/ }).first()).toBeDisabled();

  const optional = controls.getByRole("checkbox", { name: /^Include / }).first();
  // The checkbox is drawn as a switch; its label is what a person clicks.
  await optional.locator("xpath=ancestor::label").click();
  await expect(optional).not.toBeChecked();
  await expect(controls).toContainText("Excluded temporarily");
  await expect(controls).toContainText(/Maintained|Needs review/);
  await expect(controls).toContainText(/No source data has been changed|Restore material evidence/);
  await controls.getByRole("button", { name: "Restore all signals" }).click();
  await expect(controls).toContainText("Current engine plan");
  await expect(controls).not.toContainText("Excluded temporarily");
});

test("the brief shows what changed around the fixture right under the decision, without opening a phase", async ({ page }) => {
  await page.goto(brief);
  const strip = page.getByRole("region", { name: "What changed around this fixture" });
  await expect(strip).toBeVisible();
  const items = strip.getByRole("listitem");
  await expect(items.first()).toBeVisible();
  expect(await items.count()).toBeLessThanOrEqual(4);
  // Each signal keeps its evidence state and source.
  await expect(items.first()).toContainText(/Measured|Confirmed|Reported|Forecast|Inferred|Waiting/);
  await expect(items.first().getByRole("link")).toHaveAttribute("href", /^https?:/);
  await expect(strip.getByRole("link", { name: /exclude & recalculate/ })).toHaveAttribute("href", "#signals");
  const decisionBottom = await page.getByRole("region", { name: "Decision at a glance" }).evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  const stripTop = await strip.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(stripTop).toBeGreaterThanOrEqual(decisionBottom);
});
