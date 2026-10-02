import { NextResponse } from "next/server";
import { getClubConnectionHealth } from "@/lib/clubConnectionHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Generic operational health only. This endpoint provides no customer access.
export async function GET() {
  return NextResponse.json(await getClubConnectionHealth(), {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=60", "X-Robots-Tag": "noindex" },
  });
}
