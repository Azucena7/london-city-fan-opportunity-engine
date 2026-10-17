import { NextResponse } from "next/server";
import { setSessionCookie, supabaseConfigured, supabasePublicConfig } from "@/lib/supabaseServer";
import { readJson, sessionWriteRejection } from "@/lib/requestGuards";

export async function POST(request: Request) {
  // This route sets a session without needing one, so refuse cross-site and non-JSON posts.
  const rejected = sessionWriteRejection(request);
  if (rejected) return rejected;
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Club accounts are not configured yet." }, { status: 503 });
  }

  const body = await readJson(request) as { email?: string; password?: string } | null;
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
    expires_in?: number;
    user?: { id: string; email?: string };
    error_description?: string;
    msg?: string;
  } | null;

  if (!response.ok || !payload?.access_token) {
    return NextResponse.json(
      // One message for every failure, so the response never reveals whether an account exists.
      { error: "Sign-in failed. Check the email and password, and confirm your email address if you have not yet." },
      { status: 401 }
    );
  }

  await setSessionCookie(payload.access_token, payload.expires_in);
  return NextResponse.json({ authenticated: true, user: payload.user ?? { email } });
}
