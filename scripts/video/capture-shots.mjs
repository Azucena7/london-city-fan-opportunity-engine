// Captures the real product screens the promo is built from: the running app on the frozen demo
// snapshot (public London City Lionesses information), nothing mocked or retouched.
//
//   npm run build:e2e && AVELA_PRODUCT_DATE=2026-10-14 npx next start -p 3210 &
//   node scripts/video/capture-shots.mjs <outDir>
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3210";
const out = process.argv[2] ?? "promo-shots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

async function open(page, path) {
  await page.goto(base + path);
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({ content: "[class*='launcher'],aside[aria-label='Decision bar'],nextjs-portal{display:none!important}*{caret-color:transparent!important}" });
  await page.waitForTimeout(300);
}
const section = (page, name) => page.locator(`section[aria-label="${name}"]`).first();
const byHeading = (page, text) => page.locator("section", { has: page.getByRole("heading", { name: text }) }).last();

const desk = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const shoot = async (locator, name) => { await locator.scrollIntoViewIfNeeded(); await desk.waitForTimeout(250); await locator.screenshot({ path: join(out, name + ".png") }); };
const view = async (name) => { await desk.evaluate(() => window.scrollTo(0, 0)); await desk.waitForTimeout(200); await desk.screenshot({ path: join(out, name + ".png") }); };

await open(desk, "/app");
await view("home");
await shoot(section(desk, "Decision inbox"), "inbox");

await open(desk, "/app/matches");
await view("radar");
await shoot(byHeading(desk, "See urgency and opportunity at a glance"), "radar-map");
await shoot(byHeading(desk, "Ranked by what deserves attention now"), "radar-ranked");

await open(desk, "/app/matches/2026-10-18-eve-h");
await view("brief");
await shoot(section(desk, "Decision at a glance"), "brief-glance");
await shoot(section(desk, "What this decision stands on"), "brief-inputs");

await open(desk, "/app/sources");
await view("sources");
await shoot(section(desk, "Source health overview"), "sources-health");

await open(desk, "/app/learning");
await view("learning");
await shoot(section(desk, "Next fixture adjustment"), "learning-next");

await open(desk, "/app/campaigns");
await view("campaigns");

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
for (const [path, name] of [["/app", "m-home"], ["/app/matches/2026-10-18-eve-h", "m-brief"], ["/app/matches", "m-radar"]]) {
  await open(phone, path);
  await phone.screenshot({ path: join(out, name + ".png") });
}

await browser.close();
console.log("shots in", out);
