// The Morning Commercial Read as a message: the same lines the home page shows, plus the
// engine drafts that are due this week. Pure rendering only — sending lives in the script.

import type { MorningReadLine } from "./morningRead";
import type { PreparedMove } from "./preparedMoves";

export type MorningReadDigest = { subject: string; text: string; html: string };

export type DigestInput = {
  today: string;
  refreshedAt: string;
  nextFixture: { opponent: string; timingLabel: string } | null;
  lines: MorningReadLine[];
  moves: PreparedMove[];
  siteUrl: string;
};

const DAY = 86_400_000;

function day(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

/** Engine drafts to prepare within the next seven days, late ones first. */
export function movesDueThisWeek(moves: PreparedMove[], today: string) {
  const horizon = new Date(Date.parse(`${today}T12:00:00Z`) + 7 * DAY).toISOString().slice(0, 10);
  return moves
    .filter((move) => move.prepareBy <= horizon)
    .sort((a, b) => Number(b.late) - Number(a.late) || a.prepareBy.localeCompare(b.prepareBy));
}

export function renderMorningReadDigest({ today, refreshedAt, nextFixture, lines, moves, siteUrl }: DigestInput): MorningReadDigest {
  const due = movesDueThisWeek(moves, today);
  const refreshed = new Date(refreshedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
  const subject = `AVELA Morning Commercial Read · ${day(today)}${nextFixture ? ` · ${nextFixture.opponent} ${nextFixture.timingLabel}` : ""}`;
  const portfolioUrl = `${siteUrl.replace(/\/$/, "")}/app/executive`;
  const boundary = "London City demonstration environment, built from public sources. Signals AVELA cannot read are marked, never filled in.";

  const moveText = (move: PreparedMove) =>
    `${move.opponent} (${day(move.date)}): ${move.move} Owner: ${move.ownerRole}. Prepare by ${day(move.prepareBy)}${move.late ? " (late)" : ""}. Not approved.`;

  const text = [
    subject,
    `Data refreshed ${refreshed} (London).`,
    "",
    ...lines.map((line) => `${line.label.toUpperCase()} [${line.state === "live" ? "Live" : "Not connected"}]\n${line.headline}${line.detail ? `\n${line.detail}` : ""}\n`),
    "PREPARED MOVES DUE THIS WEEK",
    ...(due.length ? due.map((move) => `- ${moveText(move)}`) : ["- No engine draft is due in the next seven days."]),
    "",
    `Open the decision portfolio: ${portfolioUrl}`,
    boundary
  ].join("\n");

  const row = (line: MorningReadLine) => `
    <tr>
      <td style="padding:12px 0;border-top:1px solid #e3e7ea;vertical-align:top;width:150px;color:#667686;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase">${escapeHtml(line.label)}</td>
      <td style="padding:12px 12px;border-top:1px solid #e3e7ea;vertical-align:top;font:15px/1.45 Arial,sans-serif;color:${line.state === "live" ? "#10263d" : "#667686"}">
        <strong>${escapeHtml(line.headline)}</strong>${line.detail ? `<br><span style="font-size:13px;color:#667686">${escapeHtml(line.detail)}</span>` : ""}
      </td>
      <td style="padding:12px 0;border-top:1px solid #e3e7ea;vertical-align:top;white-space:nowrap;font:700 11px/1.4 Arial,sans-serif;color:${line.state === "live" ? "#329c91" : "#667686"}">${line.state === "live" ? "LIVE" : "NOT CONNECTED"}</td>
    </tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f8f6f1">
  <div style="max-width:680px;margin:0 auto;padding:28px;background:#ffffff;border-radius:12px">
    <p style="margin:0;color:#329c91;font:700 12px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase">AVELA · Morning Commercial Read</p>
    <h1 style="margin:8px 0 4px;color:#10263d;font:700 22px/1.25 Arial,sans-serif">${escapeHtml(subject.replace("AVELA Morning Commercial Read · ", ""))}</h1>
    <p style="margin:0 0 16px;color:#667686;font:13px/1.5 Arial,sans-serif">Data refreshed ${escapeHtml(refreshed)} (London).</p>
    <table role="presentation" style="width:100%;border-collapse:collapse">${lines.map(row).join("")}</table>
    <h2 style="margin:24px 0 8px;color:#10263d;font:700 15px/1.4 Arial,sans-serif">Prepared moves due this week</h2>
    ${due.length
      ? `<ul style="margin:0;padding-left:18px;color:#10263d;font:14px/1.5 Arial,sans-serif">${due.map((move) => `<li style="margin-bottom:8px">${escapeHtml(moveText(move))}</li>`).join("")}</ul>`
      : `<p style="margin:0;color:#667686;font:14px/1.5 Arial,sans-serif">No engine draft is due in the next seven days.</p>`}
    <p style="margin:24px 0 0"><a href="${escapeHtml(portfolioUrl)}" style="display:inline-block;padding:11px 16px;border-radius:10px;background:#0d2238;color:#ffffff;font:700 13px/1 Arial,sans-serif;text-decoration:none">Open the decision portfolio</a></p>
    <p style="margin:20px 0 0;color:#667686;font:12px/1.5 Arial,sans-serif">${escapeHtml(boundary)}</p>
  </div>
</body></html>`;

  return { subject, text, html };
}
