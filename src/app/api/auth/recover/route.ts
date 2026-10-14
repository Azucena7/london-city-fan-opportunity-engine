import { NextResponse } from "next/server";
import { supabaseConfigured, supabasePublicConfig } from "@/lib/supabaseServer";

// Sends a Supabase password-recovery email. The answer is the same whether or not an account
// exists for the address, so this route cannot be used to discover who has an account.
export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Club accounts are not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter the email address of your account." }, { status: 400 });
  }

  const { url, key } = supabasePublicConfig();
  const redirectTo = `${new URL(request.url).origin}/app/access/reset`;
  const response = await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store"
  }).catch(() => null);

  // Rate limits are the one failure worth telling the person about; anything else stays generic.
  if (response?.status === 429) {
    return NextResponse.json({ error: "Too many reset emails were requested. Wait a few minutes and try again." }, { status: 429 });
  }

  return NextResponse.json({
    sent: true,
    next: "If an account exists for that email, a reset link is on its way. Open it on this device to choose a new password."
  });
}
