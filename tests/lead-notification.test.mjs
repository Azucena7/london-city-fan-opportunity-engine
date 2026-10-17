import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/leadNotification.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { leadNotificationMessage, notifyPilotLead } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const lead = {
  clubName: "Synthetic FC", role: "Head of CRM", workEmail: "crm@synthetic.test", priority: "",
  sourcePath: "/for-clubs", utmSource: "newsletter", utmCampaign: "october"
};

// Resend is faked: no email leaves the test.
async function withResend(env, reply, run) {
  const realFetch = globalThis.fetch;
  const keys = ["RESEND_API_KEY", "LEAD_NOTIFY_TO", "LEAD_NOTIFY_FROM", "MORNING_READ_FROM"];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key];
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    if (reply instanceof Error) throw reply;
    return new Response("{}", { status: reply });
  };
  try { await run(calls); } finally {
    globalThis.fetch = realFetch;
    for (const key of keys) if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
  }
}

test("the message names the club and its context, and a submitted line break cannot add lines", () => {
  const message = leadNotificationMessage({ ...lead, clubName: "Synthetic FC\nBcc: someone@else.test" });
  assert.equal(message.subject, "New AVELA pilot request: Synthetic FC Bcc: someone@else.test");
  assert.match(message.text, /^Club: Synthetic FC Bcc: someone@else\.test$/m);
  assert.match(message.text, /^Priority: Not given$/m);
  assert.match(message.text, /^Source: newsletter \/ october$/m);
});

test("nothing is sent until a key and a recipient are configured", async () => {
  await withResend({ RESEND_API_KEY: "test-key" }, 200, async (calls) => {
    assert.equal(await notifyPilotLead(lead), "not-configured");
    assert.equal(calls.length, 0);
  });
});

test("a configured notification goes to the team, with replies going to the club", async () => {
  await withResend({ RESEND_API_KEY: "test-key", LEAD_NOTIFY_TO: "team@avela.test, second@avela.test", LEAD_NOTIFY_FROM: "AVELA <leads@avela.test>" }, 200, async (calls) => {
    assert.equal(await notifyPilotLead(lead), "sent");
    assert.equal(calls[0].url, "https://api.resend.com/emails");
    assert.deepEqual(calls[0].body.to, ["team@avela.test", "second@avela.test"]);
    assert.equal(calls[0].body.from, "AVELA <leads@avela.test>");
    assert.equal(calls[0].body.reply_to, "crm@synthetic.test");
  });
});

test("a failed delivery is reported, never thrown", async () => {
  await withResend({ RESEND_API_KEY: "k", LEAD_NOTIFY_TO: "team@avela.test" }, 422, async () => {
    assert.equal(await notifyPilotLead(lead), "failed");
  });
  await withResend({ RESEND_API_KEY: "k", LEAD_NOTIFY_TO: "team@avela.test" }, new Error("network"), async () => {
    assert.equal(await notifyPilotLead(lead), "failed");
  });
});
