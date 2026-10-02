import { NextResponse } from "next/server";
import { checkClubConnection, type ClubConnectionHealth } from "@/lib/clubConnectionHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
let cached: { expires: number; value: ClubConnectionHealth } | undefined;
let pending: Promise<ClubConnectionHealth> | undefined;

// Generic operational health only. This endpoint provides no customer access.
export async function GET() {
  if (!cached || cached.expires < Date.now()) {
    pending ??= checkClubConnection({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    });
    const value = await pending;
    cached = { value, expires: Date.now() + 60_000 };
    pending = undefined;
  }
  return NextResponse.json(cached.value, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=60", "X-Robots-Tag": "noindex" },
  });
}
