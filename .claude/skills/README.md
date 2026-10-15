# Project skills

Third-party Claude Code skills vendored into this repository so every session — including cloud
sessions, whose `~/.claude` is discarded — can use them. Each folder is an unmodified copy of the
upstream skill at the pinned commit, plus the upstream licence. Do not edit them in place; update by
re-copying from upstream and bumping the pin here.

| Skill (install name) | Upstream | Pinned commit | Licence |
|---|---|---|---|
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/taste-skill` | `f624f37a8c650b9cc550253104925efe4c8de246` | MIT |
| `image-to-code` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/image-to-code-skill` (same repo as above) | `f624f37a8c650b9cc550253104925efe4c8de246` | MIT |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/web-design-guidelines` | `063bee94c3f4df8453406c830b0a7df0f2860278` | MIT (per upstream README) |
| `playwright-cli` | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) `skills/playwright-cli` | `b85c7a736bb473bf55b584e54a09ffa698d6d871` | Apache-2.0 |

## Not vendored

- **Awesome Design MD** ([VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md),
  MIT, reviewed at `3b605329240ce735b510037cca322f1831fdd7f8`). Its 84 `DESIGN.md` files describe
  real brands. They are consulted on demand (clone into a scratch directory) for principles only and
  are not committed, so no third-party brand identity lives in this repository.
- **The `@playwright/cli` package.** It depends on a pre-release Playwright, so it is run with
  `npx -y @playwright/cli@0.1.22` instead of being added to `package.json`. The project's own
  `@playwright/test` and e2e suite are unchanged.

## Running in the cloud container

- Playwright CLI: pass `--config=.claude/playwright-cli.cloud.json` to `open`; it points at the
  pre-installed Chromium. Output goes to `.playwright-cli/` (git-ignored).
- Taste Skill: `scripts/lint.mjs` and `scripts/draw.mjs` work with plain Node. `scripts/inspect.mjs`
  drives its own Chromium and cannot start in the cloud container (root without a sandbox); use
  Playwright CLI screenshots at 1440, 768 and 390 px instead. On a normal machine with Chrome it works
  as documented.
- Web Design Guidelines fetches its rules from `raw.githubusercontent.com` on each review.
