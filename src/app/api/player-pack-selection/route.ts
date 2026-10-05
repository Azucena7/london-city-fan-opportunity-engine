import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ persistence: "device", selections: [] });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/player_pack_selections?club_id=eq.${encodeURIComponent(clubId)}&select=club_id,campaign_id,status,selected_player_ids,player_count,snapshot,updated_at&order=updated_at.desc`
  );
  if (!response.ok) return NextResponse.json({ error: "Player pack selections could not be loaded." }, { status: response.status });

  const selections = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ persistence: "club", selections });
}
