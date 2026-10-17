// Cloudflare Turnstile check for public forms. Until TURNSTILE_SECRET_KEY is set the check is
// skipped, so the form keeps working before the keys exist. Once it is set, a missing token or an
// unreachable verifier rejects the submission (fail closed).

const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: unknown, remoteIp: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp) form.set("remoteip", remoteIp);
  try {
    const response = await fetch(verifyUrl, { method: "POST", body: form, signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
