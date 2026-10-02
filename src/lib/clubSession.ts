import "server-only";
import { cookies } from "next/headers";
import { verifyClubIdentity, privateAccessConfigured } from "./clubAuth";

export const clubCookie = "__Host-club-session";
export function clubEnvironment() {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    CLUB_PRIVATE_ACCESS_ENABLED: process.env.CLUB_PRIVATE_ACCESS_ENABLED,
  };
}
export function clubAccessEnabled() { return privateAccessConfigured(clubEnvironment()); }
export async function currentClubIdentity() {
  const token = (await cookies()).get(clubCookie)?.value;
  return token ? verifyClubIdentity(clubEnvironment(), token) : null;
}
