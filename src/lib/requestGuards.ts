import { NextResponse } from "next/server";

/** No API route needs more than this; a larger body is treated as unreadable. */
export const MAX_JSON_BYTES = 64 * 1024;

/**
 * Reads a JSON request body with a size cap. Returns null, like `request.json().catch(() => null)`,
 * when the body is missing, malformed or larger than `maxBytes`, so routes keep their own 400s.
 */
export async function readJson(request: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return null;
  const text = await request.text().catch(() => "");
  if (!text || new TextEncoder().encode(text).length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Refuses browser requests sent from another site. Browsers always send Origin on cross-site
 * POSTs; a present Origin must match this host. Requests without Origin (server-to-server) pass.
 */
export function crossSiteRejection(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    originHost = "";
  }
  return originHost === host ? null : NextResponse.json({ error: "Cross-site request refused." }, { status: 403 });
}

/**
 * For routes that set a session without needing one (sign-in, password reset): same-site only,
 * and the body must be declared as JSON, which a cross-site HTML form cannot do.
 */
export function sessionWriteRejection(request: Request): NextResponse | null {
  const crossSite = crossSiteRejection(request);
  if (crossSite) return crossSite;
  const type = request.headers.get("content-type") ?? "";
  return type.toLowerCase().startsWith("application/json")
    ? null
    : NextResponse.json({ error: "Send the request as JSON." }, { status: 415 });
}
