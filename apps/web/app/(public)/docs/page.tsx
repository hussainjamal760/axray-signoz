"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Layers, 
  GitBranch, 
  Database, 
  Server, 
  Lock, 
  Rocket, 
  Code2, 
  Gauge, 
  Bell, 
  FileCode2, 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const navItems = [
    { id: "overview", label: "Overview & Pitch", icon: Zap },
    { id: "workflow", label: "Developer Workflow", icon: GitBranch },
    { id: "time-in-brain", label: "Time-in-Brain Formula", icon: Gauge },
    { id: "signoz-mcp", label: "SigNoz Alerts & MCP", icon: Bell },
    { id: "architecture", label: "System Architecture", icon: Layers },
    { id: "code-tour", label: "Codebase & File Tour", icon: FileCode2 },
    { id: "otel-conventions", label: "OTel Semantic Spec", icon: ShieldCheck },
    { id: "quickstart", label: "Quickstart Guide", icon: Rocket },
    { id: "env-vars", label: "Environment Reference", icon: Code2 },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-on-background font-sans relative selection:bg-primary-fixed selection:text-black overflow-x-hidden" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      {/* Navbar */}
      <Navbar activePath="/docs" isSticky={true} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-10 relative z-10">
        
        {/* HERO BANNER */}
        <div className="relative rounded-[32px] bg-gradient-to-r from-surface-container-lowest/80 via-surface-container-lowest/40 to-surface-container-lowest/80 border border-outline-variant/30 p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fixed/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed font-mono text-xs font-bold uppercase tracking-wider">
                <BookOpen size={14} className="animate-pulse" />
                <span>AXRAY Official Documentation</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none">
                The Telemetry Engine <br />
                <span className="text-primary-fixed drop-shadow-[0_0_20px_rgba(220,238,0,0.3)]">For Autonomous Coding</span>
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant font-medium leading-relaxed">
                If you can’t observe your AI coding agents, you don’t own them. Learn how AXRAY instruments autonomous execution with OpenTelemetry & SigNoz.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <a
                href="https://github.com/hussainjamal760/axray-signoz"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 hover:border-white/50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>GitHub Repository</span>
                <ExternalLink size={14} />
              </a>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary-fixed hover:bg-primary-fixed/90 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(220,238,0,0.35)]"
              >
                <span>Launch App</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* DOCS MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-3 sticky top-20 bg-surface-container-lowest/60 border border-outline-variant/30 rounded-3xl p-5 backdrop-blur-2xl shadow-xl space-y-5">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-outline-variant/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-fixed transition-colors font-mono"
              />
            </div>

            {/* Nav list */}
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 shadow-[0_0_15px_rgba(220,238,0,0.1)]"
                        : "text-on-surface-variant hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-primary-fixed" : "text-on-surface-variant/70"} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
              <div className="text-[10px] font-mono font-bold text-on-surface-variant/60 uppercase tracking-widest">
                Hackathon Track
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                WeMakeDevs × SigNoz "Agents of SigNoz"
              </div>
            </div>
          </aside>

          {/* DOCUMENTATION CONTENT AREA */}
          <div className="lg:col-span-9 space-y-12">

            {/* SECTION 1: OVERVIEW & PITCH */}
            <section id="overview" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed">
                  <Zap size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    30-Second Elevator Pitch
                  </h2>
                  <p className="text-xs font-mono text-primary-fixed uppercase tracking-wider">Why AXRAY Wins "Agents of SigNoz"</p>
                </div>
              </div>

              <p className="text-base text-on-surface-variant leading-relaxed">
                AXRAY transforms SigNoz from a passive monitoring tool into an <strong className="text-white">autonomous AI engineering platform</strong>. It acts as a flight recorder for AI coding agents, catching failures frame-by-frame and exposing complete OpenTelemetry trace trees.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-black/40 border border-outline-variant/30 space-y-2">
                  <div className="flex items-center gap-2 text-primary-fixed font-bold text-sm">
                    <Terminal size={16} />
                    <span>End-to-End CLI Developer</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                    Ingests GitHub Issues ➔ Executes fixes in Docker ➔ Traces turns in OTel ➔ Alerts Slack ➔ Opens GitHub PRs automatically.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-outline-variant/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Gauge size={16} />
                    <span>Latency Segregation</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                    Segregates LLM reasoning latency (<strong className="text-white">Time-in-Brain</strong>) from container execution (<strong className="text-white">Time-in-Environment</strong>) with an Efficiency Score (0–100).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-outline-variant/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Bell size={16} />
                    <span>Native SigNoz MCP Integration</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                    Connects directly to SigNoz via Model Context Protocol (`signoz_list_alerts`, `signoz_execute_builder_query`) for live streaming alerts.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-outline-variant/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Lock size={16} />
                    <span>Sandboxed Security & OTel</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                    Runs commands safely inside Docker while instrumenting every turn with OpenTelemetry GenAI semantic conventions.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: WORKFLOW */}
            <section id="workflow" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <GitBranch size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    The Autonomous AI Developer Workflow
                  </h2>
                  <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider">6-Step Execution Lifecycle</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { step: "01", title: "GitHub Ingestion", desc: "Ingests repository branches, issues, and prompt requirements." },
                  { step: "02", title: "Docker Sandbox", desc: "Spawns isolated, non-root containers with command sanitization." },
                  { step: "03", title: "Code Resolution", desc: "LLM agent inspects code, runs unit tests, refactors files, and verifies execution." },
                  { step: "04", title: "OTel Instrumentation", desc: "Exports structured OTLP gRPC/HTTP trace trees directly to SigNoz." },
                  { step: "05", title: "SigNoz MCP Alerts", desc: "Surfaces active monitor rules and routes real-time alarms to Slack." },
                  { step: "06", title: "Automatic PR", desc: "Pushes topic branches and opens GitHub PRs with markdown summaries." },
                ].map((w) => (
                  <div key={w.step} className="p-5 rounded-2xl bg-black/40 border border-outline-variant/20 space-y-2">
                    <span className="font-mono text-xs font-bold text-primary-fixed bg-primary-fixed/15 px-2 py-0.5 rounded border border-primary-fixed/30 flex items-center gap-1 w-fit">
                      <CheckCircle2 size={12} />
                      STEP {w.step}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-wide">{w.title}</h3>
                    <p className="text-xs text-on-surface-variant/80 leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3: TIME IN BRAIN */}
            <section id="time-in-brain" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Gauge size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    "Time-in-Brain" vs "Time-in-Environment"
                  </h2>
                  <p className="text-xs font-mono text-amber-400 uppercase tracking-wider">Latency Segregation & Efficiency Formula</p>
                </div>
              </div>

              <p className="text-base text-on-surface-variant leading-relaxed">
                Agents spend time in two distinct phases: <strong className="text-white">Time-in-Brain</strong> (LLM reasoning & token generation) and <strong className="text-white">Time-in-Environment</strong> (running commands, reading files inside Docker).
              </p>

              {/* Formula Card */}
              <div className="p-6 rounded-2xl bg-black/60 border border-primary-fixed/30 space-y-4 shadow-[0_0_30px_rgba(220,238,0,0.08)]">
                <div className="font-mono text-xs text-primary-fixed uppercase tracking-wider font-bold flex items-center gap-2">
                  <Activity size={16} />
                  Official Latency & Efficiency Formula
                </div>
                
                <div className="font-mono text-sm sm:text-base text-white bg-surface-container-lowest/80 p-4 rounded-xl border border-outline-variant/30 overflow-x-auto space-y-2">
                  <div className="text-emerald-400">Total Latency (T_total) = T_Brain + T_Env</div>
                  <div className="text-primary-fixed font-bold">
                    Efficiency Score = max(45, min(98, 100 - (0.35 × Brain % + 0.10 × Env %)))
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant/70 font-mono">
                  This mathematical score penalizes slow LLM reasoning while giving higher weight to efficient container tool execution.
                </p>
              </div>
            </section>

            {/* SECTION 4: SIGNOZ MCP */}
            <section id="signoz-mcp" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Bell size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    SigNoz Alerts & MCP Integration
                  </h2>
                  <p className="text-xs font-mono text-purple-400 uppercase tracking-wider">Dual-Layer Integration Architecture</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-black/40 border border-outline-variant/30 space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell size={18} className="text-purple-400" />
                    1. MCP Alert Streaming
                  </h3>
                  <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                    Connects to SigNoz using <code className="text-primary-fixed">@modelcontextprotocol/sdk</code>. Invokes <code className="text-emerald-400">signoz_list_alerts</code> to surface live alarms and cost spikes inside AXRAY.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-black/40 border border-outline-variant/30 space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Server size={18} className="text-cyan-400" />
                    2. Embedded SigNoz Dashboard
                  </h3>
                  <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                    Embeds your self-hosted SigNoz portal (<code className="text-cyan-400">http://localhost:8080/dashboards</code>) directly inside the workspace iframe at <code className="text-white">/sessions/[id]/signoz</code>.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 5: ARCHITECTURE */}
            <section id="architecture" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Layers size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    System Architecture
                  </h2>
                  <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider">End-to-End Component Map</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-black/60 border border-outline-variant/30 space-y-4 font-mono text-xs text-on-surface-variant">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20 space-y-2">
                    <div className="text-primary-fixed font-bold flex items-center gap-2">
                      <Code2 size={16} />
                      Frontend (Next.js 14)
                    </div>
                    <div>- Session Workspace & Observer</div>
                    <div>- OTel Trace Tree Inspector</div>
                    <div>- Embedded SigNoz Iframe</div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20 space-y-2">
                    <div className="text-emerald-400 font-bold flex items-center gap-2">
                      <Server size={16} />
                      Backend (Express + TS)
                    </div>
                    <div>- Groq LLM Function Calling Engine</div>
                    <div>- SigNoz MCP HTTP Client</div>
                    <div>- ClickHouse Latency Calculator</div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20 space-y-2">
                    <div className="text-amber-400 font-bold flex items-center gap-2">
                      <Layers size={16} />
                      Sandbox (Docker)
                    </div>
                    <div>- Non-root Container Execution</div>
                    <div>- Command Sanitizer (grep, git diff)</div>
                    <div>- OTel SDK Node Exporter</div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20 space-y-2">
                    <div className="text-cyan-400 font-bold flex items-center gap-2">
                      <Activity size={16} />
                      Observability (SigNoz)
                    </div>
                    <div>- OTLP Collector (:4318)</div>
                    <div>- ClickHouse DB</div>
                    <div>- Model Context Protocol Endpoint</div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 6: CODE TOUR */}
            <section id="code-tour" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed">
                  <FileCode2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Guided Architecture & Code Tour
                  </h2>
                  <p className="text-xs font-mono text-primary-fixed uppercase tracking-wider">Key Source Files</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { file: "apps/server/src/services/container.service.ts", desc: "Docker Sandbox & Command Sanitizer" },
                  { file: "apps/server/src/services/agent.service.ts", desc: "LLM Function Calling & Reasoning Loop" },
                  { file: "apps/server/src/lib/telemetry.ts", desc: "OpenTelemetry OTLP Spans Instrumenter" },
                  { file: "apps/server/src/services/signoz.service.ts", desc: "SigNoz MCP Protocol Client" },
                  { file: "apps/server/src/services/signoz-timeline.service.ts", desc: "ClickHouse Trace Timeline Queries" },
                  { file: "apps/server/src/services/github-pr.service.ts", desc: "Automated GitHub PR Creator" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-primary-fixed font-bold">{item.file}</span>
                    <span className="text-on-surface-variant/80">{item.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 7: OTEL SPEC */}
            <section id="otel-conventions" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    OpenTelemetry GenAI Semantic Conventions
                  </h2>
                  <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Attribute Specification</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-black/60 font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-lowest/80 text-primary-fixed">
                      <th className="p-4 font-bold">Attribute Key</th>
                      <th className="p-4 font-bold">Type</th>
                      <th className="p-4 font-bold">Example Value</th>
                      <th className="p-4 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant/90">
                    <tr>
                      <td className="p-4 text-white font-bold">axray.session.id</td>
                      <td className="p-4 text-cyan-400">string</td>
                      <td className="p-4 text-emerald-400">"sess_9f82a1b3"</td>
                      <td className="p-4">Correlates all runs under a session</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-white font-bold">gen_ai.system</td>
                      <td className="p-4 text-cyan-400">string</td>
                      <td className="p-4 text-emerald-400">"groq"</td>
                      <td className="p-4">Target LLM provider</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-white font-bold">gen_ai.usage.input_tokens</td>
                      <td className="p-4 text-cyan-400">int</td>
                      <td className="p-4 text-emerald-400">14200</td>
                      <td className="p-4">Prompt token count</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-white font-bold">axray.tool.name</td>
                      <td className="p-4 text-cyan-400">string</td>
                      <td className="p-4 text-emerald-400">"search_files"</td>
                      <td className="p-4">Invoked tool function</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-white font-bold">axray.tool.exit_code</td>
                      <td className="p-4 text-cyan-400">int</td>
                      <td className="p-4 text-emerald-400">0</td>
                      <td className="p-4">Container process exit code</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 8: QUICKSTART */}
            <section id="quickstart" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary-fixed/15 border border-primary-fixed/30 text-primary-fixed">
                  <Rocket size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Quickstart Guide
                  </h2>
                  <p className="text-xs font-mono text-primary-fixed uppercase tracking-wider">Zero-Setup Local Reproduction</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Clone Repository",
                    code: "git clone https://github.com/hussainjamal760/axray-signoz.git\ncd axray-signoz",
                  },
                  {
                    step: "2",
                    title: "Deploy SigNoz + MCP Server (via Foundry)",
                    code: "cd deploy\nfoundryctl cast -f casting.yaml",
                  },
                  {
                    step: "3",
                    title: "Configure Groq API Key",
                    code: "cd ..\ncp .env.example .env\n# Edit .env and set GROQ_API_KEY=gsk_your_key_here",
                  },
                  {
                    step: "4",
                    title: "Launch AXRAY Stack",
                    code: "docker compose up -d",
                  },
                ].map((s) => (
                  <div key={s.step} className="p-6 rounded-2xl bg-black/60 border border-outline-variant/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-base">Step {s.step} — {s.title}</span>
                      <button
                        onClick={() => handleCopy(s.code, `step_${s.step}`)}
                        className="px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-mono text-on-surface-variant hover:text-primary-fixed transition-all flex items-center gap-1.5"
                      >
                        {copiedText === `step_${s.step}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedText === `step_${s.step}` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black/80 font-mono text-xs text-primary-fixed/90 overflow-x-auto border border-white/5">
                      {s.code}
                    </pre>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 9: ENV VARS */}
            <section id="env-vars" className="scroll-mt-24 space-y-6 bg-surface-container-lowest/30 border border-outline-variant/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Code2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Environment Variables Reference
                  </h2>
                  <p className="text-xs font-mono text-amber-400 uppercase tracking-wider">Default Configuration</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-black/70 border border-outline-variant/30 font-mono text-xs text-primary-fixed overflow-x-auto">
                <pre>{`NODE_ENV=production
PORT=3001
MONGO_URI=mongodb://axray-mongo:27017/axray
GROQ_API_KEY=gsk_your_groq_api_key_here
SIGNOZ_OTEL_COLLECTOR_URL=http://signoz-otel-collector:4318
SIGNOZ_MCP_URL=http://signoz-mcp:8000
COOKIE_SECURE=false`}</pre>
              </div>
            </section>

          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
