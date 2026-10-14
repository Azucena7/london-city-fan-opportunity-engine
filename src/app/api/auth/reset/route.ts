import { NextResponse } from "next/server";
import { setSessionCookie, supabaseConfigured, supabasePublicConfig } from "@/lib/supabaseServer";

// Completes a password reset: the recovery link from Supabase carries a short-lived access
// token, which is allowed to set a new password for its own account. On success the person is
// signed in with that session.
export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Club accounts are not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { accessToken?: string; password?: string; expiresIn?: number } | null;
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!accessToken) {
    return NextResponse.json({ error: "This reset link is missing or has expired. Request a new one." }, { status: 400 });
  }
  if (password.length < 10) {
    return NextResponse.json({ error: "Use a password of at least 10 characters." }, { status: 400 });
  }

  const { url, key } = supabasePublicConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    cache: "no-store"
  }).catch(() => null);

  if (!response?.ok) {
    const payload = await response?.json().catch(() => null) as { msg?: string; error_description?: string } | null;
    const expired = response?.status === 401 || response?.status === 403;
    return NextResponse.json({
      error: expired ? "This reset link has expired. Request a new one." : payload?.error_description || payload?.msg || "The password could not be changed."
    }, { status: response?.status ?? 502 });
  }

  const expiresIn = typeof body?.expiresIn === "number" && body.expiresIn > 0 ? Math.min(body.expiresIn, 3600) : 3600;
  await setSessionCookie(accessToken, expiresIn);
  return NextResponse.json({ reset: true });
}
