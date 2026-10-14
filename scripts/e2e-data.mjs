// Browser tests run against a frozen copy of the data the daily bot refreshes, so a fixture
// being played (or a signal expiring) never turns the Quality Gate red without a code change.
//
//   node scripts/e2e-data.mjs snapshot   copy today's refreshed data into e2e/data-snapshot
//   node scripts/e2e-data.mjs build      build the app against the snapshot, then restore data/
//
// The snapshot's own date pins the product's "today" for the browser tests (see
// playwright.config.ts). Refresh the snapshot when a change needs newer data.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

// The files the daily refresh commits (.github/workflows/daily-data-refresh.yml).
export const REFRESHED_FILES = [
  "data/seed/calendar.json",
  "data/live/current.json",
  "data/live/signals.json",
  "data/live/audience-reach.json",
  "data/live/event-landscape.json",
  "data/live/news-radar.json",
  "data/live/bank-holidays.json",
  "data/live/tfl-road.json",
  "data/live/tfl-rail.json",
  "data/live/source-health.json"
];
const SNAPSHOT = "e2e/data-snapshot";

function copy(files, from, to) {
  for (const file of files) {
    mkdirSync(dirname(join(to, file)), { recursive: true });
    cpSync(join(from, file), join(to, file));
  }
}

export function snapshotDate() {
  const current = JSON.parse(readFileSync(join(SNAPSHOT, "data/live/current.json"), "utf8"));
  return String(current.updated_at).slice(0, 10);
}

function build() {
  const missing = REFRESHED_FILES.filter((file) => !existsSync(join(SNAPSHOT, file)));
  if (missing.length) throw new Error(`Snapshot is missing ${missing.join(", ")}; run: node scripts/e2e-data.mjs snapshot`);
  const backup = mkdtempSync(join(tmpdir(), "avela-data-"));
  copy(REFRESHED_FILES, ".", backup);
  const restore = () => copy(REFRESHED_FILES, backup, ".");
  process.on("SIGINT", () => { restore(); process.exit(130); });
  try {
    copy(REFRESHED_FILES, SNAPSHOT, ".");
    const date = snapshotDate();
    console.log(`Building against the e2e data snapshot of ${date}`);
    const result = spawnSync("npx", ["next", "build"], { stdio: "inherit", env: { ...process.env, AVELA_PRODUCT_DATE: date } });
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  } finally {
    restore();
    rmSync(backup, { recursive: true, force: true });
  }
}

const command = process.argv[2];
if (command === "snapshot") {
  copy(REFRESHED_FILES, ".", SNAPSHOT);
  console.log(`Snapshot of ${snapshotDate()} written to ${SNAPSHOT}`);
} else if (command === "build") {
  build();
} else if (command) {
  console.error(`Unknown command: ${command}`);
  process.exitCode = 1;
}
