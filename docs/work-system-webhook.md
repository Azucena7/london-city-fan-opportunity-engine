# Work-system webhook (generic connector)

AVELA recommends and records decisions; the club's own tool (Asana, Monday, Jira, Planner…)
runs the work and stays the source of truth for task status. The generic webhook is the
first connector: it works with any tool directly or through Zapier, Make or n8n.

## Configuration (deployment environment, never the database)

| Variable | Purpose |
|---|---|
| `WORK_WEBHOOK_URL` | HTTPS endpoint that receives approved packages (e.g. a Zapier "Catch Hook") |
| `WORK_WEBHOOK_SECRET` | Shared secret used to sign both directions |
| `SITE_URL` | Public AVELA URL, used to build the callback address |

A `work_system_connections` row (system = the club's tool, `connection_ref` = `webhook`) and an
enabled routing rule decide which item categories (approval, activation, schedule) are sent.

## 1. AVELA → tool: `POST WORK_WEBHOOK_URL`

Sent only after a person proposes the handoff and then confirms the send.

Headers: `X-AVELA-Signature: sha256=<hex HMAC of the body>`, `X-AVELA-Idempotency-Key: <key>`.

```json
{
  "version": "1",
  "idempotencyKey": "<clubId>:<decisionId>:<packageKey>",
  "clubId": "…", "decisionId": "…",
  "package": { "key": "…", "title": "Everton activation", "items": [
    { "key": "approve-draft", "category": "approval", "title": "Approve the Everton draft" }
  ] },
  "callbackUrl": "https://<SITE_URL>/api/work-system/callback",
  "sentAt": "2026-10-17T10:00:00.000Z"
}
```

The same idempotency key is sent again if a send is retried: the tool should create tasks once
per key. The reply may include `{ "packageRef": "…", "packageUrl": "https://…" }`.

## 2. Tool → AVELA: `POST /api/work-system/callback`

Signed the same way with `WORK_WEBHOOK_SECRET`. Send it whenever tasks change.

```json
{
  "idempotencyKey": "<clubId>:<decisionId>:<packageKey>",
  "packageUrl": "https://app.example.com/project/123",
  "items": [
    { "key": "approve-draft", "externalRef": "T-1", "state": "done",
      "url": "https://app.example.com/task/1", "assignee": "Marketing lead", "dueAt": "2026-10-15" },
    { "key": "send-crm", "externalRef": "T-2", "state": "blocked", "blocker": "Consent list pending" }
  ]
}
```

`state` is one of `created`, `in-progress`, `blocked`, `done`. Only `https` links are kept. A
callback for a package AVELA has not sent is refused. AVELA recomputes the package counts from
the latest state of every task (done over sent, never an estimated percentage) and never writes
back to the tool.

## Delivered is not Worked

The tool reports whether the work was **delivered**. Whether it **worked** (tickets, attendance,
reach) is measured separately in Learning, against a baseline agreed with the club.
