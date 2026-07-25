<div align="center">

# 🛰️ AXRAY — The AI Agent Flight Recorder & Telemetry Engine

### *If you can't observe your AI coding agents, you don't own them.*

**An Open-Source, OpenTelemetry-Native AI Agent Orchestrator & Observability Platform Powered by SigNoz**

[![Built on OpenTelemetry](https://img.shields.io/badge/Built%20on-OpenTelemetry-7c5cff?style=for-the-badge&logo=opentelemetry)](https://opentelemetry.io/)
[![Powered by SigNoz](https://img.shields.io/badge/Powered%20by-SigNoz-00C49F?style=for-the-badge&logo=prometheus)](https://signoz.io/)
[![SigNoz MCP Protocol](https://img.shields.io/badge/Integration-SigNoz%20MCP-FF6B6B?style=for-the-badge&logo=graphql)](https://modelcontextprotocol.io/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Docker Sandbox](https://img.shields.io/badge/Sandbox-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Architecture](#-system-architecture) • [Hero Feature: Time-in-Brain](#-the-hero-feature-time-in-brain-vs-time-in-environment) • [SigNoz MCP & ClickHouse](#-signoz-deep-integration--clickhouse-engine) • [Guided Code Tour](#-guided-architecture--code-tour) • [OTel Semantic Conventions](#-opentelemetry-genai-semantic-conventions) • [Quickstart](#-quickstart) • [Full Monorepo Map](#-monorepo-structure--feature-domains)

---

</div>

## 🏆 Hackathon Spotlight: Why AXRAY Wins "Agents of SigNoz"

Autonomous AI coding agents operate as non-deterministic state machines: they parse prompts, generate reasoning tokens, execute shell commands inside containers, inspect repository diffs, and self-correct. When an agent turns slow, costs explode, or it gets trapped in an infinite retry loop, standard logging fails.

**AXRAY** solves this by turning every agent turn into a structured **OpenTelemetry Trace Tree**, storing telemetry in **SigNoz ClickHouse**, and providing real-time financial, latency, and system execution observability.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
|                                     AXRAY TELEMETRY DASHBOARD                                    |
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
|  Session: #sess_9f82  │ Model: Llama-3.3-70b  │ Container: docker://axray-ws-42  │ Status: ACTIVE |
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
|  ⏱️ LATENCY PROFILE                                                                               |
|  ├── 🧠 Time-in-Brain (LLM Reasoning):         2,450ms (78%) [Tokens: 14,200 | Cost: $0.0083]     |
|  └── ⚡ Time-in-Environment (Docker System):     680ms (22%) [Commands: 4  | ExitCode: 0]      |
|  ─────────────────────────────────────────────────────────────────────────────────────────────── |
|  🎯 Efficiency Score: 88/100  │  Primary Bottleneck: LLM Context Window & Token Overhead         |
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 What Is AXRAY?

### The Problem
Traditional APM tools monitor HTTP request/response lifecycles, but AI agents introduce **multi-turn cognitive loops**:
- **Unpredictable Latency:** Is the slowness caused by LLM API throttling or a hanging `npm install` command?
- **Financial Blindspots:** Which tool call or prompt turn consumed 80% of the token budget?
- **Black-Box Retries:** Did the agent fix the code error, or did it execute 10 redundant search queries?

### The AXRAY Solution
AXRAY acts as an **AI Flight Recorder**. It wraps autonomous agents inside isolated Docker containers, tracks every step using the **OpenTelemetry Node.js SDK**, streams OTLP spans to **SigNoz**, and communicates directly with SigNoz using the **Model Context Protocol (MCP)**.

---

## ⚡ The Hero Feature: "Time-in-Brain" vs "Time-in-Environment"

Agents operate in two distinct modes:
1. **Time-in-Brain (LLM Reasoning):** Wait time spent generating tokens, evaluating context windows, and emitting function call parameters.
2. **Time-in-Environment (System Execution):** Time spent running bash commands, installing npm dependencies, querying git diffs, and writing files inside the Docker container.

### Latency Segregation & Efficiency Scoring Formula

AXRAY parses the OpenTelemetry span tree in real-time to compute the segregation ratio and calculate an **Efficiency Score (0–100)**:

$$\text{Total Latency } (T_{\text{total}}) = T_{\text{Brain}} + T_{\text{Env}}$$

$$\text{Brain \%} = \left(\frac{T_{\text{Brain}}}{T_{\text{total}}}\right) \times 100 \quad , \quad \text{Env \%} = 100 - \text{Brain \%}$$

$$\text{Efficiency Score} = \max\left(45, \min\left(98, 100 - (0.35 \times \text{Brain \%} + 0.10 \times \text{Env \%})\right)\right)$$

```mermaid
gantt
    title Agent Turn #3 Latency Breakdown (Span Duration Timeline)
    dateFormat  X
    axisFormat %s ms

    section LLM Inference (Brain)
    Groq API Token Stream :active, brain1, 0, 2450

    section Container Execution (Environment)
    Docker Exec: search_files  :crit, env1, 2450, 2750
    Docker Exec: write_file    :crit, env2, 2750, 2900
    Docker Exec: git diff      :crit, env3, 2900, 3130
```

---

## 🏗️ System Architecture

AXRAY is structured as a high-performance TypeScript monorepo with an Express orchestrator, a Next.js 14 glassmorphic frontend, a Docker container provisioner, and a dual SigNoz telemetry pipeline (OTLP + MCP).

```mermaid
flowchart TD
    subgraph Client ["🖥️ AXRAY Web Client (Next.js 14 + Tailwind CSS)"]
        DASHBOARD["Session Workspace (/sessions/[id])"]
        OBSERVER["Flight Recorder (/observer)"]
        TRACES_UI["OTel Trace Tree Visualizer (/traces)"]
        SIGNOZ_PANEL["SigNoz Embedded Dashboard (/signoz)"]
        ANALYTICS["Latency & Cost Profiler (/analytics)"]
    end

    subgraph Server ["⚙️ AXRAY Core Orchestrator (Express + Socket.IO)"]
        SESSION_CTRL["Session Controller"]
        RUNNER["Runner & Provisioner Service"]
        AGENT_ENGINE["Groq LLM Function Calling Engine"]
        LATENCY_ENGINE["Latency & Efficiency Calculator"]
        SIGNOZ_MCP["SigNoz MCP Client (@modelcontextprotocol/sdk)"]
        SANITY["Command Auto-Sanitizer (rg / grep rules)"]
    end

    subgraph Sandbox ["🐳 Docker Container Execution Engine"]
        CONTAINER[("Isolated Alpine/Node Container<br/>/workspace")]
        TOOLS["Agent Tools: read_file, write_file, search_files, run_command, git_diff"]
        OTEL_SDK["@opentelemetry/sdk-node"]
    end

    subgraph Observability ["🛰️ SigNoz Observability Engine"]
        COLLECTOR[("SigNoz OTLP Collector<br/>:4318 (gRPC/HTTP)")]
        CLICKHOUSE[("SigNoz ClickHouse DB<br/>signoz_traces.signoz_index_v3")]
        SIGNOZ_MCP_SERVER[("SigNoz MCP Endpoint<br/>mcp.us2.signoz.cloud")]
    end

    DASHBOARD <-->|Live Socket.IO Stream| SESSION_CTRL
    SESSION_CTRL --> RUNNER
    RUNNER -->|Dockerode Spawn| CONTAINER
    AGENT_ENGINE <-->|Tool Execution| TOOLS
    TOOLS --> SANITY
    SANITY -->|Sanitized Exec| CONTAINER
    TOOLS --> OTEL_SDK
    OTEL_SDK -->|OTLP Spans & Metrics| COLLECTOR
    COLLECTOR --> CLICKHOUSE
    SIGNOZ_MCP <-->|StreamableHTTP Transport| SIGNOZ_MCP_SERVER
    SIGNOZ_MCP_SERVER <-->|Alert Rules & Metrics| SIGNOZ_PANEL
    LATENCY_ENGINE <-->|ClickHouse SQL Query| CLICKHOUSE

    style COLLECTOR fill:#00C49F,color:#000
    style OTEL_SDK fill:#7c5cff,color:#fff
    style SIGNOZ_MCP_SERVER fill:#FF6B6B,color:#fff
    style CONTAINER fill:#2496ED,color:#fff
```

---

## 🛰️ SigNoz Deep Integration & ClickHouse Engine

AXRAY interacts with SigNoz on two distinct operational planes:

### 1. Direct ClickHouse Telemetry Queries
To render sub-millisecond trace timelines without API overhead, AXRAY executes native SQL directly against SigNoz's ClickHouse storage engine (`signoz_traces.signoz_index_v3`):

```sql
-- Fetching Span Trees filtered by AXRAY Session Run ID
SELECT 
    spanID, 
    traceID, 
    name, 
    hasError, 
    timestamp, 
    durationNano, 
    attributes_string, 
    attributes_number 
FROM signoz_traces.signoz_index_v3 
WHERE attributes_string['axray.run.id'] = 'run_9f8b7a6c' 
ORDER BY timestamp ASC 
FORMAT JSON;
```

```sql
-- Tool Execution Performance & Latency Aggregation
SELECT 
    attributes_string['tool.name'] AS toolName, 
    avg(durationNano) AS avgDurationNano, 
    max(durationNano) AS maxDurationNano, 
    count() AS executionCount 
FROM signoz_traces.signoz_index_v3 
WHERE name = 'tool.call' AND attributes_string['axray.session.id'] = 'sess_42' 
GROUP BY toolName 
ORDER BY avgDurationNano DESC 
FORMAT JSON;
```

### 2. Model Context Protocol (MCP) Integration
AXRAY implements a full **SigNoz MCP Client** using `@modelcontextprotocol/sdk` and `StreamableHTTPClientTransport`. It connects directly to SigNoz to manage alert rules and execute builder queries programmatically:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Initialize SigNoz MCP Transport
const transport = new StreamableHTTPClientTransport(new URL("https://mcp.us2.signoz.cloud"), {
  requestInit: {
    headers: {
      "SIGNOZ-API-KEY": process.env.SIGNOZ_API_KEY,
      "X-SigNoz-URL": "https://mcp.us2.signoz.cloud",
    },
  },
});

const client = new Client({ name: "axray-server", version: "1.0.0" });
await client.connect(transport);

// Call SigNoz MCP Tool to list active alerts
const activeAlerts = await client.callTool({
  name: "signoz_list_alerts",
  arguments: {},
});
```

---

## 🗺️ Guided Architecture & Code Tour

Explore the lifecycle of an agent execution request across the codebase:

```mermaid
graph LR
    S1["1. Socket Handshake<br/>apps/web & apps/server"] --> S2["2. Docker Sandbox<br/>container.service.ts"]
    S2 --> S3["3. LLM Reasoning<br/>agent.service.ts"]
    S3 --> S4["4. OTel Ingestion<br/>telemetry.ts & SigNoz"]
    S4 --> S5["5. ClickHouse Query<br/>signoz-timeline.service.ts"]
    S5 --> S6["6. Auto PR Dispatch<br/>github-pr.service.ts"]
```

### Step 1: Real-Time Handshake & Session Creation
- **Client Component:** [SessionHeader.tsx](file:///home/hussain/Documents/axray-signoz/apps/web/features/sessions/components/SessionHeader.tsx)
- **Socket Emitter:** [socket.emitter.ts](file:///home/hussain/Documents/axray-signoz/apps/server/src/sockets/socket.emitter.ts)
- User prompts trigger a WebSocket session creation event, establishing live bi-directional streaming between client and backend.

### Step 2: Sandboxed Docker Container Provisioning
- **Service:** [container.service.ts](file:///home/hussain/Documents/axray-signoz/apps/server/src/services/container.service.ts)
- Dockerode provisions an isolated container with mounted workspace volumes. Incoming terminal search commands (`grep`, `rg`) pass through an **Auto-Sanitizer** that automatically injects exclusion flags (`--exclude-dir=node_modules`, `--exclude-dir=.git`).

### Step 3: LLM Reasoning & Tool Calling Loop
- **Service:** [agent.service.ts](file:///home/hussain/Documents/axray-signoz/apps/server/src/services/agent.service.ts)
- Groq LLM evaluates the prompt across bounded turns (max 25). Tools (`read_file`, `write_file`, `search_files`, `run_command`, `git_diff`) are dispatched directly into the Docker sandbox.

### Step 4: OpenTelemetry Instrumentation & OTLP Export
- **Lib:** [telemetry.ts](file:///home/hussain/Documents/axray-signoz/apps/server/src/lib/telemetry.ts)
- Spans are enriched with `AXRAY_ATTRIBUTES` and exported asynchronously via `@opentelemetry/sdk-node` to the SigNoz OTLP Collector on `:4318`.

### Step 5: ClickHouse Latency Aggregation & Real-Time Analytics
- **Service:** [signoz-timeline.service.ts](file:///home/hussain/Documents/axray-signoz/apps/server/src/services/signoz-timeline.service.ts)
- AXRAY queries SigNoz's ClickHouse instance to parse span trees, calculate **Time-in-Brain vs Time-in-Environment**, and render trace visualizations in the UI.

### Step 6: Automated GitHub Pull Request Creation
- **Service:** [github-pr.service.ts](file:///home/hussain/Documents/axray-signoz/apps/server/src/services/github-pr.service.ts)
- Once the task completes, AXRAY inspects uncommitted git changes inside the container (`git status --porcelain`), pushes a topic branch to GitHub, and opens a Pull Request automatically.

---

## 🛡️ OpenTelemetry GenAI Semantic Conventions

AXRAY strictly follows standard OpenTelemetry GenAI & Process semantic conventions:

| Attribute Key | Type | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `axray.session.id` | `string` | `"sess_9f82a1b3"` | Correlates all runs under a session |
| `axray.run.id` | `string` | `"run_42"` | Unique identifier for a single task execution |
| `axray.phase` | `string` | `"llm"` \| `"tool"` \| `"git"` | Current lifecycle execution phase |
| `gen_ai.system` | `string` | `"groq"` | Target LLM provider |
| `gen_ai.request.model` | `string` | `"openai/gpt-oss-20b"` | Exact model identifier |
| `gen_ai.usage.input_tokens` | `int` | `14200` | Prompt token count for turn |
| `gen_ai.usage.output_tokens`| `int` | `850` | Generated completion token count |
| `gen_ai.usage.total_tokens` | `int` | `15050` | Total turn token overhead |
| `axray.tool.name` | `string` | `"search_files"` | Name of function tool invoked |
| `axray.tool.exit_code` | `int` | `0` | Return code of executed container process |
| `container.id` | `string` | `"7f8a9b0c1d2e"` | Target Docker container ID |

---

## 🗺️ Web Frontend Feature Map

| Page Route | Component / Feature | Functionality |
| :--- | :--- | :--- |
| `/sessions` | Workspace Session List | Manage past and active agent workspaces |
| `/sessions/[id]` | Main Interactive Terminal | Real-time chat prompt, terminal logger, file tree, git diff preview |
| `/sessions/[id]/traces` | OTel Trace Tree Inspector | Visual tree graph of OpenTelemetry spans with direct SigNoz links |
| `/sessions/[id]/signoz` | Embedded SigNoz Dashboard | Live SigNoz query cards, logs, metrics, and MCP alarms UI |
| `/sessions/[id]/observer` | Flight Recorder Timeline | Sequential timeline of every prompt, tool execution, and span |
| `/sessions/[id]/analytics` | Latency & Cost Analytics | **Time-in-Brain** charts, token cost curves, efficiency scores |
| `/sessions/[id]/analysis` | Codebase Inspector | Auto-detected project entry points, frameworks, dependencies |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **Docker**: Running locally (Docker Desktop or Docker Engine)
- **SigNoz**: Running locally (`http://localhost:8080`) with OTLP receiver on port `4318`
- **MongoDB**: Local instance (`mongodb://localhost:27017/axray`) or MongoDB Atlas
- **Groq API Key**: Free key from [Groq Console](https://console.groq.com/)

---

### Step 1: Clone Repository

```bash
git clone https://github.com/hussainjamal760/axray-signoz.git
cd axray-signoz
```

---

### Step 2: Environment Configuration

Create `apps/server/.env`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/axray
FRONTEND_URL=http://localhost:3000
GROQ_API_KEY=gsk_your_groq_api_key_here
SIGNOZ_INSTANCE_URL=http://localhost:8080
SIGNOZ_API_KEY=your_signoz_api_key_here
SIGNOZ_MCP_API_KEY=your_signoz_api_key_here
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SIGNOZ_URL=http://localhost:8080
```

---

### Step 3: Install Monorepo Dependencies

```bash
npm install
```

---

### Step 4: Launch Monorepo Services

Run frontend client and backend server concurrently:

```bash
npm run dev
```

Service URLs:
- 📱 **AXRAY Dashboard:** `http://localhost:3000`
- ⚙️ **AXRAY Server API:** `http://localhost:3001`
- 📊 **SigNoz Observability UI:** `http://localhost:8080`

---

## 🧪 Verification & Health Checks

Run these diagnostic commands to verify your setup:

1. **Verify SigNoz OTLP gRPC/HTTP Receiver:**
   ```bash
   curl -I http://localhost:4318/v1/traces
   ```
   *Expected:* HTTP response indicating the OTLP port is open.

2. **Verify SigNoz ClickHouse Container:**
   ```bash
   docker exec -it signoz-telemetrystore-clickhouse-0-0 clickhouse-client --query "SHOW DATABASES;"
   ```
   *Expected:* Output contains `signoz_traces`.

3. **Verify AXRAY Backend Health:**
   ```bash
   curl http://localhost:3001/api/health
   ```

---

## 📁 Monorepo Structure & Feature Domains

```text
axray-signoz/
├── apps/
│   ├── server/                         # Express Backend & Telemetry Orchestrator
│   │   ├── src/
│   │   │   ├── controllers/            # Agent runs, Sessions, GitHub PR, SigNoz MCP
│   │   │   ├── services/               # Agent LLM engine, Docker container, ClickHouse timeline
│   │   │   ├── sockets/                # Socket.IO event emitters & handlers
│   │   │   ├── lib/                    # OTel SDK setup, Dockerode, GitHub Octokit
│   │   │   └── models/                 # Mongoose schemas (Session, AgentRun)
│   └── web/                            # Next.js 14 Glassmorphic Client
│       ├── app/                        # App Router (/sessions, /traces, /signoz, /analytics)
│       └── features/                   # Feature-sliced components & custom hooks
├── package.json                        # Root workspace configuration
└── README.md                           # Master Documentation
```

---

<div align="center">

### 🤝 Built with passion for the WeMakeDevs × SigNoz "Agents of SigNoz" Hackathon

*Made by [Team Cipher].*

</div>