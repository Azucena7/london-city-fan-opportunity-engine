import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3210);

// Browser regression tests run against a build of the frozen data snapshot in e2e/data-snapshot
// (`npm run build:e2e` first), with the product's "today" pinned to the snapshot's own date, so
// the daily data refresh can never turn them red on its own.
const snapshot = JSON.parse(readFileSync("e2e/data-snapshot/data/live/current.json", "utf8"));
const productDate = String(snapshot.updated_at).slice(0, 10);
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure"
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    env: { AVELA_PRODUCT_DATE: productDate },
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
