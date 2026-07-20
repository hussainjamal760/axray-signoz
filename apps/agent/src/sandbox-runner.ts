import * as fs from "fs";
import * as path from "path";
import { execSync, spawn, ChildProcess } from "child_process";

export interface SandboxOptions {
  sessionId?: string;
  repoUrl?: string;
  branch?: string;
  task: string;
  onLog?: (data: string) => void;
}

export interface SandboxRunResult {
  sessionId: string;
  sandboxDir: string;
  exitCode: number;
  stdout: string;
}

/**
 * Phase 5: Folder-Level Sandbox Execution.
 * Creates a unique temp folder, clones the repo into it, spawns the agent process,
 * streams real-time logs, and cleans up on completion.
 */
export async function runInSandbox(options: SandboxOptions): Promise<SandboxRunResult> {
  const sessionId = options.sessionId || Math.random().toString(36).substring(2, 12);
  const sandboxDir = path.join("/tmp/sandboxes", sessionId);

  // 1. Create unique temp folder
  fs.mkdirSync(sandboxDir, { recursive: true });

  try {
    // 2. Clone repo into sandbox if repoUrl provided
    if (options.repoUrl) {
      const branchFlag = options.branch ? `--branch ${options.branch}` : "";
      execSync(`git clone ${branchFlag} ${options.repoUrl} .`, {
        cwd: sandboxDir,
        stdio: "pipe",
      });
    }

    // 3. Spawn agent child process restricted to sandboxDir
    const agentCli = path.resolve(__dirname, "index.js");
    let stdoutBuffer = "";

    const exitCode = await new Promise<number>((resolve) => {
      const child: ChildProcess = spawn(
        "node",
        [agentCli, `--task=${options.task}`, `--dir=${sandboxDir}`],
        {
          cwd: sandboxDir,
          env: {
            ...process.env,
            SANDBOX_DIR: sandboxDir,
            SESSION_ID: sessionId,
          },
        }
      );

      child.stdout?.on("data", (chunk) => {
        const str = chunk.toString();
        stdoutBuffer += str;
        if (options.onLog) options.onLog(str);
      });

      child.stderr?.on("data", (chunk) => {
        const str = chunk.toString();
        stdoutBuffer += str;
        if (options.onLog) options.onLog(str);
      });

      child.on("close", (code) => resolve(code ?? 0));
      child.on("error", () => resolve(1));
    });

    return {
      sessionId,
      sandboxDir,
      exitCode,
      stdout: stdoutBuffer,
    };
  } finally {
    // 4. Cleanup sandbox temp directory
    try {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
