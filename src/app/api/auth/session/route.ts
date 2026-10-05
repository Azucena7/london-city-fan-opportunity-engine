import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export async function GET() {
  if (!supabaseConfigured()) {
    return NextResponse.json({ authenticated: false, configured: false, clubs: [] });
  }

  const user = await currentSupabaseUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, configured: true, clubs: [] });
  }

  const membershipResponse = await supabaseRequest(
    `/rest/v1/club_memberships?user_id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=club_id,role`
  );
  const memberships = membershipResponse.ok
    ? await membershipResponse.json() as Array<{ club_id: string; role: string }>
    : [];

  const clubIds = memberships.map((item) => item.club_id);
  let clubs: Array<{ id: string; name: string; role: string; permissions: string[] }> = [];

  if (clubIds.length) {
    const clubsResponse = await supabaseRequest(
      `/rest/v1/clubs?id=in.(${clubIds.map(encodeURIComponent).join(",")})&select=id,name`
    );
    const rows = clubsResponse.ok
      ? await clubsResponse.json() as Array<{ id: string; name: string }>
      : [];
    const permissionResponse = await supabaseRequest("/rest/v1/rpc/club_permission_matrix", { method: "POST", body: "{}" });
    const permissionRows = permissionResponse.ok
      ? await permissionResponse.json() as Array<{ club_id: string; area: string; action: string }>
      : [];
    clubs = rows.map((club) => ({
      ...club,
      role: memberships.find((item) => item.club_id === club.id)?.role ?? "viewer",
      permissions: permissionRows
        .filter((item) => item.club_id === club.id)
        .map((item) => `${item.area}:${item.action}`)
    }));
  }

  return NextResponse.json({
    authenticated: true,
    configured: true,
    user: { id: user.id, email: user.email ?? null },
    clubs
  });
}
