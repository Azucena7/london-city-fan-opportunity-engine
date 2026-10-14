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
  const proof = page.getByRole("region", { name: "A time-stamped AVELA hypothesis. What London City announced next." });
  await expect(proof).toBeVisible();
  for (const text of ["AVELA saw", "London City later announced", "evidence of relevance"]) await expect(proof).toContainText(text);
  await expect(proof).toContainText("London City is an independent demonstration, not a customer");
  const pilot = page.locator("section").filter({ has: page.getByRole("heading", { name: "Prove AVELA on 4–6 fixtures before you integrate more." }) });
  for (const text of ["4–6 fixtures", "1–2 workflows", "Measured learning"]) await expect(pilot).toContainText(text);
});

test("home sections follow the Opportunity Engine story order", async ({ page }) => {
  await page.goto("/");
  const order = [
    "See what could change the match.",
    "A time-stamped AVELA hypothesis. What London City announced next.",
    "What a commercial lead reads before the first meeting.",
    "Change what happens around the match. Watch the plan change.",
    "Only the signals that change the decision.",
    "Four decisions the engine is built to change.",
    "Keep your specialist tools. AVELA reads across them.",
    "Prove AVELA on 4–6 fixtures before you integrate more.",
    "Where AVELA fits — and where it does not.",
    "Turn the next club opportunity into a better decision — without replacing the stack you already use."
  ];
  const tops: number[] = [];
  for (const name of order) {
    const heading = page.getByRole("heading", { name, exact: true });
    await expect(heading, name).toHaveCount(1);
    tops.push(await heading.evaluate((element) => element.getBoundingClientRect().top + window.scrollY));
  }
  expect(tops).toEqual([...tops].sort((a, b) => a - b));
});

test("home decision demo changes the plan per scenario and stays labelled as a simulation", async ({ page }) => {
  await page.goto("/");
  const demo = page.getByRole("region", { name: "Change what happens around the match. Watch the plan change." });
  await expect(demo).toContainText("illustrative product simulation");
  const panel = demo.getByRole("tabpanel");
  await expect(panel).toContainText("Home fixture · Illustrative simulation");
  await expect(panel).toContainText("Marketing & commercial decision");
  for (const label of ["Recommended marketing play", "Audience", "Channel", "Spend posture"]) await expect(panel).toContainText(label);
  for (const tab of ["Competing kick-off", "Rail disruption", "Broadcast pick"]) await expect(demo.getByRole("tab", { name: new RegExp(tab) })).toHaveCount(1);
  await expect(demo).not.toContainText(/LIVE SIMULATION|Monitoring live context/);

  const before = await panel.innerText();
  await demo.getByRole("tab", { name: /Broadcast pick/ }).click();
  await expect(demo.getByRole("tab", { name: /Broadcast pick/ })).toHaveAttribute("aria-selected", "true");
  expect(await panel.innerText()).not.toBe(before);
});

test("home shows AVELA complementing specialist tools rather than replacing them", async ({ page }) => {
  await page.goto("/");
  const ecosystem = page.getByRole("region", { name: "Keep your specialist tools. AVELA reads across them." });
  for (const text of ["Works with your club stack", "are not competitors", "remain systems of record", "Blinkfire / analytics", "CRM / ticketing", "Asana / Monday / Jira"]) {
    await expect(ecosystem).toContainText(text);
  }
  const flow = ecosystem.locator('[aria-label="External signals and existing club systems feed the AVELA Opportunity Engine"]');
  await expect(flow).toContainText("Opportunity Engine");
  for (const output of ["What changed", "Why it matters", "Prepared move"]) await expect(flow).toContainText(output);
});

test("home FAQ states integration, execution and prediction boundaries", async ({ page }) => {
  await page.goto("/");
  const faq = page.getByRole("region", { name: "Where AVELA fits — and where it does not." });
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
  for (const label of ["How it fits", "Live case", "FAQ", "Open workspace", "Request pilot"]) {
    await expect(navigation.locator("a").filter({ hasText: label }).first()).toHaveCount(1);
  }
  // The workspace entry is the guided demo, not a bare jump into the Radar.
  for (const href of await navigation.locator("a").filter({ hasText: "Open workspace" }).evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
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
  expect(await hrefOf("See a live fixture decision")).toMatch(/^\/live\/london-city\?utm_source=avela_home.*utm_campaign=live_case/);
  for (const href of await home.locator('a[href*="utm_"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    expect(href).toContain("utm_medium=internal_cta");
  }
  await expect(home).not.toContainText(/Request a demo|Request pilot demo|Request club demo|Request the 90-day pilot/);
});
