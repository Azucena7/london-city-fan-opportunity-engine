import { expect, test, type Page } from "@playwright/test";

// The commercial home, checked as a visitor sees it: rendered copy, links and order, not the
// source text of the components that produce them.

const main = (page: Page) => page.locator("main");
const nav = (page: Page) => page.getByRole("navigation", { name: "AVELA marketing and commercial product navigation" });

test("home positions the Opportunity Engine for marketing and commercial teams", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/The Opportunity Engine for Football Club Marketing & Commercial Teams/);
  const home = main(page);
  await expect(home).toContainText("The Opportunity Engine for football club marketing & commercial teams");
  await expect(home).toContainText("demand, rights and availability inside it");
  for (const role of ["Commercial & partnerships", "Fan engagement"]) await expect(home).toContainText(role);
  for (const retired of ["The problem is not missing data", "The value AVELA adds", "What AVELA is — and is not"]) {
    await expect(home).not.toContainText(retired);
  }
});

test("home turns the London City proof into a bounded pilot path", async ({ page }) => {
  await page.goto("/");
  const proof = page.getByRole("region", { name: "Hypothesis first. Announcement after." });
  await expect(proof).toBeVisible();
  for (const text of ["AVELA saw", "London City later announced", "evidence of relevance"]) await expect(proof).toContainText(text);
  await expect(proof).toContainText("London City is an independent demonstration, not a customer");
  await expect(proof).toContainText("Sequence, not cause");
  const pilot = page.locator("section").filter({ has: page.getByRole("heading", { name: "Prove it on 4–6 fixtures first." }) });
  for (const text of ["4–6 fixtures", "1–2 workflows", "Measured learning"]) await expect(pilot).toContainText(text);
});

test("home sections follow the Opportunity Engine story order", async ({ page }) => {
  await page.goto("/");
  const order = [
    "See what could change the match.",
    "The loop, in 45 seconds.",
    "Four decisions it is built to change.",
    "Hypothesis first. Announcement after.",
    "AVELA works across your tools.",
    "Questions clubs ask.",
    "Prove it on 4–6 fixtures first."
  ];
  const tops: number[] = [];
  for (const name of order) {
    const heading = page.getByRole("heading", { name, exact: true });
    await expect(heading, name).toHaveCount(1);
    tops.push(await heading.evaluate((element) => element.getBoundingClientRect().top + window.scrollY));
  }
  expect(tops).toEqual([...tops].sort((a, b) => a - b));
});

test("home shows AVELA complementing specialist tools rather than replacing them", async ({ page }) => {
  await page.goto("/");
  const ecosystem = page.getByRole("region", { name: "AVELA works across your tools." });
  for (const text of ["Works with your club stack", "are not competitors", "remain systems of record", "Blinkfire / analytics", "CRM / ticketing", "Asana / Monday / Jira"]) {
    await expect(ecosystem).toContainText(text);
  }
  // No connector is claimed before it exists: each tool says when it applies.
  await expect(ecosystem.getByRole("row").filter({ hasText: "External signals" })).toContainText("Live today");
  for (const tool of ["Blinkfire / analytics", "Google / Microsoft calendars", "Asana / Monday / Jira"]) {
    await expect(ecosystem.getByRole("row").filter({ hasText: tool })).toContainText("Planned");
  }
  const flow = ecosystem.locator('[aria-label="External signals and existing club systems feed the AVELA Opportunity Engine"]');
  await expect(flow).toContainText("Opportunity Engine");
  for (const output of ["What changed", "Why it matters", "Prepared move"]) await expect(flow).toContainText(output);
});

test("home FAQ states integration, execution and prediction boundaries", async ({ page }) => {
  await page.goto("/");
  const faq = page.getByRole("region", { name: "Questions clubs ask." });
  for (const question of [
    "Does AVELA replace Blinkfire, CRM, ticketing or BI tools?",
    "Why can’t we just use ChatGPT, Claude or another LLM",
    "Do we need to integrate everything before starting?",
    "What would a pilot look like",
    "Does AVELA predict attendance?",
    "What does AVELA read today?"
  ]) {
    await expect(faq.locator("summary").filter({ hasText: question })).toHaveCount(1);
  }
  // Answers sit in collapsed <details>; they are part of the page either way.
  for (const answer of [
    "Specialist platforms remain systems of record or specialist intelligence sources",
    "fixtures, campaigns, public signals and a limited amount of club-approved context",
    "Material club decisions remain subject to authorised human confirmation",
    "The LLM is part of AVELA; it is not the product",
    "does not promise forecasts or a magic score",
    "shown as not connected, never filled in",
    "the Opportunity Engine for football club marketing and commercial teams"
  ]) {
    await expect(faq).toContainText(answer);
  }
});

test("home and navigation calls to action are truthful and carry internal attribution", async ({ page }) => {
  await page.goto("/");
  const navigation = nav(page);
  for (const label of ["Product", "Pilot", "Proof", "FAQ", "Open demo", "Request pilot"]) {
    await expect(navigation.locator("a").filter({ hasText: label }).first()).toHaveCount(1);
  }
  // The workspace entry is the guided demo, not a bare jump into the Radar.
  for (const href of await navigation.locator("a").filter({ hasText: "Open demo" }).evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    expect(href).toContain("/app/demo?utm_source=avela_nav");
  }
  await expect(navigation.locator('a[href="/app/matches"]')).toHaveCount(0);
  for (const href of await navigation.locator('a[href*="utm_"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    expect(href).toContain("utm_source=avela_nav&utm_medium=internal_cta");
  }

  const home = main(page);
  const hrefOf = (name: string) => home.locator("a").filter({ hasText: name }).first().getAttribute("href");
  expect(await hrefOf("Request a club pilot")).toContain("utm_campaign=club_pilot");
  expect(await hrefOf("Try the guided product demo")).toContain("utm_campaign=guided_demo");
  expect(await hrefOf("Open London City Live")).toMatch(/^\/live\/london-city\?utm_source=avela_home.*utm_campaign=live_case/);
  for (const href of await home.locator('a[href*="utm_"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    expect(href).toContain("utm_medium=internal_cta");
  }
  await expect(home).not.toContainText(/Request a demo|Request pilot demo|Request club demo|Request the 90-day pilot/);
});

test("home keeps safe gutters and no sideways scroll on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const locator of [
    page.getByRole("heading", { level: 1 }),
    page.getByRole("link", { name: "See the London City example" }),
    page.getByRole("link", { name: "Request a club pilot" }),
    page.getByRole("heading", { name: "Prove it on 4–6 fixtures first." })
  ]) {
    const box = (await locator.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(16);
    expect(box.x + box.width).toBeLessThanOrEqual(390 - 16);
  }
});

test("home hero motion is dropped for visitors who ask for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const engine = page.getByRole("figure", { name: "AVELA Opportunity Engine" });
  expect(await engine.evaluate((figure) => getComputedStyle(figure.parentElement!).animationName)).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  expect(await engine.evaluate((figure) => getComputedStyle(figure.parentElement!).animationName)).not.toBe("none");
});

test("home proof is a dated record and the FAQ keeps answers one click away", async ({ page }) => {
  await page.goto("/");
  const record = page.getByRole("table", { name: "The London City hypothesis, in the order it happened" });
  await expect(record.getByRole("rowheader")).toHaveText(["Fixture + wider football", "AVELA saw · time-stamped", "London City later announced"]);
  const faq = page.getByRole("region", { name: "Questions clubs ask." });
  const question = faq.locator("summary").filter({ hasText: "Does AVELA predict attendance?" });
  await question.click();
  await expect(faq.getByText("does not promise forecasts or a magic score")).toBeVisible();
});

test("home hero marks club-data signals as pilot-only instead of filling them in", async ({ page }) => {
  await page.goto("/");
  const signals = page.getByRole("list", { name: "Signals around the match" });
  await expect(signals.getByRole("listitem").filter({ hasText: "CRM and ticketing" })).toContainText("In a pilot");
  await expect(signals.getByRole("listitem").filter({ hasText: "Weather" })).toContainText("Reading now");
});

test("the public navigation reaches product, pilot and proof pages, and /cases lands on the case study", async ({ page }) => {
  // On phones the links sit in the Menu disclosure; open it first.
  const follow = async (name: string) => {
    const menu = nav(page).getByText("Menu", { exact: true });
    if (await menu.isVisible()) await menu.click();
    await nav(page).getByRole("link", { name, exact: true }).locator("visible=true").first().click();
  };
  await page.goto("/for-clubs");
  await follow("Pilot");
  await expect(page).toHaveURL(/\/pilot\?/);
  await follow("Proof");
  await expect(page).toHaveURL(/\/case-study\?/);
  await page.goto("/cases");
  await expect(page).toHaveURL(/\/case-study$/);
});

test("the home shows the product film right after the hero, light until played", async ({ page }) => {
  await page.goto("/");
  const film = page.getByRole("region", { name: "The loop, in 45 seconds." });
  const video = film.locator("video");
  await expect(video).toHaveAttribute("poster", "/media/avela-promo-poster.jpg");
  await expect(video).toHaveAttribute("preload", "none");
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.controls)).toBe(true);
  await expect(film).toContainText("London City is not an AVELA customer");
  await expect(film).toContainText("sample tasks");
  for (const step of ["Anticipate", "Decide", "Activate", "Learn"]) await expect(film.getByText(step, { exact: true })).toBeVisible();
  const headings = await page.locator("main h2").allTextContents();
  expect(headings[0]).toBe("The loop, in 45 seconds.");
});
