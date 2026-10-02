import { NextResponse } from "next/server";
import { setSessionCookies, supabaseConfigured, supabasePublicConfig } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Club accounts are not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { url, key } = supabasePublicConfig();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => null) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    user?: { id: string; email?: string };
    error_description?: string;
    msg?: string;
  } | null;

  if (!response.ok || !payload?.access_token || !payload.refresh_token) {
    return NextResponse.json(
      { error: payload?.error_description || payload?.msg || "Sign-in failed." },
      { status: 401 }
    );
  }

  await setSessionCookies(payload.access_token, payload.refresh_token, payload.expires_in);
  return NextResponse.json({ authenticated: true, user: payload.user ?? { email } });
}
