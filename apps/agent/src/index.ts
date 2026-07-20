#!/usr/bin/env node

import * as dotenv from "dotenv";
dotenv.config({ override: true });
import { Command } from "commander";
import * as path from "path";
import { runAgent } from "./agent-runner";
import { startTelemetry, shutdownTelemetry } from "./instrumentation";
import { commitAndPushChanges } from "./github-commit";

// Initialize OpenTelemetry immediately
startTelemetry();

const program = new Command();

program
  .name("axray-agent")
  .description("AXRAY Coding Agent — give it a task, watch it work")
  .version("1.0.0")
  .requiredOption(
    "--task <task>",
    "The task for the agent to perform, e.g. \"fix the failing test in math.ts\""
  )
  .option(
    "--dir <directory>",
    "Path to the workspace/repo directory (default: current directory)",
    process.cwd()
  )
  .option(
    "--model <model>",
    "Groq model to use",
    "openai/gpt-oss-20b"
  )
  .option(
    "--max-turns <number>",
    "Maximum number of LLM call turns",
    "30"
  )
  .option("--commit", "Auto-commit changes on success", false)
  .option("--push-branch <branch>", "Branch to push changes to on success")
  .option("-v, --verbose", "Enable verbose logging", false);

program.parse(process.argv);

const opts = program.opts();

async function main() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║         🔍 AXRAY Coding Agent        ║");
  console.log("╚══════════════════════════════════════╝\n");

  const workspaceDir = path.resolve(opts.dir);
  console.log(`📁 Workspace: ${workspaceDir}`);
  console.log(`📝 Task: ${opts.task}`);
  console.log(`🤖 Model: ${opts.model}`);
  console.log(`🔄 Max turns: ${opts.maxTurns}`);
  console.log("");

  try {
    const result = await runAgent({
      task: opts.task,
      workspaceDir,
      model: opts.model,
      maxTurns: parseInt(opts.maxTurns, 10),
      verbose: opts.verbose,
    });

    console.log("\n╔══════════════════════════════════════╗");
    console.log("║           📊 Run Summary             ║");
    console.log("╚══════════════════════════════════════╝\n");
    console.log(`Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`Turns used: ${result.totalTurns}`);
    console.log(`Tokens: ${result.totalInputTokens} in / ${result.totalOutputTokens} out`);
    if (result.diff) {
      console.log(`Files modified (${result.diff.filesChanged.length}): ${result.diff.filesChanged.join(", ") || "none"}`);
    }
    console.log(`\nSummary:\n${result.summary}`);

    if (result.success && (opts.commit || opts.pushBranch)) {
      console.log("\n📦 Committing changes...");
      const commitRes = commitAndPushChanges({
        workspaceDir,
        commitMessage: `AXRAY Agent Fix: ${opts.task}`,
        branch: opts.pushBranch,
      });
      console.log(commitRes.message);
    }

    await shutdownTelemetry();
    if (!result.success) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error(`\n❌ Fatal error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    await shutdownTelemetry();
    process.exit(2);
  }
}

main();
