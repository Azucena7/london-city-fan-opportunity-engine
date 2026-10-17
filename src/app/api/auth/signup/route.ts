import { NextResponse } from "next/server";
import { supabaseConfigured, supabasePublicConfig } from "@/lib/supabaseServer";
import { readJson } from "@/lib/requestGuards";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Club accounts are not configured yet." }, { status: 503 });
  }

  const body = await readJson(request) as { email?: string; password?: string } | null;
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

  if (!response.ok) {
    // A generic message, so signup never confirms whether an email already has an account.
    return NextResponse.json({ error: "The account could not be created. If you already have one, sign in or reset your password." }, { status: response.status === 429 ? 429 : 400 });
  }

  return NextResponse.json({
    created: true,
    email,
    confirmationRequired: true,
    next: "Confirm the email address, then sign in and request access to a club."
  });
}
