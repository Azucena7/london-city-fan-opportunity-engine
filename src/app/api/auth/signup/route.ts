import { NextResponse } from "next/server";
import { supabaseConfigured, supabasePublicConfig } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Club accounts are not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || password.length < 10) {
    return NextResponse.json({ error: "A valid email and a password of at least 10 characters are required." }, { status: 400 });
  }

  const { url, key } = supabasePublicConfig();
  const origin = new URL(request.url).origin;
  const response = await fetch(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(`${origin}/app/access`)}`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => null) as { id?: string; email?: string; msg?: string; error_description?: string } | null;
  if (!response.ok) {
    return NextResponse.json({ error: payload?.error_description || payload?.msg || "Account could not be created." }, { status: response.status });
  }

  return NextResponse.json({
    created: true,
    email,
    confirmationRequired: true,
    next: "Confirm the email address, then sign in and request access to a club."
  });
}
