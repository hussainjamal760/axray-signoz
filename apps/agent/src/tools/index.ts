/**
 * Barrel export for all agent tools.
 *
 * Each tool exposes:
 * - A Gemini function declaration (for the model's `tools` config)
 * - An execute function (called when the model returns a function call)
 */

export { readFileDeclaration, executeReadFile } from "./read-file";
export { writeFileDeclaration, executeWriteFile } from "./write-file";
export { runBashDeclaration, executeRunBash } from "./run-bash";
export { runTestsDeclaration, executeRunTests } from "./run-tests";

import { readFileDeclaration } from "./read-file";
import { writeFileDeclaration } from "./write-file";
import { runBashDeclaration } from "./run-bash";
import { runTestsDeclaration } from "./run-tests";

/**
 * All tool declarations, ready to pass into Groq's `tools` config.
 */
export const allToolDeclarations = [
  {
    type: "function" as const,
    function: readFileDeclaration,
  },
  {
    type: "function" as const,
    function: writeFileDeclaration,
  },
  {
    type: "function" as const,
    function: runBashDeclaration,
  },
  {
    type: "function" as const,
    function: runTestsDeclaration,
  },
];
