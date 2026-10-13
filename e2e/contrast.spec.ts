import { expect, test } from "@playwright/test";

// WCAG 1.4.3 large-text minimum is 3:1. Every visible h1-h3 must reach it against its
// effective background. This caught headings painted navy on navy panels.
const routes = [
  "/", "/for-clubs", "/pilot", "/case-study", "/live/london-city", "/cases",
  "/app", "/app/matches", "/app/matches/2026-10-18-eve-h", "/app/campaigns", "/app/players",
  "/app/season", "/app/sponsors", "/app/contracts", "/app/learning", "/app/executive",
  "/app/sources", "/app/setup", "/app/access", "/app/help", "/app/demo", "/matchday/2026-10-18-eve-h"
];

test.describe("heading contrast", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "colour does not depend on viewport");

  for (const route of routes) {
    test(`headings on ${route} reach 3:1`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.querySelectorAll("details").forEach((panel) => { panel.open = true; }));

      const failures = await page.evaluate(() => {
        const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
        const channel = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
        const background = (element: Element): number[] | null => {
          for (let node: Element | null = element; node; node = node.parentElement) {
            const style = getComputedStyle(node);
            const colour = parse(style.backgroundColor);
            if (colour.length < 4 || colour[3] > 0.5) return colour;
            if (style.backgroundImage !== "none") return null; // gradients/images: not measurable here
          }
          return [255, 255, 255];
        };
        const out: string[] = [];
        for (const heading of document.querySelectorAll("h1, h2, h3")) {
          if (!(heading as HTMLElement).offsetParent || !heading.textContent?.trim()) continue;
          const bg = background(heading);
          if (!bg) continue;
          const [a, b] = [luminance(parse(getComputedStyle(heading).color)), luminance(bg)];
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          if (ratio < 3) out.push(`${ratio.toFixed(2)}:1 "${heading.textContent.trim().slice(0, 60)}"`);
        }
        return out;
      });

      expect(failures, `${route} low-contrast headings`).toEqual([]);
    });
  }
});
