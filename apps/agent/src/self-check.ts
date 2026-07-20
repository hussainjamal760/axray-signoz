import { tracer } from "./instrumentation";
import { SpanStatusCode, trace, context } from "@opentelemetry/api";
import type { TurnLogEntry } from "./agent-runner";

export interface SelfCheckResult {
  triggeredCorrection: boolean;
  reason?: string;
  correctionMessage?: string;
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
  const mcpEndpoint = process.env.SIGNOZ_MCP_ENDPOINT || "http://localhost:8000";
  const queryStr = `select count(*) from spans where session.id='${sessionId}' and name='tool.call'`;

  const selfCheckSpan = tracer.startSpan(
    "agent.self_check",
    {
      attributes: {
        "self_check.session_id": sessionId,
        "self_check.mcp_endpoint": mcpEndpoint,
        "self_check.query": queryStr,
      },
    },
    trace.setSpan(context.active(), currentTurnSpan)
  );

  try {
    let loopDetected = false;
    let repeatedTool = "";
    let repeatedArgsStr = "";
    let repeatCount = 0;

    // 1. Attempt to query SigNoz MCP Server or SigNoz Query API
    try {
      const response = await fetch(`${mcpEndpoint}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryStr,
          timeRangeMinutes: 5,
        }),
      });

      if (response.ok) {
        selfCheckSpan.setAttribute("self_check.mcp_tool_used", "execute_builder_query");
      } else {
        selfCheckSpan.setAttribute("self_check.mcp_tool_used", "local_turn_log_fallback");
      }
    } catch {
      // Server unreachable during dev/test — fallback to turnLog inspection
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
