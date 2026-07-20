import * as fs from "fs";
import * as path from "path";

/**
 * Function declaration for the read_file tool.
 */
export const readFileDeclaration = {
  name: "read_file",
  description:
    "Read the contents of a file at the given path relative to the workspace root. " +
    "Returns the full file content as a string. Use this to understand existing code before making changes.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "The file path relative to the workspace root, e.g. 'src/math.ts' or 'package.json'.",
      },
    },
    required: ["path"],
  },
};

/**
 * Execute the read_file tool.
 * @param args - The tool arguments from the LLM.
 * @param workspaceDir - Absolute path to the workspace root.
 * @returns The file content or an error message.
 */
export function executeReadFile(
  args: { path: string },
  workspaceDir: string
): string {
  try {
    const resolved = path.resolve(workspaceDir, args.path);

    // Security: prevent path traversal outside the workspace
    if (!resolved.startsWith(path.resolve(workspaceDir))) {
      return `Error: path '${args.path}' resolves outside the workspace. Access denied.`;
    }

    if (!fs.existsSync(resolved)) {
      return `Error: file '${args.path}' does not exist.`;
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      // If it's a directory, list its contents instead
      const entries = fs.readdirSync(resolved, { withFileTypes: true });
      const listing = entries
        .map((e) => `${e.isDirectory() ? "[dir]" : "[file]"} ${e.name}`)
        .join("\n");
      return `'${args.path}' is a directory. Contents:\n${listing}`;
    }

    // Cap at ~10KB to avoid blowing up the LLM context limits
    const MAX_SIZE = 10 * 1024;
    if (stat.size > MAX_SIZE) {
      const content = fs.readFileSync(resolved, "utf-8").substring(0, MAX_SIZE);
      return `${content}\n\n... [truncated, file is ${stat.size} bytes, showing first ${MAX_SIZE}]`;
    }

    return fs.readFileSync(resolved, "utf-8");
  } catch (err: any) {
    return `Error reading file '${args.path}': ${err.message}`;
  }
}
