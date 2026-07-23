import * as containerService from './container.service';
import { parseNumstat, NumstatParsedResult } from '../utils/diff-parser';
import { tracer } from '../lib/telemetry';
import { AXRAY_ATTRIBUTES } from '../lib/telemetry-attributes';
import { SpanStatusCode } from '@opentelemetry/api';
import { emitLiveEvent } from '../sockets/socket.emitter';

export { parseNumstat, NumstatParsedResult };

const WORKSPACE_DIR = '/workspace';
const MAX_DIFF_BYTES = 500000; // Safe inline diff limit for MVP

export interface GitDiffResult {
  rawDiff: string;
  filesChanged: string[];
  insertions: number;
  deletions: number;
  truncated: boolean;
  diffSize: number;
  changeSummary: string;
}

/**
 * Git Service
 * Responsible for inspecting Git repository diffs inside Docker workspace containers.
 * Implements safe size limits & truncation for large diffs.
 * Emits real-time socket events when git diff is captured.
 */
export const getDiff = async (
  containerId: string,
  telemetryContext?: { runId?: string; sessionId?: string }
): Promise<GitDiffResult> => {
  const sessionId = telemetryContext?.sessionId;
  const runId = telemetryContext?.runId;

  if (sessionId) {
    emitLiveEvent(sessionId, {
      sessionId,
      runId,
      timestamp: new Date().toISOString(),
      eventType: 'git.diff.started',
      phase: 'git',
      status: 'running',
      title: 'Capturing Git Diff',
      description: 'Inspecting workspace repository changes',
    });
  }

  const span = tracer.startSpan('git.diff', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: telemetryContext?.runId || '',
      [AXRAY_ATTRIBUTES.SESSION_ID]: telemetryContext?.sessionId || '',
      [AXRAY_ATTRIBUTES.PHASE]: 'git',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'git.diff',
      [AXRAY_ATTRIBUTES.CONTAINER_ID]: containerId,
    },
  });

  console.log(`[Git] Fetching git diff for container ${containerId}...`);

  try {
    // 1. Fetch raw diff
    const diffRes = await containerService.executeCommand(
      containerId,
      `cd ${WORKSPACE_DIR} && git diff`,
      { maxBufferBytes: 500000 }
    );
    const fullDiff = diffRes.exitCode === 0 ? diffRes.output : '';
    const diffSize = Buffer.byteLength(fullDiff, 'utf8');

    // 2. Fetch numstat for filesChanged, insertions, deletions
    const numstatRes = await containerService.executeCommand(
      containerId,
      `cd ${WORKSPACE_DIR} && git diff --numstat`,
      { maxBufferBytes: 100000 }
    );

    const numstatOutput = numstatRes.exitCode === 0 ? numstatRes.output : '';
    const { filesChanged, insertions, deletions } = parseNumstat(numstatOutput);

    // 3. Check for untracked files (git status --porcelain)
    const statusRes = await containerService.executeCommand(
      containerId,
      `cd ${WORKSPACE_DIR} && git status --porcelain`,
      { maxBufferBytes: 20000 }
    );

    if (statusRes.exitCode === 0 && statusRes.output) {
      const lines = statusRes.output.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('??')) {
          const untrackedFile = trimmed.substring(3).trim();
          if (untrackedFile && !filesChanged.includes(untrackedFile)) {
            filesChanged.push(untrackedFile);
          }
        }
      }
    }

    const truncated = diffSize > MAX_DIFF_BYTES;
    let rawDiff = fullDiff;
    if (truncated) {
      rawDiff = fullDiff.substring(0, MAX_DIFF_BYTES) + `\n\n[Diff truncated: Total diff size is ${diffSize} bytes. Showing 500KB preview...]`;
    }

    const changeSummary = `${filesChanged.length} ${filesChanged.length === 1 ? 'file' : 'files'} changed (+${insertions}/-${deletions})`;

    console.log(
      `[Git] Diff captured: ${changeSummary} (Size: ${diffSize} bytes, Truncated: ${truncated})`
    );

    span.setAttribute(AXRAY_ATTRIBUTES.GIT_FILES_CHANGED, filesChanged.length);
    span.setAttribute(AXRAY_ATTRIBUTES.GIT_INSERTIONS, insertions);
    span.setAttribute(AXRAY_ATTRIBUTES.GIT_DELETIONS, deletions);
    span.setAttribute(AXRAY_ATTRIBUTES.GIT_DIFF_TRUNCATED, truncated);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    const result: GitDiffResult = {
      rawDiff,
      filesChanged,
      insertions,
      deletions,
      truncated,
      diffSize,
      changeSummary,
    };

    if (sessionId) {
      emitLiveEvent(sessionId, {
        sessionId,
        runId,
        timestamp: new Date().toISOString(),
        eventType: 'git.diff.completed',
        phase: 'git',
        status: 'completed',
        title: 'Git Diff Captured',
        description: changeSummary,
        metadata: {
          rawDiff: result.rawDiff,
          filesChanged: result.filesChanged,
          insertions: result.insertions,
          deletions: result.deletions,
          diffTruncated: result.truncated,
          diffSize: result.diffSize,
          changeSummary: result.changeSummary,
        },
      });
    }

    return result;
  } catch (error: any) {
    console.warn(`[Git Warning] Failed to get diff:`, error?.message || String(error));
    span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message || String(error) });
    span.end();

    const emptyResult: GitDiffResult = {
      rawDiff: '',
      filesChanged: [],
      insertions: 0,
      deletions: 0,
      truncated: false,
      diffSize: 0,
      changeSummary: '0 files changed',
    };

    if (sessionId) {
      emitLiveEvent(sessionId, {
        sessionId,
        runId,
        timestamp: new Date().toISOString(),
        eventType: 'git.diff.completed',
        phase: 'git',
        status: 'failed',
        title: 'Git Diff Failed',
        description: 'Failed to capture git diff',
        metadata: emptyResult as any,
      });
    }

    return emptyResult;
  }
};
