import * as containerService from './container.service';

const WORKSPACE_DIR = '/workspace';
const MAX_DIFF_BYTES = 500000; // 50 KB safe inline diff limit for MVP

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
 */
export const getDiff = async (containerId: string): Promise<GitDiffResult> => {
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

    const filesChanged: string[] = [];
    let totalInsertions = 0;
    let totalDeletions = 0;

    if (numstatRes.exitCode === 0 && numstatRes.output) {
      const lines = numstatRes.output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const ins = parseInt(parts[0], 10);
          const del = parseInt(parts[1], 10);
          const file = parts.slice(2).join(' ');

          if (!isNaN(ins)) totalInsertions += ins;
          if (!isNaN(del)) totalDeletions += del;
          if (file) filesChanged.push(file);
        }
      }
    }

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
      rawDiff = fullDiff.substring(0, MAX_DIFF_BYTES) + `\n\n[Diff truncated: Total diff size is ${diffSize} bytes. Showing 50KB preview...]`;
    }

    const changeSummary = `${filesChanged.length} ${filesChanged.length === 1 ? 'file' : 'files'} changed (+${totalInsertions}/-${totalDeletions})`;

    console.log(
      `[Git] Diff captured: ${changeSummary} (Size: ${diffSize} bytes, Truncated: ${truncated})`
    );

    return {
      rawDiff,
      filesChanged,
      insertions: totalInsertions,
      deletions: totalDeletions,
      truncated,
      diffSize,
      changeSummary,
    };
  } catch (error: any) {
    console.warn(`[Git Warning] Failed to get diff:`, error?.message || String(error));
    return {
      rawDiff: '',
      filesChanged: [],
      insertions: 0,
      deletions: 0,
      truncated: false,
      diffSize: 0,
      changeSummary: '0 files changed',
    };
  }
};
