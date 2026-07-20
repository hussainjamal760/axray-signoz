import { execSync } from "child_process";
import * as path from "path";

export interface DiffResult {
  hasChanges: boolean;
  rawDiff: string;
  filesChanged: string[];
}

/**
 * Capture the git diff of the workspace to inspect changes made by the agent.
 */
export function captureWorkspaceDiff(workspaceDir: string): DiffResult {
  const cwd = path.resolve(workspaceDir);
  try {
    const rawDiff = execSync("git diff HEAD", {
      cwd,
      encoding: "utf-8",
      maxBuffer: 5 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const filesOutput = execSync("git diff --name-only HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const filesChanged = filesOutput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    return {
      hasChanges: filesChanged.length > 0,
      rawDiff: rawDiff.trim(),
      filesChanged,
    };
  } catch {
    // Fallback to git status if diff HEAD fails
    try {
      const statusOutput = execSync("git status --short", {
        cwd,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return {
        hasChanges: statusOutput.trim().length > 0,
        rawDiff: statusOutput.trim(),
        filesChanged: statusOutput
          .split("\n")
          .map((line) => line.trim().slice(3))
          .filter(Boolean),
      };
    } catch {
      return {
        hasChanges: false,
        rawDiff: "(git diff unavailable)",
        filesChanged: [],
      };
    }
  }
}
