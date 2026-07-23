import { Groq } from 'groq-sdk';
import * as containerService from './container.service';
import { tracer } from '../lib/telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * Agent Service
 * Dedicated AI execution engine using Groq LLM function calling.
 * Pure service: Accepts containerId and prompt. Routes tool calls via containerService.
 */

const WORKSPACE_DIR = '/workspace';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_TURNS = 15;

export interface AgentExecutionOptions {
  containerId: string;
  prompt: string;
  maxTurns?: number;
}

export interface AgentExecutionResult {
  response: string;
  tokensUsed: number;
  cost?: number;
}

const TOOL_DECLARATIONS: any[] = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read contents of a file inside the repository /workspace. Bounded to 500 lines or 100KB.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Relative path to the file inside workspace, e.g. "package.json" or "src/index.ts"',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write complete contents to a file inside /workspace. Creates parent directories if missing.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Relative path to the file inside workspace, e.g. "src/auth/login.ts"',
          },
          content: {
            type: 'string',
            description: 'The full text content to write to the file.',
          },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Execute a bash command in /workspace inside the container. Command times out after 30 seconds.',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The shell command to run, e.g. "npm test" or "ls -la"',
          },
        },
        required: ['command'],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are AXRAY, an expert AI coding agent operating inside an isolated Docker environment.

RULES:
1. ALWAYS inspect the workspace first using run_command (e.g. "ls -la") or read_file.
2. Before modifying or testing, read relevant files using read_file to understand the project structure.
3. Use write_file to safely edit or create files with complete content. Do NOT write shell heredoc patches.
4. Use run_command to run test suites, build commands, or shell utilities.
5. When finished or satisfied with results, respond directly with a concise text response summarizing your actions. Do not invoke tools after completing your objective.`;

export const executePrompt = async (
  options: AgentExecutionOptions
): Promise<AgentExecutionResult> => {
  const span = tracer.startSpan('agent.execute', {
    attributes: {
      'container.id': options.containerId,
      'llm.model': DEFAULT_GROQ_MODEL,
      'prompt.length': options.prompt.length,
    },
  });

  console.log(`[Agent] Starting Groq execution loop in container ${options.containerId}`);

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.warn(`[Agent Warning] GROQ_API_KEY missing. Returning fallback simulation.`);
    span.setAttribute('agent.status', 'fallback_no_api_key');
    span.end();
    return {
      response: 'GROQ_API_KEY not configured. Set GROQ_API_KEY in server environment to enable live AI reasoning.',
      tokensUsed: 0,
    };
  }

  const groq = new Groq({ apiKey: groqApiKey });
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: options.prompt },
  ];

  let turn = 0;
  const maxTurns = options.maxTurns || MAX_TURNS;
  let totalTokens = 0;

  try {
    while (turn < maxTurns) {
      turn++;
      console.log(`[Agent Turn ${turn}/${maxTurns}] Querying Groq (${DEFAULT_GROQ_MODEL})...`);

      const completion = await groq.chat.completions.create({
        model: DEFAULT_GROQ_MODEL,
        messages,
        tools: TOOL_DECLARATIONS,
        temperature: 0.2,
      });

      if (completion.usage) {
        totalTokens += (completion.usage.prompt_tokens || 0) + (completion.usage.completion_tokens || 0);
      }

      const responseMessage = completion.choices[0]?.message;
      if (!responseMessage) {
        throw new Error('Groq returned empty response message');
      }

      // Append assistant response to messages array
      messages.push(responseMessage);

      // Check if LLM requested tool calls
      const toolCalls = responseMessage.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          const fnName = toolCall.function.name;
          let fnArgs: any = {};
          try {
            fnArgs = JSON.parse(toolCall.function.arguments || '{}');
          } catch {
            fnArgs = {};
          }

          console.log(`[Agent Tool Call] Function: "${fnName}", Args:`, fnArgs);

          const toolSpan = tracer.startSpan('tool.execute', {
            attributes: {
              'tool.name': fnName,
              'container.id': options.containerId,
            },
          });

          let toolOutput = '';

          if (fnName === 'read_file') {
            toolSpan.setAttribute('tool.path', fnArgs.path || '');
            const readRes = await containerService.executeCommand(
              options.containerId,
              `head -n 500 ${WORKSPACE_DIR}/${fnArgs.path}`,
              { timeoutMs: 15000, maxBufferBytes: 100000 }
            );
            toolOutput = readRes.exitCode === 0
              ? readRes.output
              : `Error reading file ${fnArgs.path}: ${readRes.output}`;
          } else if (fnName === 'write_file') {
            toolSpan.setAttribute('tool.path', fnArgs.path || '');
            const filePath = fnArgs.path || '';
            const content = fnArgs.content || '';
            const base64Content = Buffer.from(content, 'utf8').toString('base64');
            const mkdirRes = await containerService.executeCommand(
              options.containerId,
              `mkdir -p $(dirname ${WORKSPACE_DIR}/${filePath})`
            );
            if (mkdirRes.exitCode !== 0) {
              toolOutput = `Error creating directory for ${filePath}: ${mkdirRes.output}`;
            } else {
              const writeRes = await containerService.executeCommand(
                options.containerId,
                `echo '${base64Content}' | base64 -d > ${WORKSPACE_DIR}/${filePath}`,
                { timeoutMs: 15000 }
              );
              toolSpan.setAttribute('tool.exit_code', writeRes.exitCode);
              toolOutput = writeRes.exitCode === 0
                ? `Successfully wrote file ${filePath}`
                : `Error writing file ${filePath}: ${writeRes.output}`;
            }
          } else if (fnName === 'run_command') {
            toolSpan.setAttribute('tool.command', fnArgs.command || '');
            const cmdRes = await containerService.executeCommand(
              options.containerId,
              `cd ${WORKSPACE_DIR} && ${fnArgs.command}`,
              { timeoutMs: 30000, maxBufferBytes: 100000 }
            );
            toolSpan.setAttribute('tool.exit_code', cmdRes.exitCode);
            toolOutput = `Exit Code: ${cmdRes.exitCode}\nOutput:\n${cmdRes.output}`;
          } else {
            toolOutput = `Unknown tool "${fnName}"`;
          }

          toolSpan.end();

          // Append tool execution result message
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolOutput,
          });
        }
      } else {
        // Final text summary from AI
        const finalContent = responseMessage.content || 'Execution completed.';
        console.log(`[Agent] Finished execution in ${turn} turns (${totalTokens} tokens).`);

        span.setAttribute('agent.turns_used', turn);
        span.setAttribute('agent.total_tokens', totalTokens);
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();

        return {
          response: finalContent,
          tokensUsed: totalTokens,
        };
      }
    }

    span.setAttribute('agent.turns_used', maxTurns);
    span.setAttribute('agent.total_tokens', totalTokens);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return {
      response: `Agent reached maximum turn limit (${maxTurns} turns) without explicit completion summary.`,
      tokensUsed: totalTokens,
    };
  } catch (error: any) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message || String(error),
    });
    span.end();
    throw error;
  }
};
