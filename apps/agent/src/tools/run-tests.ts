import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Function declaration for the run_tests tool.
 */
export const runTestsDeclaration = {
  name: "run_tests",
  description:
    "Run the project's test suite. Automatically detects the test runner from package.json. " +
    "Optionally pass a specific test file or pattern to run only matching tests. " +
    "Returns the full test output including pass/fail summary.",
  parameters: {
    type: "object",
    properties: {
      test_pattern: {
        type: "string",
        description:
          'Optional: a specific test file or grep pattern to run, e.g. "math.test.ts" or "addition". ' +
          "If omitted, runs the full test suite.",
      },
    },
    required: [],
  },
};

/** Maximum execution time for tests in milliseconds. */
const TIMEOUT_MS = 60_000;

/** Maximum output size in characters. */
const MAX_OUTPUT_CHARS = 6_000;

/**
 * Detect the test command from package.json.
 */
function detectTestCommand(workspaceDir: string): string {
  const pkgPath = path.join(workspaceDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return "npm test";
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const testScript = pkg.scripts?.test;

    if (!testScript || testScript.includes("no test specified")) {
      if (fs.existsSync(path.join(workspaceDir, "jest.config.js")) ||
          fs.existsSync(path.join(workspaceDir, "jest.config.ts"))) {
        return "npx jest";
      }
      if (fs.existsSync(path.join(workspaceDir, "vitest.config.ts")) ||
          fs.existsSync(path.join(workspaceDir, "vitest.config.js"))) {
        return "npx vitest run";
      }
      return "npm test";
    }

    return "npm test";
  } catch {
    return "npm test";
  }
}

/**
 * Execute the run_tests tool.
 * @param args - The tool arguments from the LLM.
 * @param workspaceDir - Absolute path to the workspace root.
 * @returns The combined stdout/stderr test output.
 */
export function executeRunTests(
  args: { test_pattern?: string },
  workspaceDir: string
): string {
  const cwd = path.resolve(workspaceDir);
  let command = detectTestCommand(cwd);

  // Append pattern if provided
  if (args.test_pattern) {
    command += ` -- ${args.test_pattern}`;
  }

  const res = spawnSync(command, {
    cwd,
    shell: true,
    timeout: TIMEOUT_MS,
    maxBuffer: 5 * 1024 * 1024,
    encoding: "utf-8",
    env: { ...process.env, CI: "true", FORCE_COLOR: "0" },
  });

  const stdout = res.stdout ?? "";
  const stderr = res.stderr ?? "";
  const combined = (stdout + "\n" + stderr).trim() || "(no output)";

  let result = `Test command: ${command}\n\n${combined}`;

  if (res.status !== 0 && res.status !== null) {
    result += `\n\nExit code: ${res.status}`;
  }

  if (res.error?.name === "AbortError" || res.error?.message?.includes("ETIMEDOUT")) {
    result += `\n\nTests timed out after ${TIMEOUT_MS / 1000} seconds.`;
  }

  if (result.length > MAX_OUTPUT_CHARS) {
    result =
      result.substring(0, MAX_OUTPUT_CHARS) +
      `\n\n... [output truncated at ${MAX_OUTPUT_CHARS} chars]`;
  }

  return result;
}
