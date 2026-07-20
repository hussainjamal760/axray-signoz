import { Groq } from "groq-sdk";
import { SpanStatusCode, trace, context } from "@opentelemetry/api";
import { tracer } from "./instrumentation";
import { performSelfCheck } from "./self-check";
import { captureWorkspaceDiff, DiffResult } from "./diff-capture";
import * as path from "path";
import {
  allToolDeclarations,
  executeReadFile,
  executeWriteFile,
  executeRunBash,
  executeRunTests,
} from "./tools/index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentRunOptions {
  /** The task description from the user, e.g. "fix the failing test in math.ts" */
  task: string;
  /** Absolute path to the cloned repo / workspace directory */
  workspaceDir: string;
  /** Groq model to use (default: llama-3.3-70b-specdec) */
  model?: string;
  /** Maximum number of turns (LLM calls) before force-stopping */
  maxTurns?: number;
  /** Whether to print verbose logs to stdout */
  verbose?: boolean;
}

export interface AgentRunResult {
  /** Whether the agent completed the task successfully */
  success: boolean;
  /** Summary message from the agent */
  summary: string;
  /** Total number of LLM call turns used */
  totalTurns: number;
  /** Total input tokens consumed across all turns */
  totalInputTokens: number;
  /** Total output tokens consumed across all turns */
  totalOutputTokens: number;
  /** Per-turn log of what happened */
  turnLog: TurnLogEntry[];
  /** Git diff snapshot of changes made by the agent */
  diff?: DiffResult;
}

export interface TurnLogEntry {
  turn: number;
  toolCalls: { name: string; args: Record<string, any>; result: string }[];
  textResponse?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = "openai/gpt-oss-20b";
const DEFAULT_MAX_TURNS = 30;

const SYSTEM_PROMPT = `You are AXRAY, an expert coding agent. You are given a task to perform on a codebase.

RULES:
1. ALWAYS start by understanding the codebase: read relevant files, look at the project structure (run_bash with "ls" or "find"), and read package.json.
2. Before editing a file, ALWAYS read it first to understand the full contents.
3. When writing a file, write the COMPLETE file content — do not leave partial files.
4. After making changes, ALWAYS run the tests to verify your fix works.
5. CRITICAL: As soon as tests pass successfully, STOP making tool calls and immediately respond with a final text summary of what you fixed.
6. If you get stuck or tests keep failing after 3 attempts, explain what you tried and what's blocking you.
7. Be efficient — don't repeat the same action without changing your approach.

Think step by step. For each turn, decide what tool to call next and why.`;

// ─── Tool dispatcher ──────────────────────────────────────────────────────────

function executeTool(
  name: string,
  args: Record<string, any>,
  workspaceDir: string
): string {
  switch (name) {
    case "read_file":
      return executeReadFile(args as { path: string }, workspaceDir);
    case "write_file":
      return executeWriteFile(
        args as { path: string; content: string },
        workspaceDir
      );
    case "run_bash":
      return executeRunBash(args as { command: string }, workspaceDir);
    case "run_tests":
      return executeRunTests(
        args as { test_pattern?: string },
        workspaceDir
      );
    default:
      return `Error: unknown tool '${name}'.`;
  }
}

// ─── Logging helpers ──────────────────────────────────────────────────────────

function log(verbose: boolean, ...messages: any[]) {
  if (verbose) {
    console.log("[AXRAY Agent]", ...messages);
  }
}

function logTool(verbose: boolean, name: string, args: Record<string, any>, result: string) {
  if (verbose) {
    const argsStr =
      name === "write_file"
        ? JSON.stringify({ path: args.path, content: `[${args.content?.length ?? 0} chars]` })
        : JSON.stringify(args);
    const resultPreview =
      result.length > 500 ? result.substring(0, 500) + "..." : result;
    console.log(`  ┌─ Tool: ${name}`);
    console.log(`  │  Args: ${argsStr}`);
    console.log(`  └─ Result: ${resultPreview}\n`);
  }
}

// ─── Main agent loop ──────────────────────────────────────────────────────────

export async function runAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const {
    task,
    workspaceDir,
    model = DEFAULT_MODEL,
    maxTurns = DEFAULT_MAX_TURNS,
    verbose = false,
  } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is not set. " +
        "Get one from https://console.groq.com"
    );
  }

  const groq = new Groq({ apiKey });

  const sessionId = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
  const repoName = path.basename(workspaceDir);

  // 1. Start Root Span (agent.session)
  const sessionSpan = tracer.startSpan("agent.session", {
    attributes: {
      "session.id": sessionId,
      "session.repo": repoName,
      "session.branch": "agent-fixing-tests", // fallback or default branch
      "session.task": task,
      "session.model": model,
      "session.self_corrections": 0,
    },
  });

  log(verbose, `Starting agent run`);
  log(verbose, `  Task: ${task}`);
  log(verbose, `  Workspace: ${workspaceDir}`);
  log(verbose, `  Model: ${model}`);
  log(verbose, `  Max turns: ${maxTurns}\n`);

  // Build conversation messages history in OpenAI style
  const messages: any[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `Here is your task:\n\n${task}\n\nThe workspace is ready at the current directory. Start by exploring the project structure and understanding the codebase, then work on the task.`,
    },
  ];

  const turnLog: TurnLogEntry[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    for (let turn = 1; turn <= maxTurns; turn++) {
      log(verbose, `═══ Turn ${turn}/${maxTurns} ═══`);

      // 2. Start Nested Turn Span (agent.turn)
      const turnSpan = tracer.startSpan(
        "agent.turn",
        {
          attributes: {
            "turn.number": turn,
          },
        },
        trace.setSpan(context.active(), sessionSpan)
      );

      try {
        // 3. Start Nested LLM Call Span (llm.call)
        const llmSpan = tracer.startSpan(
          "llm.call",
          {
            attributes: {
              "gen_ai.system": "groq",
              "gen_ai.operation.name": "chat",
              "gen_ai.request.model": model,
            },
          },
          trace.setSpan(context.active(), turnSpan)
        );

        let response;
        const startTime = Date.now();
        const MAX_RETRIES = 5;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            response = await groq.chat.completions.create({
              model,
              messages,
              tools: allToolDeclarations,
              tool_choice: "auto",
              temperature: 0.1,
            });
            break; // success, exit retry loop
          } catch (err: any) {
            const isRetryable =
              err?.status === 503 ||
              err?.status === 429 ||
              err?.status === 413 ||
              err?.message?.includes("503") ||
              err?.message?.includes("429") ||
              err?.message?.includes("413") ||
              err?.message?.includes("rate limit") ||
              err?.message?.includes("Rate limit") ||
              err?.message?.includes("TPM") ||
              err?.message?.includes("tokens per minute") ||
              err?.message?.includes("Request too large") ||
              err?.message?.includes("Connection error") ||
              err?.message?.includes("fetch failed") ||
              err?.code === "ECONNRESET" ||
              err?.code === "ETIMEDOUT";

            if (isRetryable && attempt < MAX_RETRIES) {
              const waitMs = 10000 * attempt; // 10s, 20s, 30s, 40s, 50s
              log(verbose, `⚠️  API rate limit/TPM reached (attempt ${attempt}/${MAX_RETRIES}). Waiting ${waitMs / 1000}s for token bucket reset...`);
              await new Promise((r) => setTimeout(r, waitMs));
            } else {
              throw err; // non-retryable or exhausted retries
            }
          }
        }

        const latency = Date.now() - startTime;
        llmSpan.setAttribute("llm.latency_ms", latency);

        if (!response) {
          const err = new Error("Failed to get a response from the API after all retries.");
          llmSpan.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
          llmSpan.recordException(err);
          throw err;
        }

        // Track token usage & estimate cost
        const usage = response.usage;
        if (usage) {
          totalInputTokens += usage.prompt_tokens ?? 0;
          totalOutputTokens += usage.completion_tokens ?? 0;

          llmSpan.setAttribute("gen_ai.usage.input_tokens", usage.prompt_tokens ?? 0);
          llmSpan.setAttribute("gen_ai.usage.output_tokens", usage.completion_tokens ?? 0);

          // Cost estimation for llama-3.3-70b-specdec on Groq:
          // Input: $0.59 / 1M tokens, Output: $0.79 / 1M tokens
          const inputCost = ((usage.prompt_tokens ?? 0) * 0.59) / 1_000_000;
          const outputCost = ((usage.completion_tokens ?? 0) * 0.79) / 1_000_000;
          llmSpan.setAttribute("llm.cost_usd", inputCost + outputCost);
        }

        llmSpan.setStatus({ code: SpanStatusCode.OK });
        llmSpan.end();

        const message = response.choices?.[0]?.message;
        if (!message) {
          log(verbose, "No response from model, ending.");
          const runResult = {
            success: false,
            summary: "Agent received no response from the model.",
            totalTurns: turn,
            totalInputTokens,
            totalOutputTokens,
            turnLog,
          };
          turnSpan.setStatus({ code: SpanStatusCode.ERROR, message: runResult.summary });
          return runResult;
        }

        let toolCalls = message.tool_calls;

        // Fallback for Llama 3 hallucinating custom function tags in text
        if (!toolCalls && message.content) {
          const regex = /<function\/([a-zA-Z0-9_]+)\s+([\[\{].*?[\]\}])(?:\(\/[^>]+\))?<\/function>/g;
          let match;
          const parsedCalls: any[] = [];

          while ((match = regex.exec(message.content)) !== null) {
            const name = match[1].trim();
            const rawArgs = match[2].trim();
            let argsObj: Record<string, any> = {};
            try {
              const parsed = JSON.parse(rawArgs);
              argsObj = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e: any) {
              log(verbose, `Failed to parse fallback args for ${name}: ${rawArgs}`);
            }

            parsedCalls.push({
              id: "call_" + Math.random().toString(36).substring(2, 9),
              type: "function",
              function: {
                name,
                arguments: JSON.stringify(argsObj),
              },
            });
          }

          if (parsedCalls.length > 0) {
            log(verbose, `[Fallback Parser] Extracted ${parsedCalls.length} tool call(s) from content.`);
            toolCalls = parsedCalls;
          }
        }

        const turnEntry: TurnLogEntry = { turn, toolCalls: [] };

        if (toolCalls && toolCalls.length > 0) {
          // Sanitize assistant message for conversation history
          message.tool_calls = toolCalls;
          message.content = null;

          // Push assistant message (with tool calls) to messages history
          messages.push(message);

          // Execute each tool call and push results
          for (const tc of toolCalls) {
            const name = tc.function.name;
            let args: Record<string, any> = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch (e: any) {
              log(verbose, `Failed to parse arguments for tool ${name}: ${tc.function.arguments}`);
            }

            // 4. Start Nested Tool Call Span (tool.call)
            const toolSpan = tracer.startSpan(
              "tool.call",
              {
                attributes: {
                  "tool.name": name,
                  "tool.args": JSON.stringify(args),
                },
              },
              trace.setSpan(context.active(), turnSpan)
            );

            try {
              log(verbose, `Calling tool: ${name}`);
              const result = executeTool(name, args, workspaceDir);
              logTool(verbose, name, args, result);

              turnEntry.toolCalls.push({ name, args, result });

              // Check if the result starts with "Error" to record exceptions in SigNoz
              if (result.startsWith("Error:") || result.startsWith("Error reading file")) {
                toolSpan.setAttribute("tool.result_status", "error");
                toolSpan.setStatus({ code: SpanStatusCode.ERROR, message: result });
                toolSpan.recordException(new Error(result));
              } else {
                toolSpan.setAttribute("tool.result_status", "success");
                toolSpan.setStatus({ code: SpanStatusCode.OK });
              }

              let toolContent = result;
              if (name === "run_tests" && (result.includes("PASS") || result.includes("Test Suites: 1 passed") || result.includes("Tests: 1 passed")) && !result.includes("FAIL")) {
                toolContent += "\n\n[SYSTEM NOTIFICATION: All tests passed successfully! Do NOT call any more tools; provide your final summary now.]";
              }

              messages.push({
                role: "tool",
                tool_call_id: tc.id,
                name: name,
                content: toolContent,
              });
            } catch (toolErr: any) {
              toolSpan.setAttribute("tool.result_status", "error");
              toolSpan.setStatus({ code: SpanStatusCode.ERROR, message: toolErr.message });
              toolSpan.recordException(toolErr);
              throw toolErr;
            } finally {
              toolSpan.end();
            }
          }
        } else if (message.content) {
          // The model responded with text only — the task is done (or it gave up)
          const finalText = message.content;
          turnEntry.textResponse = finalText;

          log(verbose, `\n✅ Agent finished with text response:\n${finalText}\n`);

          turnLog.push(turnEntry);

          const diff = captureWorkspaceDiff(workspaceDir);
          sessionSpan.setAttribute("session.files_changed_count", diff.filesChanged.length);
          sessionSpan.setAttribute("session.has_changes", diff.hasChanges);

          turnSpan.setStatus({ code: SpanStatusCode.OK });
          turnSpan.end();

          sessionSpan.setStatus({ code: SpanStatusCode.OK });

          return {
            success: true,
            summary: finalText,
            totalTurns: turn,
            totalInputTokens,
            totalOutputTokens,
            turnLog,
            diff,
          };
        } else {
          // Unexpected empty content and no tool calls
          log(verbose, "Model returned empty response message, ending.");
          turnLog.push(turnEntry);

          const runResult = {
            success: false,
            summary: "Agent returned an empty response.",
            totalTurns: turn,
            totalInputTokens,
            totalOutputTokens,
            turnLog,
          };
          turnSpan.setStatus({ code: SpanStatusCode.ERROR, message: runResult.summary });
          return runResult;
        }

        turnLog.push(turnEntry);

        // 5. Run Self-Check Mechanism (Phase 3)
        const selfCheckResult = await performSelfCheck(sessionId, turnLog, turnSpan);
        if (selfCheckResult.triggeredCorrection && selfCheckResult.correctionMessage) {
          log(verbose, `🔄 Self-Correction Triggered: ${selfCheckResult.reason}`);
          messages.push({
            role: "user",
            content: selfCheckResult.correctionMessage,
          });
          const count = (sessionSpan as any).attributes?.["session.self_corrections"] || 0;
          sessionSpan.setAttribute("session.self_corrections", Number(count) + 1);
        }

        turnSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (turnErr: any) {
        turnSpan.setStatus({ code: SpanStatusCode.ERROR, message: turnErr.message });
        turnSpan.recordException(turnErr);
        throw turnErr;
      } finally {
        turnSpan.end();
      }
    }

    // If we exhausted all turns
    log(verbose, `\n⚠️  Agent hit the maximum turn limit (${maxTurns}).`);
    const runResult = {
      success: false,
      summary: `Agent exhausted the maximum number of turns (${maxTurns}) without completing the task.`,
      totalTurns: maxTurns,
      totalInputTokens,
      totalOutputTokens,
      turnLog,
    };
    sessionSpan.setStatus({ code: SpanStatusCode.ERROR, message: runResult.summary });
    return runResult;

  } catch (err: any) {
    sessionSpan.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    sessionSpan.recordException(err);
    throw err;
  } finally {
    sessionSpan.end();
  }
}
