import { spanStoreProcessor, SpanRecord } from '../lib/telemetry';
import { Session } from '../models/session.model';
import { AgentRun } from '../models/agent-run.model';

export type TimelineEventType =
  | 'session'
  | 'container'
  | 'git'
  | 'workspace'
  | 'runtime'
  | 'agent'
  | 'tool'
  | 'diff';

export type TimelineEventStatus = 'completed' | 'running' | 'failed' | 'skipped';

export interface TimelineItem {
  id: string;
  parentId?: string;
  name: string;
  type: TimelineEventType;
  status: TimelineEventStatus;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  attributes?: Record<string, any>;
}

export function formatSpanToTimelineItem(span: SpanRecord): TimelineItem {
  let name = span.name;
  let type: TimelineEventType = 'workspace';
  const attr = span.attributes || {};

  switch (span.name) {
    case 'session.create':
      name = 'Session Created';
      type = 'session';
      break;
    case 'container.start':
    case 'container.ensure':
      name = 'Container Started';
      type = 'container';
      break;
    case 'workspace.clone':
      name = 'Repository Cloned';
      type = 'git';
      break;
    case 'workspace.checkout':
      name = 'Branch Checked Out';
      type = 'git';
      break;
    case 'workspace.analyze':
      name = 'Workspace Analysis';
      type = 'workspace';
      break;
    case 'workspace.ensure_runtime':
      name = 'Runtime Installed';
      type = 'runtime';
      break;
    case 'workspace.install_deps':
      name = 'Dependencies Installed';
      type = 'workspace';
      break;
    case 'agent.run':
      name = 'Agent Started';
      type = 'agent';
      break;
    case 'agent.execute':
      name = 'Agent Execution Turn';
      type = 'agent';
      break;
    case 'tool.execute':
      const toolName = attr['tool.name'] || attr['name'] || 'tool';
      name = `Tool Call: ${toolName}`;
      type = 'tool';
      break;
    case 'git.diff':
      name = 'Git Diff Generated';
      type = 'diff';
      break;
    default:
      if (span.name.startsWith('tool.')) {
        name = `Tool Call: ${span.name.replace('tool.', '')}`;
        type = 'tool';
      } else {
        name = span.name
          .split('.')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
      break;
  }

  return {
    id: span.id,
    parentId: span.parentId,
    name,
    type,
    status: span.status,
    startTime: span.startTime,
    endTime: span.endTime,
    durationMs: span.durationMs,
    attributes: attr,
  };
}

/**
 * Timeline Service
 * Source of Truth: OpenTelemetry spans captured from SigNoz telemetry tracer.
 * Provides fallback timeline reconstruction from session/run metadata if in-memory telemetry buffer is cold.
 */
export const getTimelineForSession = async (sessionId: string): Promise<TimelineItem[]> => {
  // 1. Check OpenTelemetry SpanStore
  const recordedSpans = spanStoreProcessor.getSpansForSession(sessionId);

  if (recordedSpans.length > 0) {
    return recordedSpans.map(formatSpanToTimelineItem);
  }

  // 2. Fallback: Reconstruct timeline from session and agent run database records
  const session = await Session.findById(sessionId);
  if (!session) {
    return [];
  }

  const items: TimelineItem[] = [];
  const createdAtStr = session.createdAt ? session.createdAt.toISOString() : new Date().toISOString();

  // Session Created
  items.push({
    id: `sess-${session._id}-created`,
    name: 'Session Created',
    type: 'session',
    status: 'completed',
    startTime: createdAtStr,
    endTime: createdAtStr,
    durationMs: 0,
    attributes: {
      'session.id': session._id.toString(),
      'repository.name': session.repositoryFullName,
      'git.branch': session.branch,
    },
  });

  // Container Started
  if (session.containerId) {
    items.push({
      id: `container-${session.containerId}`,
      name: 'Container Started',
      type: 'container',
      status: session.containerStatus === 'failed' ? 'failed' : 'completed',
      startTime: createdAtStr,
      endTime: createdAtStr,
      durationMs: 150,
      attributes: {
        'container.id': session.containerId,
        'container.status': session.containerStatus,
      },
    });
  }

  // Workspace Preparation Events
  if (session.workspaceInitialized && session.workspaceSpec) {
    items.push({
      id: `ws-${session._id}-clone`,
      name: 'Repository Cloned',
      type: 'git',
      status: 'completed',
      startTime: createdAtStr,
      durationMs: 850,
      attributes: { 'repository.name': session.repositoryFullName },
    });

    items.push({
      id: `ws-${session._id}-analyze`,
      name: 'Workspace Analysis',
      type: 'workspace',
      status: 'completed',
      startTime: createdAtStr,
      durationMs: 1200,
      attributes: {
        runtime: session.workspaceSpec.runtime,
        packageManager: session.workspaceSpec.packageManager,
      },
    });

    items.push({
      id: `ws-${session._id}-runtime`,
      name: 'Runtime Installed',
      type: 'runtime',
      status: 'completed',
      startTime: createdAtStr,
      durationMs: 2100,
      attributes: { runtime: session.workspaceSpec.runtime },
    });

    items.push({
      id: `ws-${session._id}-deps`,
      name: 'Dependencies Installed',
      type: 'workspace',
      status: 'completed',
      startTime: createdAtStr,
      durationMs: 3400,
      attributes: { installCommand: session.workspaceSpec.installCommand },
    });
  }

  // Agent Runs
  const runs = await AgentRun.find({ sessionId }).sort({ createdAt: 1 });
  for (const run of runs) {
    const runStartStr = run.startedAt ? run.startedAt.toISOString() : (run.createdAt ? run.createdAt.toISOString() : createdAtStr);
    const runEndStr = run.completedAt ? run.completedAt.toISOString() : undefined;

    items.push({
      id: `run-${run._id}-start`,
      name: 'Agent Started',
      type: 'agent',
      status: run.status === 'running' ? 'running' : run.status === 'failed' ? 'failed' : 'completed',
      startTime: runStartStr,
      endTime: runEndStr,
      durationMs: run.durationMs,
      attributes: {
        'run.id': run._id.toString(),
        prompt: run.prompt,
      },
    });

    if (run.status === 'completed' || run.diff) {
      items.push({
        id: `run-${run._id}-diff`,
        name: 'Git Diff Generated',
        type: 'diff',
        status: 'completed',
        startTime: runEndStr || runStartStr,
        endTime: runEndStr,
        durationMs: 350,
        attributes: {
          filesChanged: run.filesChanged?.length || 0,
          insertions: run.insertions || 0,
          deletions: run.deletions || 0,
        },
      });

      items.push({
        id: `run-${run._id}-complete`,
        name: 'Run Completed',
        type: 'agent',
        status: 'completed',
        startTime: runEndStr || runStartStr,
        endTime: runEndStr,
        durationMs: run.durationMs,
        attributes: {
          tokensUsed: run.tokensUsed,
        },
      });
    } else if (run.status === 'failed') {
      items.push({
        id: `run-${run._id}-failed`,
        name: 'Run Failed',
        type: 'agent',
        status: 'failed',
        startTime: runEndStr || runStartStr,
        endTime: runEndStr,
        durationMs: run.durationMs,
        attributes: {
          errorMessage: run.errorMessage,
        },
      });
    }
  }

  return items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};
