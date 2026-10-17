import test from "node:test";
import assert from "node:assert/strict";
import { loadLib } from "./lib/load-ts.mjs";

const { dispatchPayload, parseCallback, packageProgress, idempotencyKey, splitIdempotencyKey } = await loadLib("workWebhook");
const { signBody, signatureMatches } = await loadLib("webhookSignature");

const base = { clubId: "club-1", decisionId: "decision-everton", packageKey: "pkg-1", title: "Everton activation", callbackUrl: "https://avela.test/api/work-system/callback", sentAt: "2026-10-17T10:00:00Z" };

test("a dispatch carries only routable items and one idempotency key per club, decision and package", () => {
  const payload = dispatchPayload({ ...base, items: [
    { key: "approve-draft", category: "approval", title: "Approve the Everton draft" },
    { key: "bad", category: "kanban" },
    { key: "", category: "activation" },
    { key: "send-crm", category: "activation" }
  ] });
  assert.equal(payload.idempotencyKey, "club-1:decision-everton:pkg-1");
  assert.deepEqual(payload.package.items, [
    { key: "approve-draft", category: "approval", title: "Approve the Everton draft" },
    { key: "send-crm", category: "activation" }
  ]);
  assert.equal(dispatchPayload({ ...base, items: [{ key: "x", category: "nope" }] }), null, "nothing routable, nothing sent");
});

test("idempotency keys round-trip even when package keys contain colons", () => {
  assert.deepEqual(splitIdempotencyKey(idempotencyKey("c", "d", "pkg:2")), { clubId: "c", decisionId: "d", packageKey: "pkg:2" });
  assert.equal(splitIdempotencyKey("only-one-part"), null);
});

test("a status callback is accepted whole or rejected, never half-stored", () => {
  const ok = parseCallback({
    idempotencyKey: "club-1:decision-everton:pkg-1",
    packageUrl: "https://app.asana.com/0/123",
    items: [
      { key: "approve-draft", externalRef: "T-1", state: "done", url: "https://app.asana.com/0/123/1", assignee: "Marketing lead", dueAt: "2026-10-15" },
      { key: "send-crm", externalRef: "T-2", state: "blocked", blocker: "Consent list pending", url: "javascript:alert(1)" }
    ]
  });
  assert.equal(ok.items.length, 2);
  assert.equal(ok.items[0].dueAt, "2026-10-15T00:00:00.000Z");
  assert.equal(ok.items[1].url, null, "only https links are kept");
  assert.equal(ok.packageUrl, "https://app.asana.com/0/123");
  assert.match(parseCallback({ idempotencyKey: "club-1:d:p", items: [{ key: "a", externalRef: "T", state: "finished" }] }).error, /state/);
  assert.match(parseCallback({ items: [] }).error, /idempotencyKey/);
});

test("progress is reported tasks over tasks sent, never an estimated percentage", () => {
  assert.deepEqual(packageProgress(3, ["done", "blocked"]), { completed_count: 1, blocked_count: 1, sync_state: "partial" });
  assert.deepEqual(packageProgress(2, ["done", "done"]), { completed_count: 2, blocked_count: 0, sync_state: "synced" });
  assert.equal(packageProgress(1, ["done", "done", "done"]).completed_count, 1, "never more than what was sent");
});

test("signatures cover the exact body and reject tampering", () => {
  const body = JSON.stringify({ a: 1 });
  const signature = signBody("secret", body);
  assert.match(signature, /^sha256=[0-9a-f]{64}$/);
  assert.equal(signatureMatches("secret", body, signature), true);
  assert.equal(signatureMatches("secret", body + " ", signature), false);
  assert.equal(signatureMatches("other", body, signature), false);
  assert.equal(signatureMatches("secret", body, null), false);
});
