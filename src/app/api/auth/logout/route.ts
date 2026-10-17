import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/supabaseServer";
import { crossSiteRejection } from "@/lib/requestGuards";

export async function POST(request: Request) {
  // Another site cannot sign people out.
  const rejected = crossSiteRejection(request);
  if (rejected) return rejected;
  await clearSessionCookies();
  return NextResponse.json({ authenticated: false });
}
