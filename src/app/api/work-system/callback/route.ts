import { NextResponse } from "next/server";
import { supabaseServerConfigured, supabaseServerRequest } from "@/lib/supabaseServer";
import { MAX_JSON_BYTES } from "@/lib/requestGuards";
import { packageProgress, parseCallback, splitIdempotencyKey, type ExternalItemState } from "@/lib/workWebhook";
import { signatureMatches } from "@/lib/webhookSignature";

// The work tool reports task status here (signed with the shared secret). AVELA stores the link,
// state, owner and due date of each task it sent, and recomputes the package counts from them.
// It never accepts tasks it did not send and never writes back to the tool.

export async function POST(request: Request) {
  const secret = process.env.WORK_WEBHOOK_SECRET?.trim();
  if (!secret || !supabaseServerConfigured()) {
    return NextResponse.json({ error: "The work-system webhook is not configured." }, { status: 503 });
  }

  const raw = await request.text().catch(() => "");
  if (!raw || new TextEncoder().encode(raw).length > MAX_JSON_BYTES) {
    return NextResponse.json({ error: "Body missing or too large." }, { status: 400 });
  }
  if (!signatureMatches(secret, raw, request.headers.get("x-avela-signature"))) {
    return NextResponse.json({ error: "Signature does not match." }, { status: 401 });
  }

  let parsedBody: unknown = null;
  try { parsedBody = JSON.parse(raw); } catch { parsedBody = null; }
  const parsed = parseCallback(parsedBody);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const key = splitIdempotencyKey(parsed.idempotencyKey)!;

  const packageResponse = await supabaseServerRequest(
    `/rest/v1/external_work_packages?club_id=eq.${encodeURIComponent(key.clubId)}&decision_id=eq.${encodeURIComponent(key.decisionId)}&package_key=eq.${encodeURIComponent(key.packageKey)}&select=id,item_count,connection_id,created_by,sync_state&limit=1`
  );
  const [pack] = packageResponse.ok
    ? await packageResponse.json() as Array<{ id: string; item_count: number; connection_id: string; created_by: string; sync_state: string }>
    : [];
  if (!pack || pack.sync_state === "proposed") {
    return NextResponse.json({ error: "No sent package matches this idempotencyKey." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const upsert = await supabaseServerRequest("/rest/v1/external_work_item_links?on_conflict=package_id,package_item_key", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(parsed.items.map((item) => ({
      club_id: key.clubId,
      package_id: pack.id,
      package_item_key: item.key,
      external_ref: item.externalRef,
      external_url: item.url,
      state: item.state,
      assignee_label: item.assignee,
      due_at: item.dueAt,
      blocker_label: item.blocker,
      last_external_update_at: now,
      last_sync_at: now,
      created_by: pack.created_by
    })))
  });
  if (!upsert.ok) return NextResponse.json({ error: "Task status could not be stored." }, { status: 502 });

  // Counts come from every task AVELA now knows for the package, not just this callback.
  const allResponse = await supabaseServerRequest(`/rest/v1/external_work_item_links?package_id=eq.${encodeURIComponent(pack.id)}&select=state&limit=300`);
  const states = allResponse.ok ? (await allResponse.json() as Array<{ state: ExternalItemState }>).map((row) => row.state) : parsed.items.map((item) => item.state);
  const progress = packageProgress(pack.item_count, states);
  await supabaseServerRequest(`/rest/v1/external_work_packages?id=eq.${encodeURIComponent(pack.id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...progress,
      ...(parsed.packageRef ? { external_package_ref: parsed.packageRef } : {}),
      ...(parsed.packageUrl ? { external_package_url: parsed.packageUrl } : {}),
      sync_error: null,
      last_sync_at: now,
      updated_by: pack.created_by
    })
  });
  await supabaseServerRequest(`/rest/v1/work_system_connections?id=eq.${encodeURIComponent(pack.connection_id)}`, {
    method: "PATCH",
    body: JSON.stringify({ last_sync_at: now, updated_by: pack.created_by })
  });

  return NextResponse.json({ stored: parsed.items.length, ...progress });
}
