import { emitTerminalLine } from '../sockets/socket.emitter';
import { AgentRun } from '../models/agent-run.model';
import { emitAgentLog } from '../lib/telemetry';

export type TerminalLineType = 'command' | 'stdout' | 'stderr' | 'agent' | 'success' | 'error';

// In-memory buffer mapping runId -> Array of formatted terminal text lines
const runTerminalBuffers = new Map<string, string[]>();

export function initRunTerminal(runId: string): void {
  runTerminalBuffers.set(runId, []);
}

export function appendTerminalLine(
  sessionId: string,
  runId: string,
  type: TerminalLineType,
  text: string
): void {
  if (!text) return;
  const lines = text.split('\n');

  let buffer = runTerminalBuffers.get(runId);
  if (!buffer) {
    buffer = [];
    runTerminalBuffers.set(runId, buffer);
  }

  for (const line of lines) {
    const formatted = formatTerminalLine(type, line);
    buffer.push(formatted);

    // Stream to SigNoz OTLP Logs
    const logLevel = type === 'error' || type === 'stderr' ? 'error' : 'info';
    emitAgentLog(logLevel, formatted, {
      runId,
      sessionId,
      type,
    });

    // Emit live line via Socket.IO
    emitTerminalLine(sessionId, {
      sessionId,
      runId,
      timestamp: new Date().toISOString(),
      type,
      text: line,
    });
  }
}

function formatTerminalLine(type: TerminalLineType, text: string): string {
  switch (type) {
    case 'command':
      return `$ ${text}`;
    case 'agent':
      return `[Agent] ${text}`;
    case 'success':
      return `[Success] ${text}`;
    case 'error':
      return `[Error] ${text}`;
    case 'stderr':
      return `stderr: ${text}`;
    default:
      return text;
  }
}

export async function flushAndPersistTerminalOutput(runId: string): Promise<string> {
  const buffer = runTerminalBuffers.get(runId) || [];
  const fullOutput = buffer.join('\n');

  if (runId) {
    await AgentRun.findByIdAndUpdate(runId, { terminalOutput: fullOutput });
  }

  runTerminalBuffers.delete(runId);
  return fullOutput;
}

export function getRunTerminalBuffer(runId: string): string {
  const buffer = runTerminalBuffers.get(runId) || [];
  return buffer.join('\n');
}
