import "server-only";
import { cookies } from "next/headers";
import { verifyClubIdentity, privateAccessConfigured } from "./clubAuth";

export const clubCookie = "__Host-club-session";
export function clubEnvironment() {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    CLUB_SUPABASE_URL: process.env.CLUB_SUPABASE_URL,
    CLUB_SUPABASE_PUBLISHABLE_KEY: process.env.CLUB_SUPABASE_PUBLISHABLE_KEY,
    CLUB_SUPABASE_ANON_KEY: process.env.CLUB_SUPABASE_ANON_KEY,
    CLUB_PRIVATE_ACCESS_ENABLED: process.env.CLUB_PRIVATE_ACCESS_ENABLED,
  };
}
export function clubAccessEnabled() { return privateAccessConfigured(clubEnvironment()); }
export async function currentClubIdentity() {
  const token = (await cookies()).get(clubCookie)?.value;
  return token ? verifyClubIdentity(clubEnvironment(), token) : null;
}

import { permits, type ClubArea, type ClubAction } from "./clubPermissions";
export async function requireClubPermission(clubId: string, area: ClubArea, action: ClubAction) {
  const identity = await currentClubIdentity();
  const member = identity?.memberships.find(m => m.clubId === clubId);
  return member && permits(member.permissions, area, action) ? member : null;
}
