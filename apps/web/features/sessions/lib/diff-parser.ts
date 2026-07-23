export interface UnifiedDiffLine {
  type: 'context' | 'add' | 'delete';
  oldLineNumber: number | null;
  newLineNumber: number | null;
  content: string;
}

export interface UnifiedDiffHunk {
  header: string;
  lines: UnifiedDiffLine[];
}

export interface ParsedFileDiff {
  filename: string;
  isBinary: boolean;
  insertions: number;
  deletions: number;
  hunks: UnifiedDiffHunk[];
}

/**
 * Pure parser utility to convert standard unified Git diff text into structured GitHub-style file diff models.
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

    const hunks: UnifiedDiffHunk[] = [];
    let currentHunk: UnifiedDiffHunk | null = null;
    let curOldLine = 1;
    let curNewLine = 1;
    let insertions = 0;
    let deletions = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match hunk header @@ -oldStart,oldCount +newStart,newCount @@
      const hunkMatch = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)$/);
      if (hunkMatch) {
        const oldStart = parseInt(hunkMatch[1], 10);
        const newStart = parseInt(hunkMatch[3], 10);

        curOldLine = oldStart;
        curNewLine = newStart;

        currentHunk = {
          header: line.trim(),
          lines: [],
        };
        hunks.push(currentHunk);
        continue;
      }

      if (!currentHunk) continue;

      // Skip file metadata headers (--- a/..., +++ b/..., index ...)
      if (line.startsWith('--- ') || line.startsWith('+++ ') || line.startsWith('index ')) {
        continue;
      }

      if (line.startsWith('-')) {
        deletions++;
        currentHunk.lines.push({
          type: 'delete',
          oldLineNumber: curOldLine++,
          newLineNumber: null,
          content: line.substring(1),
        });
      } else if (line.startsWith('+')) {
        insertions++;
        currentHunk.lines.push({
          type: 'add',
          oldLineNumber: null,
          newLineNumber: curNewLine++,
          content: line.substring(1),
        });
      } else if (line.startsWith(' ') || line === '') {
        const content = line.startsWith(' ') ? line.substring(1) : line;
        currentHunk.lines.push({
          type: 'context',
          oldLineNumber: curOldLine++,
          newLineNumber: curNewLine++,
          content,
        });
      }
    }

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
