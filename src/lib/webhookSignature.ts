import { createHmac, timingSafeEqual } from "node:crypto";

/** "sha256=<hex>" HMAC of the exact request body, sent as X-AVELA-Signature both ways. */
export function signBody(secret: string, body: string) {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export function signatureMatches(secret: string, body: string, signature: string | null) {
  if (!signature) return false;
  const expected = Buffer.from(signBody(secret, body));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
