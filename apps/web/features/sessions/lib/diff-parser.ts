export interface DiffRow {
  oldLineNumber: number | null;
  newLineNumber: number | null;
  leftContent: string | null;
  rightContent: string | null;
  type: 'context' | 'addition' | 'deletion' | 'modified';
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  rows: DiffRow[];
}

export interface ParsedFileDiff {
  filename: string;
  oldPath?: string;
  newPath?: string;
  isBinary: boolean;
  insertions: number;
  deletions: number;
  hunks: DiffHunk[];
}

/**
 * Parses standard unified Git diff string into structured side-by-side file diff models.
 */
export function parseUnifiedDiff(rawDiff: string): ParsedFileDiff[] {
  if (!rawDiff || !rawDiff.trim()) {
    return [];
  }

  const files: ParsedFileDiff[] = [];
  const rawFileBlocks = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const block of rawFileBlocks) {
    const lines = block.split('\n');
    const firstLine = lines[0] || '';
    
    // Extract filename from "a/filepath b/filepath"
    let filename = 'file';
    const filenameMatch = firstLine.match(/a\/(.*?)\s+b\/(.*)/);
    if (filenameMatch) {
      filename = filenameMatch[2] || filenameMatch[1];
    } else {
      const parts = firstLine.trim().split(/\s+/);
      filename = parts[parts.length - 1] || 'file';
    }

    const isBinary = block.includes('Binary files') || block.includes('GIT binary patch');

    const hunks: DiffHunk[] = [];
    let currentHunk: DiffHunk | null = null;
    let curOldLine = 1;
    let curNewLine = 1;

    let pendingDeletions: string[] = [];
    let pendingAdditions: string[] = [];

    const flushPendingChanges = () => {
      if (!currentHunk) return;

      const maxLen = Math.max(pendingDeletions.length, pendingAdditions.length);
      for (let i = 0; i < maxLen; i++) {
        const delText = pendingDeletions[i];
        const addText = pendingAdditions[i];

        if (delText !== undefined && addText !== undefined) {
          currentHunk.rows.push({
            oldLineNumber: curOldLine++,
            newLineNumber: curNewLine++,
            leftContent: delText,
            rightContent: addText,
            type: 'modified',
          });
        } else if (delText !== undefined) {
          currentHunk.rows.push({
            oldLineNumber: curOldLine++,
            newLineNumber: null,
            leftContent: delText,
            rightContent: null,
            type: 'deletion',
          });
        } else if (addText !== undefined) {
          currentHunk.rows.push({
            oldLineNumber: null,
            newLineNumber: curNewLine++,
            leftContent: null,
            rightContent: addText,
            type: 'addition',
          });
        }
      }

      pendingDeletions = [];
      pendingAdditions = [];
    };

    let insertions = 0;
    let deletions = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match hunk header @@ -oldStart,oldCount +newStart,newCount @@
      const hunkMatch = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)$/);
      if (hunkMatch) {
        flushPendingChanges();

        const oldStart = parseInt(hunkMatch[1], 10);
        const oldCount = hunkMatch[2] !== undefined ? parseInt(hunkMatch[2], 10) : 1;
        const newStart = parseInt(hunkMatch[3], 10);
        const newCount = hunkMatch[4] !== undefined ? parseInt(hunkMatch[4], 10) : 1;

        curOldLine = oldStart;
        curNewLine = newStart;

        currentHunk = {
          header: line.trim(),
          oldStart,
          oldCount,
          newStart,
          newCount,
          rows: [],
        };
        hunks.push(currentHunk);
        continue;
      }

      if (!currentHunk) continue;

      // Header metadata lines within block (--- a/..., +++ b/...)
      if (line.startsWith('--- ') || line.startsWith('+++ ') || line.startsWith('index ')) {
        continue;
      }

      if (line.startsWith('-')) {
        deletions++;
        pendingDeletions.push(line.substring(1));
      } else if (line.startsWith('+')) {
        insertions++;
        pendingAdditions.push(line.substring(1));
      } else if (line.startsWith(' ') || line === '') {
        flushPendingChanges();
        const content = line.startsWith(' ') ? line.substring(1) : line;
        currentHunk.rows.push({
          oldLineNumber: curOldLine++,
          newLineNumber: curNewLine++,
          leftContent: content,
          rightContent: content,
          type: 'context',
        });
      }
    }

    flushPendingChanges();

    files.push({
      filename,
      isBinary,
      insertions,
      deletions,
      hunks,
    });
  }

  return files;
}
