// Renders promo.html frame by frame (deterministic: seek(t) per frame), synthesises the soundtrack
// and muxes both into an MP4.
//
//   node scripts/video/render-promo.mjs <shotsDir> <out.mp4>            full render
//   node scripts/video/render-promo.mjs <shotsDir> <outDir> --stills 1,5,12   preview stills
import { chromium } from "@playwright/test";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DURATION, FPS } from "./timeline.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const [shots, out] = process.argv.slice(2);
const stillsArg = process.argv.indexOf("--stills");
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(",").map(Number) : null;
const range = process.argv.indexOf("--range") > 0 ? process.argv[process.argv.indexOf("--range") + 1].split(",").map(Number) : [0, DURATION];
const types = { ".html": "text/html", ".mjs": "text/javascript", ".png": "image/png" };

const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  const file = path.startsWith("/shots/") ? join(shots, path.slice(7)) : join(here, path === "/" ? "promo.html" : path.slice(1));
  if (!existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(url);
await page.waitForFunction(() => window.ready === true);

if (stills) {
  mkdirSync(out, { recursive: true });
  for (const t of stills) {
    await page.evaluate((t) => window.seek(t), t);
    await page.screenshot({ path: join(out, `still-${String(t).padStart(5, "0")}.jpg`), type: "jpeg", quality: 85 });
  }
} else {
  const video = out.replace(/\.mp4$/, ".video.mp4");
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", video], { stdio: ["pipe", "inherit", "inherit"] });
  const first = Math.round(range[0] * FPS), last = Math.round(range[1] * FPS);
  const started = Date.now();
  for (let f = first; f < last; f++) {
    await page.evaluate((t) => window.seek(t), f / FPS);
    const jpg = await page.screenshot({ type: "jpeg", quality: 94 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 150 === 0) console.log(`frame ${f}/${last} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  const wav = out.replace(/\.mp4$/, ".wav");
  execFileSync("node", [join(here, "synth-audio.mjs"), wav], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-i", wav, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out], { stdio: "inherit" });
  console.log("wrote", out);
}
await browser.close();
server.close();
