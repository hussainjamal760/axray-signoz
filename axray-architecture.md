# AXRAY — Full Technical Architecture (v2)

**Project:** A hosted coding agent — connect a GitHub repo, pick a branch, give it a task, watch it work with full observability, and get a PR at the end. Every decision the agent makes is traced through OpenTelemetry into SigNoz. The agent also queries its own SigNoz data mid-run to detect when it's stuck or looping, and self-corrects — using the SigNoz MCP Server.

**Hackathon:** Agents of SigNoz (WeMakeDevs), Track 01 — AI & Agent Observability.
**Stack:** Node.js + TypeScript, OpenTelemetry JS SDK, SigNoz (self-hosted, Foundry install), SigNoz MCP Server, GitHub OAuth + REST API, Anthropic API.

This document is written to be handed directly to a coding agent (Claude Code, Cursor, etc.) as a build spec.

---

## 0. Read this before building anything — scope reality check

WeMakeDevs themselves warned: *"the fastest way to make a good hackathon idea worse is to keep adding features."* This version of the project has three big pieces (GitHub integration, sandboxed multi-repo execution, self-correcting agent loop) instead of one. That is a real risk with a 4-person team and a few days.

The fix is not to cut the ambition, it's to build in the right order so you always have something demoable, and treat the later sections as optional layers on top of a working core:

- **Core (must work, days 1-3):** agent runs against ONE hardcoded local repo, fully traced in SigNoz, self-check loop working, explainer working. No GitHub UI yet — task is passed via CLI or a simple hardcoded form.
- **Layer 2 (days 3-4):** GitHub OAuth login + repo/branch picker UI, real cloning.
- **Layer 3 (day 4-5, cut this first if short on time):** actually opening a PR via GitHub API at the end.

If you run out of time, a project that deeply nails the core loop with one hardcoded repo beats a project that half-wires GitHub login but never gets a clean self-correction demo. Keep this priority order visible to the whole team.

---

## 1. System overview

A developer logs in with GitHub, picks a repository they own and a branch, and types a task ("fix the failing test in math.ts"). The system clones that repo into an isolated sandbox, then a coding agent works the task using tools (`read_file`, `write_file`, `run_bash`, `run_tests`). Every plan, LLM call, and tool call is wrapped in an OpenTelemetry span sent to a self-hosted SigNoz instance.

The twist: partway through, and periodically during the run, the agent itself queries SigNoz — through the **SigNoz MCP Server** — asking things like "how many times have I called write_file on this same path in the last 5 minutes?" If the answer shows an abnormal pattern (repeated retries, no progress, cost spiking), the agent is instructed to change strategy instead of continuing to repeat itself. This is a self-correction loop, not just a dashboard a human has to watch.

When the agent finishes (or gives up), if it succeeded it opens a pull request on the branch via the GitHub API. If it failed, the developer can view the full trace timeline and click "Explain this failure" to get an AI-generated root cause pointing at the exact span, backed by the file diffs from that run.

---

## 2. Architecture diagram (text form)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER'S BROWSER                            │
│  Screen 0: GitHub Login                                                 │
│  Screen A: Repo + Branch picker + Task prompt                           │
│  Screen B: Live session timeline / replay (self-corrections highlighted)│
│  Screen C: Root-cause explanation panel                                 │
│  Screen D: PR result / link                                             │
└───────────────▲──────────────────────────────────┬──────────────────────┘
                │ REST calls                        │ REST calls
┌───────────────┴──────────────────────────────────▼──────────────────────┐
│                     BACKEND API SERVER (Node.js + Express)              │
│                                                                            │
│  /api/auth/github            → OAuth login/callback                     │
│  /api/repos                  → list user's repos (GitHub API)           │
│  /api/repos/:id/branches     → list branches (GitHub API)               │
│  /api/sessions        POST   → clone repo, start agent run              │
│  /api/sessions               → list past sessions (SigNoz Query API)    │
│  /api/sessions/:id/trace     → full span tree (SigNoz Query API)        │
│  /api/sessions/:id/diffs     → file diffs from that run                 │
│  /api/sessions/:id/pr        → PR status/link once created              │
│  /api/explain          POST  → root-cause explainer (calls LLM)         │
│                                                                            │
└───────────────▲──────────────────────┬────────────────┬─────────────────┘
                │ trace/log queries     │ clone/run in    │ create branch
                │                       │ sandbox          │ commit + open PR
┌───────────────┴──────────┐  ┌─────────▼──────────┐  ┌───▼───────────────┐
│   SIGNOZ (self-hosted)    │  │  SANDBOX RUNNER      │  │   GITHUB API      │
│   Foundry install         │  │  (Docker container    │  │  (REST, via       │
│   + SigNoz MCP Server     │◄─┼─ per session, repo    │  │   Octokit)        │
│   on port 8000            │  │  cloned inside)        │  │                   │
└───────────────▲───────────┘  └─────────┬──────────┘  └───────────────────┘
                │ MCP protocol            │ runs the agent loop inside
                │ (agent queries its       │
                │  own telemetry mid-run)  │
                │                          ▼
                │              ┌──────────────────────────┐
                └──────────────┤   CODING AGENT (in sandbox)│
                                │   agent-runner.ts           │
                                │   tools/ (read/write/bash/  │
                                │           test)             │
                                │   self-check.ts  ← NEW      │
                                │   instrumentation.ts        │
                                │   diff-capture.ts           │
                                └──────────────────────────┘
```

**Key new idea vs v1:** the agent is now a client of TWO things — it calls the LLM to decide what to do, AND it calls the SigNoz MCP Server mid-run to check its own behavior. That second connection is what makes this "self-checking."

---

## 3. Repository structure

Stack: Next.js (App Router, TypeScript) for the frontend, Express (TypeScript) for the backend, MongoDB + Mongoose for app data (users, sessions, PR links — NOT traces, those live in SigNoz/ClickHouse), Socket.io for live session streaming, Docker + `dockerode` for sandboxing, Octokit for GitHub, Zod for shared validation, all wired together as a Turborepo monorepo.

```
axray/
├── casting.yaml                       # Foundry config, MCP enabled
├── turbo.json
├── package.json                       # root workspace
├── .env.example
│
├── apps/
│   ├── web/                           # Person 4 (+ help from others) — Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/page.tsx     # Screen 0
│   │   │   ├── sessions/
│   │   │   │   ├── new/page.tsx       # Screen A: repo/branch/prompt
│   │   │   │   └── [id]/page.tsx      # Screens B + C + D combined
│   │   │   ├── api/                   # thin proxy routes only (e.g. OAuth redirect)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                    # buttons, dropdowns (shadcn/ui recommended)
│   │   │   ├── session-timeline/      # Screen B — scrubber + self-correction markers
│   │   │   ├── explain-panel/         # Screen C
│   │   │   └── pr-result/             # Screen D
│   │   ├── lib/
│   │   │   ├── api-client.ts          # typed fetch wrapper, uses shared-types
│   │   │   └── socket.ts              # socket.io client setup
│   │   ├── hooks/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   ├── server/                        # Person 4 — Express backend
│   │   ├── src/
│   │   │   ├── config/                # env validation (zod), constants
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts     # GitHub OAuth
│   │   │   │   ├── repos.routes.ts    # list repos/branches
│   │   │   │   ├── sessions.routes.ts # create + list sessions
│   │   │   │   ├── explain.routes.ts
│   │   │   │   └── pr.routes.ts       # PR status
│   │   │   ├── controllers/           # thin handlers, delegate to services
│   │   │   ├── services/
│   │   │   │   ├── github.service.ts      # wraps Octokit
│   │   │   │   ├── sandbox.service.ts     # dockerode: spin up/tear down containers
│   │   │   │   ├── signoz.service.ts      # SigNoz Query API client
│   │   │   │   └── explainer.service.ts
│   │   │   ├── models/                # Mongoose schemas
│   │   │   │   ├── user.model.ts
│   │   │   │   └── session.model.ts
│   │   │   ├── sockets/
│   │   │   │   └── session.socket.ts  # streams live agent events to Screen B
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── error.middleware.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── agent/                         # Person 1 + Person 2 — runs INSIDE the Docker sandbox
│       ├── src/
│       │   ├── agent-runner.ts        # main loop, calls self-check.ts
│       │   ├── tools/
│       │   │   ├── read-file.ts
│       │   │   ├── write-file.ts
│       │   │   ├── run-bash.ts
│       │   │   └── run-tests.ts
│       │   ├── self-check.ts          # queries SigNoz MCP mid-run
│       │   ├── instrumentation.ts     # OTel SDK setup, tracer, span helpers
│       │   ├── diff-capture.ts        # before/after file snapshots
│       │   ├── github-commit.ts       # commits + pushes agent's changes
│       │   └── index.ts               # entry point, invoked by sandbox.service.ts
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared-types/                  # Zod schemas + inferred TS types
│   │   └── src/
│   │       ├── session.schema.ts      # used by web AND server, one source of truth
│   │       └── span-attributes.ts     # the OTel span schema from Section 4, typed
│   ├── eslint-config/
│   └── tsconfig/
│
└── signoz-config/                     # Person 3
    ├── dashboards/
    │   ├── cost-timeline.json
    │   ├── retry-rate.json
    │   ├── self-correction-count.json
    │   └── span-waterfall.json
    └── alerts/
        └── retry-loop-alert.json
```

**Why this layout:** `apps/` holds deployable things, `packages/` holds shared code — standard Turborepo convention. `shared-types` is the single source of truth for the span schema in Section 4, so `agent`, `server`, and `web` can never drift out of sync on field names. Inside `server/`, controllers stay thin and services hold the real logic (Octokit calls, dockerode calls, SigNoz queries) — standard separation for testability.

---

## 4. OpenTelemetry span schema (the contract — agree on this on day 1)

Same core schema as before (Section 4 in v1), with these additions.

### Trace-level (root span) — added fields

| Field | Example value | Notes |
|---|---|---|
| span name | `agent.session` | unchanged |
| `session.repo` | `"octocat/hello-world"` | NEW |
| `session.branch` | `"agent/fix-math-test"` | NEW — the branch the agent works on, never main |
| `session.pr_url` | `"https://github.com/.../pull/42"` | NEW — set once PR is opened |
| `session.self_corrections` | `2` | NEW — count of times the agent changed strategy after a self-check |

### NEW span type: self-check

| Field | Example | Notes |
|---|---|---|
| span name | `agent.self_check` | nested inside `agent.turn`, runs periodically (e.g. every 3rd turn, or after any tool error) |
| `self_check.query` | `"retry count for write_file on src/math.ts in last 5 min"` | the MCP query the agent made |
| `self_check.mcp_tool_used` | `"execute_builder_query"` | which SigNoz MCP tool was called (see Section 5.5 for the confirmed real tool names) |
| `self_check.result_summary` | `"3 retries detected, above normal (1)"` | |
| `self_check.triggered_correction` | `true` \| `false` | did this check cause the agent to change plan |
| `self_check.new_strategy` | `"abandon direct edit, re-read file first"` | only set if triggered_correction is true |
| `self_check.alert_created` | `true` \| `false` | NEW — set true if this check led the agent to create a brand-new SigNoz alert rule for a pattern not seen before (Section 5.5, item 1) |

This is the span type your entire "wow" story depends on. Make sure `self_check.triggered_correction = true` events are easy to query — you will build both a dashboard panel and a UI highlight around exactly this field.

### LLM call span — use OpenTelemetry's standard GenAI attribute names, not custom ones

Replace the `llm.*` names from the original v1 draft with the official OpenTelemetry GenAI semantic conventions (see Section 5.5, item 3, for why):

| Field | Example | Notes |
|---|---|---|
| span name | `llm.call` | span name itself can stay as-is, it's the attributes that should follow the standard |
| `gen_ai.system` | `"anthropic"` | |
| `gen_ai.operation.name` | `"chat"` | |
| `gen_ai.request.model` | `"claude-sonnet-4-6"` | |
| `gen_ai.usage.input_tokens` | `1200` | |
| `gen_ai.usage.output_tokens` | `340` | |
| `llm.cost_usd` | `0.0091` | no OTel standard field for cost yet, keep this one custom |
| `llm.latency_ms` | `1840` | no OTel standard field for this either, keep custom |

### Tool call span — one addition

On any tool failure, call `span.recordException(error)` in addition to setting `tool.result_status = "error"` (see Section 5.5, item 4). This is a standard OpenTelemetry API call, not a custom attribute, so it isn't a new row in this table — but don't skip it, it's what makes SigNoz's Exceptions view work.

Everything else (tool.call fields, diff snapshots) stays as defined earlier in this section.

---

## 5. The self-check mechanism — how it actually works

This is the part that's genuinely new territory, so it's worth being explicit about the mechanics.

```
Inside agent-runner.ts, after every turn (or every N turns):

  call self-check.ts:

    1. Build a query about the agent's own recent behavior, e.g.:
       "How many tool.call spans with tool.name=write_file and the
        same tool.args.path have occurred for session.id=X in the
        last 5 minutes?"

    2. Send this as a natural-language request to the SigNoz MCP
       Server (same protocol Cursor/Claude Code uses), using an MCP
       client inside the agent process itself. The agent process is
       BOTH an OTel exporter (sending its own traces to SigNoz) AND
       an MCP client (asking SigNoz questions about those same traces).

    3. Parse the MCP tool result. Compare against a simple threshold
       you define, e.g.: "if retries on the same tool+args > 2, this
       counts as a loop."

    4. If a loop or cost-spike is detected:
       - record a self_check span with triggered_correction = true
       - inject an extra system message into the agent's next LLM
         call: "You've retried this exact action 3 times without
         success. Do not repeat it. Try a different approach: re-read
         the file first, or ask for the test output before editing again."
       - increment session.self_corrections

    5. If nothing unusual: record the self_check span with
       triggered_correction = false, continue normally.
```

**Practical build note:** you do not need a full MCP client library to make this work for the hackathon. The MCP server exposes tools over HTTP; the simplest path is to have `self-check.ts` make a direct HTTP call to `http://localhost:8000/mcp` using the same request shape the MCP protocol expects. The confirmed real tool names to use (from the official `signoz-mcp-server` repo) are `execute_builder_query` (for the retry-count/cost query described above) and `signoz_fetch_apm_metrics` (for quick service-level checks). Using the official MCP TypeScript SDK client is cleaner if time allows, but a raw HTTP call is a legitimate shortcut for a hackathon and still genuinely demonstrates the concept.

---

## 5.5 Advanced SigNoz usage — what separates AXRAY from every other "wrap spans around an agent" submission

Most teams will stop at: send traces, build a static dashboard, query it back. The five additions below go past that, and each one maps directly to a judging criterion (noted in brackets). Build these in roughly this priority order if time is tight — items 1 and 2 are the highest leverage.

### 1. The agent creates its own alerts, not just reads them [Best Use of SigNoz, Creativity]

The MCP server's alert-rule tools are not read-only — they can create rules. When `self-check.ts` detects a **new** failure pattern it hasn't seen flagged before (e.g. a specific tool consistently failing against a specific file type, not just a simple retry loop), instead of only reacting locally, it calls the MCP alert-creation tool to add a permanent alert rule in SigNoz for that pattern.

```
self-check.ts, extended:

  if (novel_pattern_detected && not_already_alerted_on(pattern)):
    call MCP alert-rule-create tool with:
      { metric: "tool.retry_count", condition: "> 2",
        filter: { "tool.name": patternDetails.toolName },
        name: `auto-generated: repeated ${patternDetails.toolName} failures` }
    record a new span field: self_check.alert_created = true
```

This means the observability layer gets smarter across sessions, not just within one session. Demo line: "the second time this bug type occurred, the system had already built its own alert for it from the first occurrence."

### 2. Auto-generated postmortem on failure [Presentation Quality, Best Use of SigNoz]

SigNoz's own documented use case for the MCP server includes compiling postmortem evidence packs for on-call teams. Build the same thing for a failed AXRAY session: on failure, pull the full trace, the diffs, and the self-check history, and generate a short structured document:

```
## Postmortem: session <id>
- Task: <original prompt>
- Outcome: failed after <n> turns
- Root cause: <from the explainer, Section 9 in v1 doc>
- Self-corrections attempted: <count, with what changed each time>
- Cost: $<total>
- Files touched: <list, with diff links>
```

Render this as a downloadable artifact on Screen C alongside the explanation. This directly mirrors a real SRE workflow, which is worth saying explicitly in your README and demo narration since it signals you understood the problem SigNoz actually solves for real teams, not just the hackathon prompt.

### 3. Use OpenTelemetry's official GenAI semantic conventions, not custom names [Technical Excellence]

Replace the custom `llm.*` attribute names from Section 4 with the standard OpenTelemetry GenAI semantic convention names, since these are what real production systems use and what SigNoz's own dashboards are built to recognize:

| Old (v1 custom name) | Use instead (OTel standard) |
|---|---|
| `llm.model` | `gen_ai.request.model` |
| `llm.input_tokens` | `gen_ai.usage.input_tokens` |
| `llm.output_tokens` | `gen_ai.usage.output_tokens` |
| (new) | `gen_ai.system` = `"anthropic"` |
| (new) | `gen_ai.operation.name` = `"chat"` |

Keep your custom fields (`tool.retry_count`, `self_check.*`, `session.*`) as-is since there's no standard for agent-specific concepts yet — but for anything that maps to a real OTel convention, use the real name. This is a small change with outsized signal to judges who know what they're looking at.

### 4. Record real exceptions, don't just set a status attribute [Best Use of SigNoz]

When a tool call fails, call `span.recordException(error)` (part of the standard OpenTelemetry API) instead of only setting `tool.result_status = "error"`. This populates SigNoz's dedicated **Exceptions** view automatically — a feature most entrants will never touch because they don't know to look for it. In your demo, click into that tab and show it working alongside your custom dashboards; it costs one extra line of code per failure site.

### 5. Dashboards are generated on demand, not shipped as static JSON [Creativity, UX]

Instead of pre-building `signoz-config/dashboards/*.json` and importing them once, have the backend call the MCP dashboard-creation flow the first time a new repo is connected — a natural-language request like "create a cost-timeline and retry-rate dashboard scoped to this repo" — the same pattern SigNoz's own "Noz" AI teammate uses internally. Keep the static JSON files as a fallback in case the live-generation step fails during the demo, but lead with the dynamic version since it's a stronger, more literal answer to "best use of SigNoz."

---

## 6. Sandboxed execution (needed because you're now running on real user repos)

Because the agent now clones and modifies a real GitHub repository chosen by the developer, it cannot run loose on your host machine. Each session needs isolation.

```
sandbox-runner.ts (backend):

  function startSession(repoFullName, branch, task, githubToken):
    sessionId = uuid()
    workDir = `/tmp/sandboxes/${sessionId}`

    1. git clone --branch <branch> https://<token>@github.com/<repo>.git workDir
    2. Launch a Docker container:
         - mount workDir into the container
         - no network access except to your SigNoz OTel endpoint,
           the SigNoz MCP endpoint, and the LLM API (allowlist these,
           block everything else — this is both a safety measure and
           a good line in your README about responsible agent design)
         - run: node packages/agent/dist/index.js --task="<task>" --dir=/workspace
    3. Stream container logs to your backend for live status
    4. On completion, if session.status == success:
         git add -A && git commit -m "Agent: <task>"
         git push origin <branch>
         call GitHub API to open a PR from <branch> into the repo's default branch
    5. Tear down the container
```

For the hackathon demo, a single Docker container reused sequentially (not a full multi-tenant queue) is completely fine — judges are evaluating the concept and the SigNoz integration, not production-grade infra isolation. Say this plainly in your README rather than over-engineering it.

---

## 7. GitHub integration — exact pieces

### OAuth login (Screen 0)
Register a GitHub OAuth App (github.com/settings/developers) with callback URL `http://localhost:PORT/api/auth/github/callback`, scopes: `repo` (needed to read private repos, push branches, open PRs).

```
GET /api/auth/github            → redirects to GitHub's authorize URL
GET /api/auth/github/callback   → exchanges code for access_token,
                                   stores it in a session (cookie or JWT)
```

### Repo + branch picker (Screen A)
```
GET /api/repos             → Octokit: GET /user/repos, return name + default_branch
GET /api/repos/:id/branches → Octokit: GET /repos/:owner/:repo/branches
```

### PR creation (after agent succeeds)
```
Octokit: POST /repos/:owner/:repo/pulls
  { title, head: agentBranchName, base: originalBranch, body: <auto-generated summary> }
```
Generate the PR body from the trace: task description, number of turns, files changed, and (nice touch) a link to the SigNoz trace/session view so anyone reviewing the PR can see exactly how the agent got there.

---

## 8. Web UI — screens in detail

### Screen 0 — GitHub Login
Simple "Sign in with GitHub" button. Nothing else needed.

### Screen A — New session
Dropdown 1: repo (from `/api/repos`). Dropdown 2: branch (from `/api/repos/:id/branches`, populated after repo is chosen). Text box: task prompt. Button: "Start agent". On submit, calls `POST /api/sessions`, redirects to Screen B for that session.

### Screen B — Live timeline / replay
Same as v1 (turn-by-turn scrubber), with one addition: any turn where `self_check.triggered_correction = true` gets a distinct marker (e.g. a small icon) on the timeline. Clicking it shows the self-check query, what SigNoz reported, and what the agent changed. This is your single best demo moment — a judge should be able to see, in one click, "the agent caught itself repeating a mistake and changed course."

### Screen C — Explanation panel
Unchanged from v1 — appears on failed sessions, shows culprit span + diff + suggested fix.

### Screen D — PR result
On success: shows the PR link, a short auto-generated summary, and how many self-corrections happened along the way ("this agent caught and corrected itself 2 times before finishing"). This is a strong closing beat for a demo video — observability directly producing a better, cheaper, more reliable outcome.

---

## 9. Build order (updated for the bigger scope)

**Day 1 (whole team, ~2 hrs):** agree on the span schema (Section 4), including the new self-check fields. Also agree on the MVP cut line from Section 0.

**Day 1-2:**
- Person 1: agent loop + tools, running against ONE hardcoded local sample repo (no GitHub yet). Get this fully working first.
- Person 2: instrumentation.ts wired into Person 1's loop as it becomes available. Then build self-check.ts once basic traces are flowing (this needs traces to exist before it can query them).
- Person 3: Foundry install with MCP enabled, confirm `localhost:8000/livez` responds, confirm a manual MCP query works from Claude Code/Cursor by hand before anyone codes against it.
- Person 4: scaffold Express + React with mock data; start GitHub OAuth app registration and login flow in parallel (this doesn't depend on the agent at all).

**Day 3:** integrate agent + SigNoz + self-check end to end, still against the hardcoded local repo. Get one full demo of a self-correction happening. This is your safety-net milestone — if you had to stop here, you'd still have a real demo.

**Day 4:** layer in GitHub — repo/branch picker, sandboxed cloning, real end-to-end run against a real repo. Build the explainer and dashboards/alerts in parallel if a team member is free.

**Day 5 (only if time remains):** PR creation on success. Otherwise, demo can end at "agent finished, here's the diff and the trace" without actually calling the GitHub PR API — still a complete, honest demo.

**Always:** record a fallback demo video by end of Day 4 using the hardcoded-repo version, in case the GitHub layer has integration issues on the final day.

---

## 10. What "done" looks like for the demo

1. Sign in with GitHub, pick a repo and branch, type a task.
2. Watch the timeline live — a self-check marker appears, click it: "agent detected it was repeating an edit, changed strategy."
3. Agent finishes, PR link appears (or, fallback: diff + trace shown directly).
4. Cut to SigNoz: show the self-correction-count dashboard panel and the retry-loop alert that fired for this session.
5. If you have a failed session recorded too, show "Explain this failure" on that one for contrast — success path corrected itself, this one didn't and here's exactly why.

This sequence demonstrates every judging criterion, and the self-check mechanism specifically is the part almost no other team will have built, because it requires knowing the SigNoz MCP Server exists and treating it as something the agent calls, not just something a human dashboard uses.
