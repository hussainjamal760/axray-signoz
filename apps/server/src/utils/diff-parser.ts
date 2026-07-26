export interface NumstatParsedResult {
  filesChanged: string[];
  insertions: number;
  deletions: number;
}

/**
 * Parses `git diff --numstat` output format:
 * <insertions>\t<deletions>\t<filename>
 * Handles binary files (where insertions/deletions are '-').
 */
export function parseNumstat(numstatOutput: string): NumstatParsedResult {
  const filesChanged: string[] = [];
  let insertions = 0;
  let deletions = 0;

  if (!numstatOutput || !numstatOutput.trim()) {
    return { filesChanged, insertions, deletions };
  }

  const lines = numstatOutput.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Git documented numstat format: <insertions>\t<deletions>\t<filename>
    const tabParts = trimmed.split('\t');
    let insStr = '';
    let delStr = '';
    let filename = '';

    if (tabParts.length >= 3) {
      insStr = tabParts[0].trim();
      delStr = tabParts[1].trim();
      filename = tabParts.slice(2).join('\t').trim();
    } else {
      // Fallback for space-separated numstat lines
      const spaceParts = trimmed.split(/\s+/);
      if (spaceParts.length >= 3) {
        insStr = spaceParts[0].trim();
        delStr = spaceParts[1].trim();
        filename = spaceParts.slice(2).join(' ');
      }
    }

    if (filename) {
      if (!filesChanged.includes(filename)) {
        filesChanged.push(filename);
      }

      // Check numeric totals (ignore binary file '-')
      const ins = parseInt(insStr, 10);
      const del = parseInt(delStr, 10);

      if (!isNaN(ins)) insertions += ins;
      if (!isNaN(del)) deletions += del;
    }
  }

  return { filesChanged, insertions, deletions };
}

export function parseUnifiedDiff(rawDiff: string): { filename: string; insertions: number; deletions: number }[] {
  if (!rawDiff || !rawDiff.trim()) return [];

  const files: { filename: string; insertions: number; deletions: number }[] = [];
  const rawFileBlocks = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const block of rawFileBlocks) {
    const lines = block.split('\n');
    const firstLine = lines[0] || '';

    let filename = 'file';
    const filenameMatch = firstLine.match(/a\/(.*?)\s+b\/(.*)/);
    if (filenameMatch) {
      filename = filenameMatch[2] || filenameMatch[1];
    } else {
      const parts = firstLine.trim().split(/\s+/);
      filename = parts[parts.length - 1] || 'file';
    }

    let currentHunk = false;
    let insertions = 0;
    let deletions = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^@@\s+-\d+(?:,\d+)?\s+\+\d+(?:,\d+)?\s+@@/.test(line)) {
        currentHunk = true;
        continue;
      }

      if (!currentHunk) continue;

      if (
        line.startsWith('--- ') ||
        line.startsWith('+++ ') ||
        line.startsWith('--- a/') ||
        line.startsWith('+++ b/') ||
        line.startsWith('index ') ||
        line.startsWith('\\ No newline')
      ) {
        continue;
      }

      if (line.startsWith('-')) {
        deletions++;
      } else if (line.startsWith('+')) {
        insertions++;
      }
    }

    files.push({ filename, insertions, deletions });
  }

  return files;
}
