import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/turnstile.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { verifyTurnstile, turnstileConfigured } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

// The verifier is faked: no request leaves the test.
async function withVerifier(secret, reply, run) {
  const realFetch = globalThis.fetch;
  const previous = process.env.TURNSTILE_SECRET_KEY;
  const calls = [];
  if (secret === undefined) delete process.env.TURNSTILE_SECRET_KEY; else process.env.TURNSTILE_SECRET_KEY = secret;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: String(init.body) });
    if (reply instanceof Error) throw reply;
    return new Response(JSON.stringify(reply.body), { status: reply.status ?? 200 });
  };
  try { await run(calls); } finally {
    globalThis.fetch = realFetch;
    if (previous === undefined) delete process.env.TURNSTILE_SECRET_KEY; else process.env.TURNSTILE_SECRET_KEY = previous;
  }
}

test("without a secret the check is skipped and nothing is sent", async () => {
  await withVerifier(undefined, { body: { success: false } }, async (calls) => {
    assert.equal(turnstileConfigured(), false);
    assert.equal(await verifyTurnstile(undefined, null), true);
    assert.equal(calls.length, 0);
  });
});

test("with a secret, a valid token passes and is verified with the visitor's IP", async () => {
  await withVerifier("test-secret", { body: { success: true } }, async (calls) => {
    assert.equal(await verifyTurnstile("token-1", "203.0.113.7"), true);
    assert.equal(calls[0].url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    assert.match(calls[0].body, /response=token-1/);
    assert.match(calls[0].body, /remoteip=203\.0\.113\.7/);
  });
});

test("with a secret, a missing, rejected or unverifiable token fails closed", async () => {
  await withVerifier("test-secret", { body: { success: true } }, async (calls) => {
    assert.equal(await verifyTurnstile("", null), false);
    assert.equal(await verifyTurnstile(null, null), false);
    assert.equal(calls.length, 0);
  });
  await withVerifier("test-secret", { body: { success: false } }, async () => {
    assert.equal(await verifyTurnstile("token-2", null), false);
  });
  await withVerifier("test-secret", { status: 500, body: {} }, async () => {
    assert.equal(await verifyTurnstile("token-3", null), false);
  });
  await withVerifier("test-secret", new Error("network"), async () => {
    assert.equal(await verifyTurnstile("token-4", null), false);
  });
});
