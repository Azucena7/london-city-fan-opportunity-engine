// Records the public product tour from the real app: a scripted walk through the demonstration
// workspace with captions laid over the page, saved as public/media/avela-tour.mp4 with a poster.
// Nothing is generated or mocked: every frame is the running app on the frozen demo snapshot.
//
//   npm run build:e2e && AVELA_PRODUCT_DATE=2026-10-14 npx next start -p 3210 &
//   node scripts/record-product-tour.mjs            # BASE_URL defaults to http://localhost:3210
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3210";
const size = { width: 1280, height: 720 };
const out = "public/media";
const work = mkdtempSync(join(tmpdir(), "avela-tour-"));

async function caption(page, title, line) {
  await page.evaluate(([title, line]) => {
    document.getElementById("tour-caption")?.remove();
    const box = document.createElement("div");
    box.id = "tour-caption";
    box.setAttribute("aria-hidden", "true");
    box.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;max-width:860px;padding:14px 22px;border-radius:12px;background:rgba(16,39,66,.94);color:#fff;font:600 20px/1.35 ui-sans-serif,-apple-system,'Segoe UI',sans-serif;box-shadow:0 12px 34px rgba(16,39,66,.35);text-align:center";
    box.innerHTML = `<div style="color:#86D8CC;font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px">${title}</div>${line}`;
    document.body.appendChild(box);
    // The demo's own floating helpers would sit under the caption; hide them for the recording.
    document.querySelectorAll("[class*='launcher'],aside[aria-label='Decision bar']").forEach((el) => { el.style.visibility = "hidden"; });
  }, [title, line]);
}

async function open(page, path) {
  await page.goto(base + path);
  await page.waitForLoadState("networkidle");
}

async function smoothScroll(page, to, ms = 1400) {
  await page.evaluate(async ([to, ms]) => {
    const from = window.scrollY;
    const start = performance.now();
    await new Promise((done) => {
      const step = (now) => {
        const t = Math.min(1, (now - start) / ms);
        window.scrollTo(0, from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  }, [to, ms]);
}

async function card(page, html) {
  await page.setContent(`<!doctype html><html><body style="margin:0;height:100vh;display:grid;place-items:center;background:#102742;color:#F8F6F1;font-family:ui-sans-serif,-apple-system,'Segoe UI',sans-serif;text-align:center">${html}</body></html>`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: size, recordVideo: { dir: work, size } });
const page = await context.newPage();
const hold = (ms) => page.waitForTimeout(ms);

await card(page, `<div><div style="color:#86D8CC;letter-spacing:.2em;font-size:16px;font-weight:800">AVELA</div><h1 style="font-size:46px;margin:14px 0 10px">The Opportunity Engine</h1><p style="font-size:22px;color:#C9D4DE;margin:0">for football club marketing &amp; commercial teams</p></div>`);
await hold(2600);

await open(page, "/app");
await caption(page, "Read", "Every morning: what needs a decision, ranked with the rest of the club's work.");
await hold(3200);
await page.getByRole("region", { name: "Decision inbox" }).locator("ol > li").nth(1).getByRole("button").click();
await hold(500);
await caption(page, "Read", "Open any decision to see why it matters and what AVELA recommends, without leaving Home.");
await hold(3600);

await open(page, "/app/matches");
await caption(page, "Read", "The Radar ranks every upcoming fixture by opportunity and urgency, from sourced signals.");
await hold(3000);
await smoothScroll(page, 520);
await hold(2200);

await open(page, "/app/matches/2026-10-18-eve-h");
await caption(page, "Decide", "Each fixture gets a brief: the recommended play, why now, and what blocks it.");
await hold(3200);
const inputs = page.getByRole("region", { name: "What this decision stands on" });
await smoothScroll(page, await inputs.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 90));
await caption(page, "Decide", "Before anyone approves: what is known, what is assumed, and what is still missing.");
await hold(4000);

await open(page, "/app/campaigns");
const views = page.getByRole("group", { name: "Campaign view" });
await smoothScroll(page, await views.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 80));
await views.getByRole("button", { name: "List" }).click();
// The screencast only captures frames on change: let the button transition settle first.
await hold(500);
await caption(page, "Move", "Fixture and commercial campaigns in one plan: owners, stages and next steps.");
await hold(3600);

await open(page, "/app/sources?state=attention");
const register = page.getByRole("table", { name: /Source register/ });
await smoothScroll(page, await register.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 140));
await caption(page, "Trust", "Source health stays visible: what each missing source blocks, never shown as zero.");
await hold(3600);

await open(page, "/app/learning");
await caption(page, "Learn", "After the match: what happened, what AVELA learned, and what changes next time.");
await hold(3600);

await card(page, `<div style="max-width:880px"><h2 style="font-size:36px;margin:0 0 14px">Read → Decide → Move → Learn</h2><p style="font-size:20px;color:#C9D4DE;margin:0 0 26px">The club makes every final decision. AVELA keeps the evidence, the constraints and the learning.</p><p style="font-size:14px;color:#9FB0BF;margin:0">Public demonstration built on London City Lionesses public information.<br>London City is not an AVELA customer. No club data is shown.</p></div>`);
await hold(4200);

await context.close();
await browser.close();

const webm = join(work, readdirSync(work).find((name) => name.endsWith(".webm")));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", webm, "-ss", "0.4", "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", join(out, "avela-tour.mp4")]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "9", "-i", join(out, "avela-tour.mp4"), "-frames:v", "1", "-q:v", "4", join(out, "avela-tour-poster.jpg")]);
rmSync(work, { recursive: true, force: true });
console.log("Wrote public/media/avela-tour.mp4 and avela-tour-poster.jpg");
