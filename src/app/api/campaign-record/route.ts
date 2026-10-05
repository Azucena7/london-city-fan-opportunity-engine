import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ persistence: "device", records: [] });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = url.searchParams.get("clubId")?.trim() ?? "";
  const kind = url.searchParams.get("kind");
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });
  if (kind && kind !== "fixture" && kind !== "commercial") {
    return NextResponse.json({ error: "Unsupported campaign kind." }, { status: 400 });
  }

  const kindFilter = kind ? `&campaign_kind=eq.${encodeURIComponent(kind)}` : "";
  const response = await supabaseRequest(
    `/rest/v1/campaign_records?club_id=eq.${encodeURIComponent(clubId)}${kindFilter}&select=club_id,campaign_key,campaign_kind,fixture_id,status,state,updated_at&order=updated_at.desc`
  );
  if (!response.ok) return NextResponse.json({ error: "Campaign records could not be loaded." }, { status: response.status });

  const records = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ persistence: "club", records });
}
