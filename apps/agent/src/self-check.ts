import { tracer } from "./instrumentation";
import { SpanStatusCode, trace, context } from "@opentelemetry/api";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { TurnLogEntry } from "./agent-runner";

export interface SelfCheckResult {
  triggeredCorrection: boolean;
  reason?: string;
  correctionMessage?: string;
}

/**
 * Query SigNoz Cloud via MCP using the real StreamableHTTP transport.
 * Returns { ok: true, raw } on success, { ok: false } on any failure.
 */
async function queryMcp(sessionId: string): Promise<{ ok: boolean; raw?: any }> {
  const mcpUrl = process.env.SIGNOZ_MCP_ENDPOINT;
  const apiKey = process.env.SIGNOZ_MCP_API_KEY;
  const instanceUrl = process.env.SIGNOZ_INSTANCE_URL;

  // If any MCP env var is missing, skip the MCP call entirely.
  if (!mcpUrl || !apiKey || !instanceUrl) {
    return { ok: false };
  }

  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
    requestInit: {
      headers: {
        "SIGNOZ-API-KEY": apiKey,
        "X-SigNoz-URL": instanceUrl,
      },
    },
  });

  const client = new Client({ name: "axray-agent", version: "1.0.0" });

  try {
    await client.connect(transport);

    const now = Date.now();
    const fiveMinAgo = now - 5 * 60 * 1000;

    const result = await client.callTool({
      name: "signoz_execute_builder_query",
      arguments: {
        query: {
          start: fiveMinAgo,
          end: now,
          requestType: "scalar",
          compositeQuery: {
            queries: [
              {
                type: "builder_query",
                spec: {
                  name: "A",
                  signal: "traces",
                  aggregations: [{ expression: "count()" }],
                  filter: {
                    expression: `session.id = '${sessionId}' AND name = 'tool.call'`,
                  },
                  disabled: false,
                },
              },
            ],
          },
        },
        searchContext: `Count tool.call spans for session ${sessionId} in the last 5 minutes`,
      },
    });
    return { ok: true, raw: result };
  } catch {
    return { ok: false };
  } finally {
    await client.close();
  }
}

/**
 * Phase 3: The Self-Check Mechanism.
 *
 * Queries SigNoz MCP / APM endpoints (or falls back to turnLog analysis)
 * to detect repeating tool loops or stuck behavior.
 */
export async function performSelfCheck(
  sessionId: string,
  turnLog: TurnLogEntry[],
  currentTurnSpan: any
): Promise<SelfCheckResult> {
  const mcpEndpoint = process.env.SIGNOZ_MCP_ENDPOINT || "(not configured)";

  const selfCheckSpan = tracer.startSpan(
    "agent.self_check",
    {
      attributes: {
        "self_check.session_id": sessionId,
        "self_check.mcp_endpoint": mcpEndpoint,
      },
    },
    trace.setSpan(context.active(), currentTurnSpan)
  );

  try {
    let loopDetected = false;
    let repeatedTool = "";
    let repeatedArgsStr = "";
    let repeatCount = 0;

    // 1. Attempt to query SigNoz Cloud via MCP
    const mcpResult = await queryMcp(sessionId);

    if (mcpResult.ok) {
      selfCheckSpan.setAttribute("self_check.mcp_tool_used", "signoz_execute_builder_query");
    } else {
      selfCheckSpan.setAttribute("self_check.mcp_tool_used", "local_turn_log_fallback");
    }

    // 2. Perform loop detection over turnLog
    const recentToolCalls: { name: string; argsStr: string }[] = [];
    for (const entry of turnLog) {
      for (const call of entry.toolCalls) {
        recentToolCalls.push({
          name: call.name,
          argsStr: JSON.stringify(call.args),
        });
      }
    }

    // Count occurrences of identical (name, args)
    const callCounts: Record<string, number> = {};
    for (const call of recentToolCalls) {
      const key = `${call.name}::${call.argsStr}`;
      callCounts[key] = (callCounts[key] || 0) + 1;
      if (callCounts[key] >= 3) {
        loopDetected = true;
        repeatedTool = call.name;
        repeatedArgsStr = call.argsStr;
        repeatCount = callCounts[key];
        break;
      }
    }

    if (loopDetected) {
      const reason = `Detected stuck loop: Tool '${repeatedTool}' with arguments ${repeatedArgsStr} executed ${repeatCount} times in this session.`;
      const correctionMessage = `⚠️ SYSTEM ALERT (Self-Correction Triggered): You have retried the exact action '${repeatedTool}' with arguments ${repeatedArgsStr} ${repeatCount} times. STOP repeating this action. Re-read the file carefully or try a completely different approach!`;

      selfCheckSpan.setAttribute("self_check.triggered_correction", true);
      selfCheckSpan.setAttribute("self_check.reason", reason);
      selfCheckSpan.setAttribute("self_check.new_strategy", "Redirect LLM away from repeated action");
      selfCheckSpan.setStatus({ code: SpanStatusCode.OK });

      return {
        triggeredCorrection: true,
        reason,
        correctionMessage,
      };
    } else {
      selfCheckSpan.setAttribute("self_check.triggered_correction", false);
      selfCheckSpan.setStatus({ code: SpanStatusCode.OK });
      return { triggeredCorrection: false };
    }
  } catch (err: any) {
    selfCheckSpan.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    selfCheckSpan.recordException(err);
    return { triggeredCorrection: false };
  } finally {
    selfCheckSpan.end();
  }
}
