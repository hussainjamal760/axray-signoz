import * as containerService from './container.service';

const WORKSPACE_DIR = '/workspace';

export interface GitDiffResult {
  rawDiff: string;
  filesChanged: string[];
  insertions: number;
  deletions: number;
}

/**
 * Git Service
 * Responsible for inspecting Git repository diffs inside Docker workspace containers.
 */
export const getDiff = async (containerId: string): Promise<GitDiffResult> => {
  console.log(`[Git] Fetching git diff for container ${containerId}...`);

  try {
    // 1. Fetch raw diff
    const diffRes = await containerService.executeCommand(
      containerId,
      `cd ${WORKSPACE_DIR} && git diff`,
      { maxBufferBytes: 200000 }
    );
    const rawDiff = diffRes.exitCode === 0 ? diffRes.output : '';

    // 2. Fetch numstat for filesChanged, insertions, deletions
    const numstatRes = await containerService.executeCommand(
      containerId,
      `cd ${WORKSPACE_DIR} && git diff --numstat`,
      { maxBufferBytes: 50000 }
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

    // 3. Also check for untracked files (git status --porcelain)
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

    console.log(
      `[Git] Diff captured: ${filesChanged.length} files changed (+${totalInsertions}/-${totalDeletions})`
    );

    return {
      rawDiff,
      filesChanged,
      insertions: totalInsertions,
      deletions: totalDeletions,
    };
  } catch (error: any) {
    console.warn(`[Git Warning] Failed to get diff:`, error?.message || String(error));
    return {
      rawDiff: '',
      filesChanged: [],
      insertions: 0,
      deletions: 0,
    };
  }
};
