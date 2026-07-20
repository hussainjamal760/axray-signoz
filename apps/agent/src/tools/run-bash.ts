import { execSync } from "child_process";
import * as path from "path";

/**
 * Function declaration for the run_bash tool.
 */
export const runBashDeclaration = {
  name: "run_bash",
  description:
    "Execute a shell command in the workspace directory. " +
    "Returns the combined stdout and stderr output. " +
    "Use this for running build commands, installing dependencies, inspecting directory structure, etc. " +
    "Commands have a 30-second timeout. Do NOT use this for long-running processes.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "The shell command to execute, e.g. 'ls -la', 'cat package.json', 'npm install'.",
      },
    },
    required: ["command"],
  },
};

/** Maximum execution time for a command in milliseconds. */
const TIMEOUT_MS = 30_000;

/** Maximum output size in characters to return to the LLM. */
const MAX_OUTPUT_CHARS = 4_000;

/**
 * Execute the run_bash tool.
 * @param args - The tool arguments from the LLM.
 * @param workspaceDir - Absolute path to the workspace root.
 * @returns The command output or an error message.
 */
export function executeRunBash(
  args: { command: string },
  workspaceDir: string
): string {
  const cwd = path.resolve(workspaceDir);

  try {
    const output = execSync(args.command, {
      cwd,
      timeout: TIMEOUT_MS,
      maxBuffer: 5 * 1024 * 1024, // 5 MB
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const result = output ?? "(no output)";
    if (result.length > MAX_OUTPUT_CHARS) {
      return (
        result.substring(0, MAX_OUTPUT_CHARS) +
        `\n\n... [output truncated at ${MAX_OUTPUT_CHARS} chars]`
      );
    }
    return result;
  } catch (err: any) {
    // execSync throws on non-zero exit codes, which is common and expected
    const parts: string[] = [];

    if (err.stdout) parts.push(`STDOUT:\n${err.stdout}`);
    if (err.stderr) parts.push(`STDERR:\n${err.stderr}`);
    if (err.status !== undefined) parts.push(`Exit code: ${err.status}`);
    if (err.killed) parts.push(`Process was killed (timeout: ${TIMEOUT_MS}ms)`);

    if (parts.length === 0) {
      parts.push(`Error executing command: ${err.message}`);
    }

    let result = parts.join("\n\n");
    if (result.length > MAX_OUTPUT_CHARS) {
      result =
        result.substring(0, MAX_OUTPUT_CHARS) +
        `\n\n... [output truncated at ${MAX_OUTPUT_CHARS} chars]`;
    }
    return result;
  }
}
