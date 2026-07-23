import { Groq } from 'groq-sdk';
import { z } from 'zod';
import * as containerService from './container.service';
import { IWorkspaceSpec } from '../models/session.model';

const WORKSPACE_DIR = '/workspace';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

export const WorkspaceSpecSchema = z.object({
  runtime: z.string().default('node'),
  runtimeVersion: z.string().default('22'),
  packageManager: z.string().default('npm'),
  installCommand: z.string().default('npm install'),
  buildCommand: z.string().nullable().optional(),
  runCommand: z.string().nullable().optional(),
  testCommand: z.string().nullable().optional(),
  reasoning: z.string().default('Analyzed workspace metadata files.'),
});

const ALLOWED_PACKAGE_MANAGERS = [
  'npm',
  'pnpm',
  'yarn',
  'pip',
  'poetry',
  'cargo',
  'go',
  'composer',
  'bun',
];

function validateInstallCommand(command: string): void {
  const normalized = command.trim().toLowerCase();
  const startsWithAllowed = ALLOWED_PACKAGE_MANAGERS.some((pm) =>
    normalized.startsWith(pm)
  );

  if (!startsWithAllowed && !normalized.startsWith('echo')) {
    console.warn(
      `[Workspace Analysis Warning] Unrecognized install command prefix: "${command}". Defaulting to npm install.`
    );
  }
}

export const inspectWorkspace = async (
  containerId: string
): Promise<IWorkspaceSpec> => {
  console.log(`[Workspace Analysis] Inspecting workspace metadata in container ${containerId}...`);

  // 1. Collect project metadata files via containerService.executeCommand
  const lsResult = await containerService.executeCommand(
    containerId,
    `ls -la ${WORKSPACE_DIR}`
  );

  const pkgJsonResult = await containerService.executeCommand(
    containerId,
    `cat ${WORKSPACE_DIR}/package.json`
  );

  const reqTxtResult = await containerService.executeCommand(
    containerId,
    `cat ${WORKSPACE_DIR}/requirements.txt`
  );

  const pyProjectResult = await containerService.executeCommand(
    containerId,
    `cat ${WORKSPACE_DIR}/pyproject.toml`
  );

  const cargoResult = await containerService.executeCommand(
    containerId,
    `cat ${WORKSPACE_DIR}/Cargo.toml`
  );

  const goModResult = await containerService.executeCommand(
    containerId,
    `cat ${WORKSPACE_DIR}/go.mod`
  );

  const nvmrcResult = await containerService.executeCommand(
    containerId,
    `cat ${WORKSPACE_DIR}/.nvmrc`
  );

  const metadataSummary = `
--- DIRECTORY LISTING ---
${lsResult.output.substring(0, 1000)}

--- package.json ---
${pkgJsonResult.exitCode === 0 ? pkgJsonResult.output.substring(0, 2000) : '(not found)'}

--- requirements.txt ---
${reqTxtResult.exitCode === 0 ? reqTxtResult.output.substring(0, 1000) : '(not found)'}

--- pyproject.toml ---
${pyProjectResult.exitCode === 0 ? pyProjectResult.output.substring(0, 1000) : '(not found)'}

--- Cargo.toml ---
${cargoResult.exitCode === 0 ? cargoResult.output.substring(0, 1000) : '(not found)'}

--- go.mod ---
${goModResult.exitCode === 0 ? goModResult.output.substring(0, 1000) : '(not found)'}

--- .nvmrc ---
${nvmrcResult.exitCode === 0 ? nvmrcResult.output.substring(0, 200) : '(not found)'}
`.trim();

  // 2. Prepare Groq LLM prompt
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.warn(`[Workspace Analysis Warning] GROQ_API_KEY missing. Falling back to default Node spec.`);
    return {
      runtime: 'node',
      runtimeVersion: '22',
      packageManager: 'npm',
      installCommand: 'npm install',
      reasoning: 'GROQ_API_KEY not set; using fallback Node 22 spec.',
    };
  }

  const groq = new Groq({ apiKey: groqApiKey });

  const SYSTEM_PROMPT = `You are an expert software project analyzer.
Your task is to analyze project metadata and determine its build & setup requirements.

You MUST respond ONLY with a raw, valid JSON object matching this TypeScript schema:
{
  "runtime": "node | python | rust | go | unknown",
  "runtimeVersion": "e.g. 22 or 3.11 or 1.75",
  "packageManager": "e.g. pnpm | npm | yarn | pip | cargo | go",
  "installCommand": "e.g. pnpm install or npm install or pip install -r requirements.txt",
  "buildCommand": "optional build command or null",
  "runCommand": "optional dev/run command or null",
  "testCommand": "optional test command or null",
  "reasoning": "Brief 1-2 sentence explanation of why you selected these commands."
}

CRITICAL RULES:
- Do NOT output markdown code blocks (no \`\`\`json).
- Return ONLY the JSON object.
- Never include curl/wget shell script downloads in installCommand.
- Choose standard install commands for the detected package manager.`;

  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      console.log(`[Workspace Analysis] Querying Groq API (${DEFAULT_GROQ_MODEL}) [Attempt ${attempts}]...`);
      const chatCompletion = await groq.chat.completions.create({
        model: DEFAULT_GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this repository metadata:\n\n${metadataSummary}` },
        ],
        temperature: 0.1,
      });

      const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '';
      console.log(`[Workspace Analysis] Received Groq response:\n${responseText}`);

      // Strip markdown wrappers if any were returned
      const cleanJsonStr = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

      const parsedJson = JSON.parse(cleanJsonStr);
      const validatedSpec = WorkspaceSpecSchema.parse(parsedJson);

      validateInstallCommand(validatedSpec.installCommand);

      console.log(`[Workspace Analysis] Successfully parsed & validated WorkspaceSpec:`, validatedSpec);
      return validatedSpec;
    } catch (err: any) {
      console.warn(`[Workspace Analysis Warning] Attempt ${attempts} failed:`, err?.message || String(err));
      if (attempts >= 2) {
        console.warn(`[Workspace Analysis] Max attempts reached. Falling back to default Node spec.`);
        return {
          runtime: 'node',
          runtimeVersion: '22',
          packageManager: 'npm',
          installCommand: 'npm install',
          reasoning: `AI analysis failed after ${attempts} attempts: ${err?.message || err}. Falling back to default npm spec.`,
        };
      }
    }
  }

  return {
    runtime: 'node',
    runtimeVersion: '22',
    packageManager: 'npm',
    installCommand: 'npm install',
    reasoning: 'Fallback default npm spec.',
  };
};
