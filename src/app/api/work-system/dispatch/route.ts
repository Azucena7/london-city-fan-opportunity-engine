import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";
import { readJson, sessionWriteRejection } from "@/lib/requestGuards";
import { dispatchPayload } from "@/lib/workWebhook";
import { signBody } from "@/lib/webhookSignature";

// Sends one approved, proposed package to the club's work tool through the generic webhook.
// A person confirms the send; AVELA records the reference the tool returns and nothing else.
// The webhook URL and secret live in the deployment's environment, never in the database.

function safe(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const rejected = sessionWriteRejection(request);
  if (rejected) return rejected;

  const webhookUrl = process.env.WORK_WEBHOOK_URL?.trim();
  const secret = process.env.WORK_WEBHOOK_SECRET?.trim();
  if (!supabaseConfigured() || !webhookUrl || !secret) {
    return NextResponse.json({ error: "The work-system webhook is not configured. Nothing was sent." }, { status: 503 });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required. Nothing was sent." }, { status: 401 });

  const body = await readJson(request) as {
    clubId?: string;
    decisionId?: string;
    packageKey?: string;
    confirm?: boolean;
    items?: Array<{ key?: unknown; category?: unknown; title?: unknown }>;
  } | null;
  const clubId = safe(body?.clubId, 80);
  const decisionId = safe(body?.decisionId);
  const packageKey = safe(body?.packageKey);
  if (body?.confirm !== true) {
    return NextResponse.json({ error: "Sending to the work tool needs an explicit confirmation. Nothing was sent." }, { status: 400 });
  }

  const packageResponse = await supabaseRequest(
    `/rest/v1/external_work_packages?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(decisionId)}&package_key=eq.${encodeURIComponent(packageKey)}&select=id,title,sync_state,item_count,connection_id&limit=1`
  );
  if (!packageResponse.ok) {
    return NextResponse.json({ error: "The handoff package could not be read. Nothing was sent." }, { status: packageResponse.status });
  }
  const [pack] = await packageResponse.json() as Array<{ id: string; title: string; sync_state: string; item_count: number; connection_id: string }>;
  if (!pack) return NextResponse.json({ error: "Propose the handoff before sending it. Nothing was sent." }, { status: 404 });
  if (pack.sync_state !== "proposed" && pack.sync_state !== "error") {
    return NextResponse.json({ error: "This package was already sent; its status comes back from the work tool." }, { status: 409 });
  }

  const callbackUrl = new URL("/api/work-system/callback", process.env.SITE_URL ?? request.url).toString();
  const payload = dispatchPayload({
    clubId, decisionId, packageKey, title: pack.title, items: body?.items ?? [], callbackUrl, sentAt: new Date().toISOString()
  });
  if (!payload) return NextResponse.json({ error: "The package has no routable items. Nothing was sent." }, { status: 400 });

  const raw = JSON.stringify(payload);
  let outcome: { ok: true; ref: string | null; url: string | null } | { ok: false; message: string };
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AVELA-Signature": signBody(secret, raw), "X-AVELA-Idempotency-Key": payload.idempotencyKey },
      body: raw,
      signal: AbortSignal.timeout(15_000)
    });
    const reply = await response.json().catch(() => ({})) as { packageRef?: unknown; packageUrl?: unknown };
    outcome = response.ok
      ? { ok: true, ref: safe(reply.packageRef, 220) || null, url: safe(reply.packageUrl, 500).startsWith("https://") ? safe(reply.packageUrl, 500) : null }
      : { ok: false, message: `The work tool answered ${response.status}.` };
  } catch (error) {
    outcome = { ok: false, message: error instanceof Error && error.name === "TimeoutError" ? "The work tool did not answer within 15 seconds." : "The work tool could not be reached." };
  }

  const update = outcome.ok
    ? { sync_state: "created", external_package_ref: outcome.ref, external_package_url: outcome.url, sync_error: null, last_sync_at: new Date().toISOString(), updated_by: user.id }
    : { sync_state: "error", sync_error: outcome.message, updated_by: user.id };
  await supabaseRequest(`/rest/v1/external_work_packages?id=eq.${encodeURIComponent(pack.id)}`, { method: "PATCH", body: JSON.stringify(update) });

  return outcome.ok
    ? NextResponse.json({ sent: true, message: "Sent to the work tool. Task status will appear here as the tool reports it." })
    : NextResponse.json({ sent: false, error: `${outcome.message} Nothing was created; you can send it again.` }, { status: 502 });
}
