import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/supabaseServer";

export async function POST() {
  await clearSessionCookies();
  return NextResponse.json({ authenticated: false });
}
