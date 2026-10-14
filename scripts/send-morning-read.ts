// Builds today's Morning Commercial Read from the refreshed data and delivers it.
// Always: the read is written to the GitHub Actions run summary (and stdout).
// Email: only when RESEND_API_KEY and MORNING_READ_TO are set. Recipients live in secrets,
// never in the repository. Run with: npx tsx@4.19.2 --tsconfig tsconfig.json scripts/send-morning-read.ts
import { appendFile } from "node:fs/promises";
import { currentState } from "@/lib/data";
import { currentProductDate } from "@/lib/currentProductDate";
import { getCurrentMorningRead } from "@/lib/currentMorningRead";
import { getCurrentPreparedMoves } from "@/lib/currentPreparedMoves";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { movesDueThisWeek, renderMorningReadDigest } from "@/lib/morningReadDigest";

const SITE_URL = process.env.SITE_URL || "https://avela-growth-intelligence.vercel.app";

async function main() {
  const live = getCurrentProductOpportunity();
  const today = currentProductDate(currentState.updated_at);
  const moves = getCurrentPreparedMoves();
  const digest = renderMorningReadDigest({
    today,
    refreshedAt: currentState.updated_at,
    nextFixture: live ? { opponent: live.fixture.opponent, timingLabel: live.timingLabel } : null,
    lines: getCurrentMorningRead(live),
    moves,
    siteUrl: SITE_URL
  });

  console.log(digest.text);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `## ${digest.subject}\n\n\`\`\`text\n${digest.text}\n\`\`\`\n`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.MORNING_READ_TO ?? "").split(",").map((address) => address.trim()).filter(Boolean);
  if (!apiKey || !to.length) {
    console.log("\nEmail delivery not configured (RESEND_API_KEY and MORNING_READ_TO): the read is in the run summary only.");
    return;
  }
  if (process.env.REFRESH_DRY_RUN === "1") {
    console.log(`\nDry run: would email ${to.length} recipient(s), ${movesDueThisWeek(moves, today).length} move(s) due.`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MORNING_READ_FROM || "AVELA <onboarding@resend.dev>",
      to,
      subject: digest.subject,
      html: digest.html,
      text: digest.text
    }),
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
  console.log(`\nEmailed the Morning Commercial Read to ${to.length} recipient(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
