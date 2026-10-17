import { NextResponse } from "next/server";
import { aiCallAllowed } from "@/lib/aiBudget";
import { currentSupabaseUser, supabaseConfigured } from "@/lib/supabaseServer";

// AI routes spend model credit, so they are closed by default: only signed-in users whose
// confirmed email is listed in AI_ALLOWED_EMAILS (comma-separated) may call them.
export function allowedAiEmails(value = process.env.AI_ALLOWED_EMAILS) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

type AiUser = { id: string; email?: string; email_confirmed_at?: string | null };

export async function requireAiAccess(): Promise<{ user: AiUser; denied: null } | { user: null; denied: NextResponse }> {
  const deny = (status: number, reason: string, error: string) => ({
    user: null,
    denied: NextResponse.json({ error, reason }, { status })
  });

  const allowed = allowedAiEmails();
  if (!allowed.size || !supabaseConfigured()) {
    return deny(403, "ai-not-enabled", "AI features are not enabled for this workspace.");
  }

  const user = await currentSupabaseUser() as AiUser | null;
  if (!user) {
    return deny(401, "sign-in-required", "Sign in with an approved account to use AI features.");
  }

  const email = user.email?.trim().toLowerCase();
  if (!email || !user.email_confirmed_at || !allowed.has(email)) {
    return deny(403, "account-not-approved", "Your account is not approved to use AI features.");
  }

  if (!aiCallAllowed(user.id)) {
    return deny(429, "rate-limited", "Too many AI requests in a short time. Try again in a few minutes.");
  }

  return { user, denied: null };
}
