import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const requestableRoles = new Set(["viewer","marketing","ticketing","business","communications","compliance","direction"]);

export async function GET() {
  if (!supabaseConfigured()) return NextResponse.json({ configured: false, requests: [], clubs: [], pendingReviews: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const [clubsResponse, ownResponse, membershipResponse] = await Promise.all([
    supabaseRequest("/rest/v1/clubs?select=id,name&order=name.asc"),
    supabaseRequest(`/rest/v1/club_access_requests?user_id=eq.${encodeURIComponent(user.id)}&select=id,club_id,email,requested_role,note,status,created_at,reviewed_at&order=created_at.desc`),
    supabaseRequest(`/rest/v1/club_memberships?user_id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=club_id,role`)
  ]);

  const clubs = clubsResponse.ok ? await clubsResponse.json() : [];
  const requests = ownResponse.ok ? await ownResponse.json() : [];
  const memberships = membershipResponse.ok
    ? await membershipResponse.json() as Array<{ club_id: string; role: string }>
    : [];

  const adminClubIds = memberships.filter((membership) => membership.role === "admin").map((membership) => membership.club_id);
  let pendingReviews: unknown[] = [];

  if (adminClubIds.length) {
    const pendingResponse = await supabaseRequest(
      `/rest/v1/club_access_requests?club_id=in.(${adminClubIds.map(encodeURIComponent).join(",")})&status=eq.pending&select=id,club_id,email,requested_role,note,status,created_at&order=created_at.asc`
    );
    if (pendingResponse.ok) pendingReviews = await pendingResponse.json();
  }

  return NextResponse.json({
    configured: true,
    user: { id: user.id, email: user.email ?? null },
    clubs,
    requests,
    memberships,
    pendingReviews
  });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club access is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user || !user.email) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as { clubId?: string; requestedRole?: string; note?: string } | null;
  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  const requestedRole = typeof body?.requestedRole === "string" ? body.requestedRole : "viewer";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : null;

  if (!clubId || !requestableRoles.has(requestedRole)) {
    return NextResponse.json({ error: "A valid club and requested role are required." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/club_access_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      user_id: user.id,
      email: user.email,
      requested_role: requestedRole,
      note,
      status: "pending",
      reviewed_by: null,
      reviewed_at: null
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Access request could not be saved.", detail: payload }, { status: response.status });
  return NextResponse.json({ requested: true, request: Array.isArray(payload) ? payload[0] : payload });
}
