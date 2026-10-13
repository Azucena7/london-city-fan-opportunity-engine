// Client-side de-duplication for GET /api/auth/session.
// Workspace pages mount many panels that each need the club session; without this every
// panel issued its own request (and up to four Supabase queries server-side). Callers get a
// fresh Response clone, so existing `response.ok` / `response.json()` handling is unchanged.

const MAX_AGE_MS = 30_000;

let cached: { promise: Promise<Response>; at: number } | null = null;

export function fetchClubSession(): Promise<Response> {
  const now = Date.now();
  if (!cached || now - cached.at > MAX_AGE_MS) {
    const promise = fetch("/api/auth/session", { cache: "no-store" });
    cached = { promise, at: now };
    // Never keep a failed request: the next caller retries.
    promise.then((response) => { if (!response.ok && cached?.promise === promise) cached = null; }, () => { if (cached?.promise === promise) cached = null; });
  }
  return cached.promise.then((response) => response.clone());
}

// Call after sign-in, sign-out or membership changes so the next read is fresh.
export function invalidateClubSession() {
  cached = null;
}
