import { AgentRun } from '../models/agent-run.model';
import { Session } from '../models/session.model';
import { signozService } from './signoz.service';
import { spanStoreProcessor, SpanRecord } from '../lib/telemetry';
import { AppError } from '../errors/AppError';
import { AXRAY_ATTRIBUTES, AxrayPhase } from '../lib/telemetry-attributes';

export interface TimelineEventMetadata {
  repository?: string;
  branch?: string;
  runtime?: string;
  runtimeVersion?: string;
  runtimeImage?: string;
  containerId?: string;
  model?: string;
  turn?: number;
  toolName?: string;
  filePath?: string;
  commandSummary?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  filesChanged?: number;
  insertions?: number;
  deletions?: number;
  diffTruncated?: boolean;
  [key: string]: unknown;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  phase: AxrayPhase;
  eventType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  durationMs?: number;
  metadata?: TimelineEventMetadata;
}

export interface TimelineSummary {
  totalDurationMs?: number;
  totalEvents: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface TimelineResponse {
  runId: string;
  sessionId: string;
  status: string;
  telemetryStatus: 'authoritative_signoz' | 'active_span_store' | 'unavailable';
  message?: string;
  summary: TimelineSummary;
  events: TimelineEvent[];
}

function normalizeSpanToEvent(span: SpanRecord): TimelineEvent {
  const attrs = span.attributes || {};
  const phase: AxrayPhase = (attrs[AXRAY_ATTRIBUTES.PHASE] || 'agent') as AxrayPhase;
  const eventType: string = attrs[AXRAY_ATTRIBUTES.EVENT_TYPE] || span.name;

  let title = span.name;
  let description: string | undefined;

  switch (span.name) {
    case 'session.create':
      title = 'Session Created';
      description = attrs[AXRAY_ATTRIBUTES.REPOSITORY]
        ? `${attrs[AXRAY_ATTRIBUTES.REPOSITORY]} (${attrs[AXRAY_ATTRIBUTES.BRANCH] || 'main'})`
        : 'Session initialized';
      break;
    case 'container.start':
      title = 'Container Started';
      description = attrs[AXRAY_ATTRIBUTES.RUNTIME_IMAGE]
        ? `${attrs[AXRAY_ATTRIBUTES.RUNTIME_IMAGE]} container active`
        : 'Docker container ready';
      break;
    case 'workspace.clone':
      title = 'Repository Cloned';
      description = `Cloned repository into /workspace`;
      break;
    case 'workspace.checkout':
      title = 'Branch Checked Out';
      description = `Checked out branch ${attrs[AXRAY_ATTRIBUTES.BRANCH] || 'main'}`;
      break;
    case 'workspace.analyze':
      title = 'Workspace Analyzed';
      description = attrs[AXRAY_ATTRIBUTES.RUNTIME]
        ? `Runtime: ${attrs[AXRAY_ATTRIBUTES.RUNTIME]} (${attrs['workspace.package_manager'] || 'npm'})`
        : 'AI workspace inspection complete';
      break;
    case 'workspace.ensure_runtime':
      title = 'Node Runtime Ready';
      description = attrs[AXRAY_ATTRIBUTES.RUNTIME_IMAGE] || 'axray/node:22 active';
      break;
    case 'workspace.install_deps':
      title = 'Dependencies Installed';
      description = attrs[AXRAY_ATTRIBUTES.TOOL_COMMAND] || 'Executed dependency installation';
      break;
    case 'agent.run':
    case 'agent.execute':
      title = 'Agent Started';
      description = `Groq reasoning loop started`;
      break;
    case 'llm.request':
      const turnNum = attrs[AXRAY_ATTRIBUTES.AGENT_TURN] || 1;
      title = `LLM Turn ${turnNum}`;
      description = attrs[AXRAY_ATTRIBUTES.AGENT_MODEL] || 'openai/gpt-oss-20b';
      break;
    case 'tool.execute':
      const toolName = attrs[AXRAY_ATTRIBUTES.TOOL_NAME] || attrs['tool.name'] || 'tool';
      title = `Tool: ${toolName}`;
      description = attrs[AXRAY_ATTRIBUTES.TOOL_PATH] || attrs[AXRAY_ATTRIBUTES.TOOL_COMMAND] || toolName;
      break;
    case 'git.diff':
      title = 'Git Diff Captured';
      const fCount = attrs[AXRAY_ATTRIBUTES.GIT_FILES_CHANGED] ?? 0;
      const ins = attrs[AXRAY_ATTRIBUTES.GIT_INSERTIONS] ?? 0;
      const del = attrs[AXRAY_ATTRIBUTES.GIT_DELETIONS] ?? 0;
      description = `${fCount} ${fCount === 1 ? 'file' : 'files'} changed (+${ins} / -${del})`;
      break;
    case 'run.completed':
      title = 'Run Completed';
      description = 'Agent execution finished successfully';
      break;
    case 'run.failed':
      title = 'Run Failed';
      description = attrs['error.message'] || 'Agent execution failed';
      break;
    default:
      title = span.name;
      break;
  }

  const metadata: TimelineEventMetadata = {
    repository: attrs[AXRAY_ATTRIBUTES.REPOSITORY],
    branch: attrs[AXRAY_ATTRIBUTES.BRANCH],
    runtime: attrs[AXRAY_ATTRIBUTES.RUNTIME],
    runtimeVersion: attrs[AXRAY_ATTRIBUTES.RUNTIME_VERSION],
    runtimeImage: attrs[AXRAY_ATTRIBUTES.RUNTIME_IMAGE],
    containerId: attrs[AXRAY_ATTRIBUTES.CONTAINER_ID] || attrs['container.id'],
    model: attrs[AXRAY_ATTRIBUTES.AGENT_MODEL] || attrs[AXRAY_ATTRIBUTES.GEN_AI_MODEL],
    turn: attrs[AXRAY_ATTRIBUTES.AGENT_TURN],
    toolName: attrs[AXRAY_ATTRIBUTES.TOOL_NAME] || attrs['tool.name'],
    filePath: attrs[AXRAY_ATTRIBUTES.TOOL_PATH] || attrs['tool.path'],
    commandSummary: attrs[AXRAY_ATTRIBUTES.TOOL_COMMAND] || attrs['tool.command'],
    inputTokens: attrs[AXRAY_ATTRIBUTES.GEN_AI_INPUT_TOKENS],
    outputTokens: attrs[AXRAY_ATTRIBUTES.GEN_AI_OUTPUT_TOKENS],
    totalTokens: attrs[AXRAY_ATTRIBUTES.GEN_AI_TOTAL_TOKENS],
    filesChanged: attrs[AXRAY_ATTRIBUTES.GIT_FILES_CHANGED],
    insertions: attrs[AXRAY_ATTRIBUTES.GIT_INSERTIONS],
    deletions: attrs[AXRAY_ATTRIBUTES.GIT_DELETIONS],
    diffTruncated: attrs[AXRAY_ATTRIBUTES.GIT_DIFF_TRUNCATED],
  };

  return {
    id: span.id,
    timestamp: span.startTime,
    title,
    description,
    phase,
    eventType,
    status: span.status === 'failed' ? 'failed' : span.status === 'running' ? 'running' : 'completed',
    durationMs: span.durationMs,
    metadata,
  };
}

export const getTimelineForRun = async (runId: string): Promise<TimelineResponse> => {
  const run = await AgentRun.findById(runId);
  if (!run) {
    throw new AppError(404, `AgentRun ${runId} not found`);
  }

  const sessionIdStr = run.sessionId.toString();

  // Evaluate if current run is the first run created for its session
  const earliestRun = await AgentRun.findOne({ sessionId: run.sessionId })
    .sort({ createdAt: 1 })
    .select('_id');
  const isFirstRun = earliestRun?._id.toString() === runId;

  let rawSpans: SpanRecord[] = [];
  let telemetryStatus: 'authoritative_signoz' | 'active_span_store' | 'unavailable' = 'unavailable';

  // 1. Authoritative Source: Query SigNoz for traces matching axray.run.id
  try {
    const apiKey = process.env.SIGNOZ_MCP_API_KEY || process.env.SIGNOZ_API_KEY;
    if (apiKey) {
      const queryRes: any = await signozService.executeQuery("traces");
      if (queryRes && Array.isArray(queryRes.content) && queryRes.content.length > 0) {
        // Parse SigNoz trace spans
        const signozSpans: SpanRecord[] = [];
        for (const item of queryRes.content) {
          if (item.type === 'text' && item.text) {
            try {
              const parsed = JSON.parse(item.text);
              if (Array.isArray(parsed)) {
                for (const s of parsed) {
                  const attrs = s.attributes || s.tagMap || {};
                  if (
                    attrs[AXRAY_ATTRIBUTES.RUN_ID] === runId ||
                    attrs['run.id'] === runId ||
                    (isFirstRun && (attrs[AXRAY_ATTRIBUTES.SESSION_ID] === sessionIdStr || attrs['session.id'] === sessionIdStr) && attrs[AXRAY_ATTRIBUTES.PHASE] === 'setup')
                  ) {
                    signozSpans.push({
                      id: s.spanId || s.id || Math.random().toString(36).substring(2),
                      traceId: s.traceId || run.traceId || '',
                      name: s.name || s.operationName || 'span',
                      status: s.statusCode === 'ERROR' || s.status === 'failed' ? 'failed' : 'completed',
                      startTime: s.startTime || new Date().toISOString(),
                      durationMs: s.durationMs || 0,
                      attributes: attrs,
                    });
                  }
                }
              }
            } catch {}
          }
        }

        if (signozSpans.length > 0) {
          rawSpans = signozSpans;
          telemetryStatus = 'authoritative_signoz';
        }
      }
    }
  } catch (err) {
    console.warn(`[Timeline] SigNoz query fallback to local spanStoreProcessor:`, err instanceof Error ? err.message : String(err));
  }

  // 2. Active Ingestion Bridge: Query local spanStoreProcessor if SigNoz has no spans yet
  if (rawSpans.length === 0) {
    const localSpans = spanStoreProcessor.getSpansForRun(
      runId,
      isFirstRun ? sessionIdStr : undefined
    );
    if (localSpans.length > 0) {
      rawSpans = localSpans;
      telemetryStatus = 'active_span_store';
    }
  }

  // 3. Unavailable State: Return graceful empty timeline without fabricating data
  if (rawSpans.length === 0) {
    return {
      runId,
      sessionId: sessionIdStr,
      status: run.status,
      telemetryStatus: 'unavailable',
      message: 'Execution telemetry is temporarily unavailable.',
      summary: {
        totalDurationMs: run.durationMs,
        totalEvents: 0,
        inputTokens: run.tokensUsed,
        totalTokens: run.tokensUsed,
      },
      events: [],
    };
  }

  // Deduplicate and sort spans by startTime
  const uniqueSpans = new Map<string, SpanRecord>();
  for (const s of rawSpans) {
    uniqueSpans.set(s.id, s);
  }
  const sortedSpans = Array.from(uniqueSpans.values()).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const events = sortedSpans.map(normalizeSpanToEvent);

  // Aggregate token metrics strictly from LLM spans
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;

  for (const event of events) {
    if (event.phase === 'llm' && event.metadata) {
      if (typeof event.metadata.inputTokens === 'number') inputTokens += event.metadata.inputTokens;
      if (typeof event.metadata.outputTokens === 'number') outputTokens += event.metadata.outputTokens;
      if (typeof event.metadata.totalTokens === 'number') totalTokens += event.metadata.totalTokens;
    }
  }

  // Fallback token total from MongoDB run record if LLM spans didn't report exact turn counts
  if (totalTokens === 0 && run.tokensUsed) {
    totalTokens = run.tokensUsed;
  }

  const summary: TimelineSummary = {
    totalDurationMs: run.durationMs || (events.length > 0 ? events.reduce((acc, curr) => acc + (curr.durationMs || 0), 0) : undefined),
    totalEvents: events.length,
    inputTokens: inputTokens > 0 ? inputTokens : undefined,
    outputTokens: outputTokens > 0 ? outputTokens : undefined,
    totalTokens: totalTokens > 0 ? totalTokens : undefined,
  };

  return {
    runId,
    sessionId: sessionIdStr,
    status: run.status,
    telemetryStatus,
    summary,
    events,
  };
};
