import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const roles = new Set(["viewer","marketing","ticketing","business","communications","compliance","direction","admin"]);

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club access is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as { requestId?: string; role?: string } | null;
  const requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";
  const role = typeof body?.role === "string" ? body.role : "";

  if (!requestId || !roles.has(role)) {
    return NextResponse.json({ error: "A valid request and membership role are required." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/rpc/approve_club_access_request", {
    method: "POST",
    body: JSON.stringify({ request_id: requestId, membership_role: role })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Access request could not be approved.", detail: payload }, { status: response.status });
  return NextResponse.json({ approved: true, request: payload });
}
