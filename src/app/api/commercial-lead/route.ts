import { NextResponse } from "next/server";
import { supabaseServerConfigured, supabaseServerRequest } from "@/lib/supabaseServer";
import { readJson } from "@/lib/requestGuards";
import { verifyTurnstile } from "@/lib/turnstile";
import { notifyPilotLead } from "@/lib/leadNotification";

type LeadBody = {
  clubName?: string;
  role?: string;
  workEmail?: string;
  priority?: string;
  consent?: boolean;
  website?: string;
  turnstileToken?: string;
  sourcePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!supabaseServerConfigured()) {
    return NextResponse.json({ error: "Lead capture is not configured." }, { status: 503 });
  }

  const body = await readJson(request) as LeadBody | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Honeypot: return a neutral success response without storing obvious bot submissions.
  if (clean(body.website, 200)) {
    return NextResponse.json({ submitted: true });
  }

  // Bot check before anything is validated or stored; skipped until the Turnstile keys are set.
  const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  if (!(await verifyTurnstile(body.turnstileToken, remoteIp))) {
    return NextResponse.json({ error: "The anti-bot check did not pass. Please try again." }, { status: 403 });
  }

  const clubName = clean(body.clubName, 120);
  const role = clean(body.role, 120);
  const workEmail = clean(body.workEmail, 254).toLowerCase();
  const priority = clean(body.priority, 240);

  if (clubName.length < 2 || role.length < 2 || !emailPattern.test(workEmail) || body.consent !== true) {
    return NextResponse.json({ error: "Club, role, a valid work email and consent are required." }, { status: 400 });
  }

  const response = await supabaseServerRequest("/rest/v1/commercial_leads", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      club_name: clubName,
      role,
      work_email: workEmail,
      priority: priority || null,
      consent: true,
      source_path: clean(body.sourcePath, 200) || null,
      utm_source: clean(body.utmSource, 120) || null,
      utm_medium: clean(body.utmMedium, 120) || null,
      utm_campaign: clean(body.utmCampaign, 120) || null,
      utm_content: clean(body.utmContent, 120) || null
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Your request could not be saved. Please try again." }, { status: response.status });
  }

  const notification = await notifyPilotLead({
    clubName, role, workEmail, priority,
    sourcePath: clean(body.sourcePath, 200),
    utmSource: clean(body.utmSource, 120),
    utmCampaign: clean(body.utmCampaign, 120)
  });
  if (notification === "failed") console.error("commercial-lead: stored, but the notification email failed");

  return NextResponse.json({ submitted: true }, { status: 201 });
}
