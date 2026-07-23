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
