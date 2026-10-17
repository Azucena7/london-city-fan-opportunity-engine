// Captures the real product screens the promo is built from: the running app on the frozen demo
// snapshot (public London City Lionesses information), nothing retouched. The only stand-in is the
// execution status (a signed-in club with sample tasks in its work tool), because the demo has no
// club tool connected; the promo labels those shots as sample tasks.
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
  // Sticky bars would overlap element shots taken mid-page.
  await page.evaluate(() => document.querySelectorAll("body *").forEach((el) => { if (getComputedStyle(el).position === "sticky") el.style.position = "static"; }));
  await page.waitForTimeout(300);
}
const section = (page, name) => page.locator(`section[aria-label="${name}"]`).first();
const byHeading = (page, text) => page.locator("section", { has: page.getByRole("heading", { name: text }) }).last();

const desk = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const shoot = async (locator, name) => { await locator.scrollIntoViewIfNeeded(); await desk.waitForTimeout(250); await locator.screenshot({ path: join(out, name + ".png") }); };
const view = async (name) => { await desk.evaluate(() => window.scrollTo(0, 0)); await desk.waitForTimeout(200); await desk.screenshot({ path: join(out, name + ".png") }); };

await open(desk, "/app");
await view("home");
await shoot(desk.locator("section,div", { has: desk.getByRole("list", { name: "External signals from the latest refresh" }) }).last(), "outside");
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

// Execution status: sample tasks in a club work tool, read back by AVELA (never edited there).
const exec = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const sample = {
  enabled: true,
  connections: [{ id: "conn-1", system: "other", label: "Club work tool", state: "connected" }],
  packages: [{ id: "pkg-1", connection_id: "conn-1", package_key: "wp-everton", title: "Everton return-visit activation", sync_state: "synced", item_count: 4, completed_count: 1, blocked_count: 1, estimated_minutes: 240, last_sync_at: "2026-10-14T08:40:00Z" }],
  items: [
    { id: "i1", package_id: "pkg-1", package_item_key: "approval:club-owner", state: "done", assignee_label: "Marketing lead", last_sync_at: "2026-10-14T08:40:00Z" },
    { id: "i2", package_id: "pkg-1", package_item_key: "approval:audience-access", state: "blocked", blocker_label: "Consent evidence pending", due_at: "2026-10-15T12:00:00Z", last_sync_at: "2026-10-14T08:40:00Z" },
    { id: "i3", package_id: "pkg-1", package_item_key: "approval:tracking", state: "in-progress", assignee_label: "Digital", due_at: "2026-10-16T12:00:00Z", last_sync_at: "2026-10-14T08:40:00Z" },
    { id: "i4", package_id: "pkg-1", package_item_key: "activation:everton-return-brief", state: "in-progress", assignee_label: "Content", due_at: "2026-10-17T09:00:00Z", last_sync_at: "2026-10-14T08:40:00Z" }
  ]
};
await exec.route("**/api/auth/session", (r) => r.fulfill({ json: { configured: true, authenticated: true, clubs: [{ id: "club-1", name: "Demo club", role: "admin" }] } }));
await exec.route("**/api/work-system/status**", (r) => r.fulfill({ json: sample }));
await open(exec, "/app/matches/2026-10-18-eve-h");
await exec.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
const monitor = exec.getByRole("region", { name: "External execution sync" });
await monitor.getByText("Consent evidence pending").waitFor();
await monitor.scrollIntoViewIfNeeded(); await exec.waitForTimeout(250);
await monitor.screenshot({ path: join(out, "monitor.png") });
// Narrow viewport so the two answers stack and fit the vertical frame.
await exec.setViewportSize({ width: 440, height: 900 });
await open(exec, "/app/learning?fixture=2026-10-18-eve-h");
const dw = exec.getByRole("region", { name: "Delivered and worked" });
await dw.getByText("1 of 4 tasks done").waitFor();
await dw.scrollIntoViewIfNeeded(); await exec.waitForTimeout(250);
await dw.screenshot({ path: join(out, "delivered-worked.png") });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
for (const [path, name] of [["/app", "m-home"], ["/app/matches/2026-10-18-eve-h", "m-brief"], ["/app/matches", "m-radar"]]) {
  await open(phone, path);
  await phone.screenshot({ path: join(out, name + ".png") });
}

await browser.close();
console.log("shots in", out);
