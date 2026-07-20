import * as fs from "fs";
import * as path from "path";

/**
 * Function declaration for the write_file tool.
 */
export const writeFileDeclaration = {
  name: "write_file",
  description:
    "Write content to a file at the given path relative to the workspace root. " +
    "If the file exists it will be overwritten entirely. Parent directories are created automatically. " +
    "Always read the file first to understand its full content before writing.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "The file path relative to the workspace root, e.g. 'src/math.ts'.",
      },
      content: {
        type: "string",
        description:
          "The complete new content for the file as a raw text string. " +
          "Do NOT pass a JSON object here; if writing JSON or code, format the entire payload as a string.",
      },
    },
    required: ["path", "content"],
  },
};

/**
 * Execute the write_file tool.
 * @param args - The tool arguments from the LLM.
 * @param workspaceDir - Absolute path to the workspace root.
 * @returns A success message or an error message.
 */
export function executeWriteFile(
  args: { path: string; content: string },
  workspaceDir: string
): string {
  try {
    const resolved = path.resolve(workspaceDir, args.path);

    // Security: prevent path traversal outside the workspace
    if (!resolved.startsWith(path.resolve(workspaceDir))) {
      return `Error: path '${args.path}' resolves outside the workspace. Access denied.`;
    }

    // Create parent directories if they don't exist
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(resolved, args.content, "utf-8");

    const sizeBytes = Buffer.byteLength(args.content, "utf-8");
    return `Successfully wrote ${sizeBytes} bytes to '${args.path}'.`;
  } catch (err: any) {
    return `Error writing file '${args.path}': ${err.message}`;
  }
}
