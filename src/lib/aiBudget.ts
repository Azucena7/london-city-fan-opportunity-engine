// Spend guards for the AI routes. Every request is capped at a fixed number of output tokens,
// and each approved user may make a limited number of calls in a rolling window. The window is
// kept in memory, so it holds per server instance: a ceiling on runaway use, not a billing quota.

export const AI_MAX_OUTPUT_TOKENS = 900;
export const AI_CALLS_PER_WINDOW = 20;
export const AI_WINDOW_MS = 10 * 60 * 1000;

const recentCalls = new Map<string, number[]>();

/** Records a call for this user and says whether it is over the limit (the call is then not counted). */
export function aiCallAllowed(
  userId: string,
  now = Date.now(),
  store: Map<string, number[]> = recentCalls,
  limit = AI_CALLS_PER_WINDOW,
  windowMs = AI_WINDOW_MS
) {
  const calls = (store.get(userId) ?? []).filter((at) => now - at < windowMs);
  if (calls.length >= limit) {
    store.set(userId, calls);
    return false;
  }
  calls.push(now);
  store.set(userId, calls);
  return true;
}

type GatewayUsage = { prompt_tokens?: number; completion_tokens?: number } | undefined;

/** One structured log line per AI call, so spend can be traced without logging prompts. */
export function aiUsageLog(route: string, userId: string, model: string, usage: GatewayUsage) {
  return JSON.stringify({
    event: "ai-usage",
    route,
    userId,
    model,
    promptTokens: usage?.prompt_tokens ?? null,
    completionTokens: usage?.completion_tokens ?? null
  });
}
