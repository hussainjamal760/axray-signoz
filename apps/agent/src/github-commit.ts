import { execSync } from "child_process";
import * as path from "path";

export interface CommitOptions {
  workspaceDir: string;
  commitMessage: string;
  branch?: string;
  gitUser?: string;
  gitEmail?: string;
}

export interface CommitResult {
  success: boolean;
  message: string;
}

/**
 * Commit and optionally push changes made by the agent.
 */
export function commitAndPushChanges(options: CommitOptions): CommitResult {
  const {
    workspaceDir,
    commitMessage,
    branch,
    gitUser = "AXRAY AI Agent",
    gitEmail = "agent@axray.ai",
  } = options;
  const cwd = path.resolve(workspaceDir);

  try {
    // Configure local git committer identity
    execSync(`git config user.name "${gitUser}"`, { cwd, stdio: "ignore" });
    execSync(`git config user.email "${gitEmail}"`, { cwd, stdio: "ignore" });

    // Stage all changes
    execSync("git add .", { cwd, stdio: "pipe" });

    // Commit changes
    const cleanMsg = commitMessage.replace(/"/g, '\\"');
    execSync(`git commit -m "${cleanMsg}"`, { cwd, stdio: "pipe" });

    // Push if branch specified
    if (branch) {
      execSync(`git push origin ${branch}`, { cwd, stdio: "pipe" });
    }

    return {
      success: true,
      message: `Successfully committed changes with message: "${commitMessage}"`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Git commit/push failed: ${err.message}`,
    };
  }
}
