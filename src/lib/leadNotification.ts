// Emails a new pilot lead to the AVELA team through Resend. The recipient lives in the
// LEAD_NOTIFY_TO environment variable, never in the repository, so the address cannot be scraped.
// It runs only after the honeypot, the bot check and validation have passed, and a failure here
// never loses the lead: it is already stored.

export type PilotLead = {
  clubName: string;
  role: string;
  workEmail: string;
  priority: string;
  sourcePath: string;
  utmSource: string;
  utmCampaign: string;
};

// Strip line breaks so a submitted value cannot add lines or headers to the message.
const line = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export function leadNotificationMessage(lead: PilotLead) {
  const rows = [
    ["Club", lead.clubName],
    ["Role", lead.role],
    ["Work email", lead.workEmail],
    ["Priority", lead.priority || "Not given"],
    ["Page", lead.sourcePath || "Unknown"],
    ["Source", [lead.utmSource, lead.utmCampaign].filter(Boolean).join(" / ") || "Direct"]
  ];
  return {
    subject: `New AVELA pilot request: ${line(lead.clubName)}`.slice(0, 160),
    text: [
      "A club asked for a pilot conversation on the AVELA website.",
      "",
      ...rows.map(([label, value]) => `${label}: ${line(value)}`),
      "",
      "Reply to this email to answer the club directly. The request is also stored in commercial_leads."
    ].join("\n")
  };
}

export async function notifyPilotLead(lead: PilotLead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.LEAD_NOTIFY_TO ?? "").split(",").map((address) => address.trim()).filter(Boolean);
  if (!apiKey || !to.length) return "not-configured" as const;

  const { subject, text } = leadNotificationMessage(lead);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM || process.env.MORNING_READ_FROM || "AVELA <onboarding@resend.dev>",
        to,
        reply_to: lead.workEmail,
        subject,
        text
      }),
      signal: AbortSignal.timeout(5000)
    });
    return response.ok ? "sent" as const : "failed" as const;
  } catch {
    return "failed" as const;
  }
}
