import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/aiBudget.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { aiCallAllowed, aiUsageLog, AI_MAX_OUTPUT_TOKENS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("a user may call AI up to the limit within the window, then is refused", () => {
  const store = new Map();
  for (let i = 0; i < 3; i++) assert.equal(aiCallAllowed("u1", 1000 + i, store, 3, 60_000), true);
  assert.equal(aiCallAllowed("u1", 1010, store, 3, 60_000), false);
  assert.equal(store.get("u1").length, 3, "a refused call is not counted");
  assert.equal(aiCallAllowed("u2", 1010, store, 3, 60_000), true, "limits are per user");
});

test("calls older than the window stop counting", () => {
  const store = new Map();
  for (let i = 0; i < 3; i++) aiCallAllowed("u1", i, store, 3, 60_000);
  assert.equal(aiCallAllowed("u1", 60_001, store, 3, 60_000), true);
});

test("usage log carries token counts but never prompt content", () => {
  const line = JSON.parse(aiUsageLog("ask-avela", "u1", "model-x", { prompt_tokens: 120, completion_tokens: 80 }));
  assert.deepEqual(line, { event: "ai-usage", route: "ask-avela", userId: "u1", model: "model-x", promptTokens: 120, completionTokens: 80 });
  assert.equal(JSON.parse(aiUsageLog("x", "u", "m", undefined)).promptTokens, null);
  assert.ok(AI_MAX_OUTPUT_TOKENS > 0 && AI_MAX_OUTPUT_TOKENS <= 2000);
});
