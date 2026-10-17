import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { loadLib } from "./lib/load-ts.mjs";

const pkg = (sync_state, item_count, completed_count, blocked_count = 0) => ({ sync_state, item_count, completed_count, blocked_count });

test("Delivered counts only work the club's tool received, and never exceeds it", async () => {
  const { deliveryState } = await loadLib("deliveryState");
  assert.deepEqual(deliveryState([]), { state: "not-sent" });
  assert.deepEqual(deliveryState([pkg("proposed", 4, 0), pkg("error", 2, 0)]), { state: "not-sent" });
  assert.deepEqual(deliveryState([pkg("synced", 3, 1, 1), pkg("proposed", 5, 0)]), { state: "in-flight", done: 1, total: 3, blocked: 1 });
  assert.deepEqual(deliveryState([pkg("synced", 2, 2), pkg("partial", 1, 1)]), { state: "delivered", done: 3, total: 3, blocked: 0 });
  assert.deepEqual(deliveryState([pkg("synced", 2, 9)]), { state: "delivered", done: 2, total: 2, blocked: 0 });
});

test("Learning shows Delivered and Worked as separate answers", () => {
  const page = readFileSync(new URL("../src/app/app/learning/page.tsx", import.meta.url), "utf8");
  const component = readFileSync(new URL("../src/components/DeliveredWorked.tsx", import.meta.url), "utf8");
  assert.match(page, /<DeliveredWorked/);
  assert.match(component, /Delivered · operational/);
  assert.match(component, /Worked · business impact/);
  assert.match(component, /Delivered is not Worked/);
  assert.doesNotMatch(component, /%/);
});
