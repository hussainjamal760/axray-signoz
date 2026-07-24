import { Groq } from 'groq-sdk';
import * as containerService from './container.service';
import { tracer } from '../lib/telemetry';
import { AXRAY_ATTRIBUTES } from '../lib/telemetry-attributes';
import { SpanStatusCode } from '@opentelemetry/api';
import { emitLiveEvent } from '../sockets/socket.emitter';
import { appendTerminalLine } from './terminal-logger.service';

/**
 * Agent Service
 * Dedicated AI execution engine using Groq LLM function calling.
 * Pure service: Accepts containerId, runId, sessionId and prompt. Routes tool calls via containerService.
 * Emits live Socket.IO events for LLM requests and tool calls.
 */

const WORKSPACE_DIR = '/workspace';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_TURNS = 15;

export interface AgentExecutionOptions {
  containerId: string;
  prompt: string;
  runId?: string;
  sessionId?: string;
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
      name: 'search_files',
      description: 'Search for a text pattern or symbol in workspace files. Automatically excludes heavy directories like node_modules and .git.',
      parameters: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'The search string or pattern to look for in workspace files',
          },
          path: {
            type: 'string',
            description: 'Optional subfolder path relative to /workspace to restrict search, e.g. "src"',
          },
        },
        required: ['pattern'],
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

STRICT WORKSPACE RULES:
0. You must always respond with exactly one tool call. Never respond with plain text, explanations, or reasoning outside of a tool call. If you need to think before acting, use the tool call itself (e.g. read_file or search_files) as your next action.
1. All commands execute strictly within /workspace.
2. ALWAYS inspect the workspace first using run_command (e.g. "ls -la") or read_file.
3. When searching for code patterns or symbols, ALWAYS prefer the dedicated tool "search_files(pattern, path)" instead of running shell grep.
4. Use read_file to view file contents (bounded to 500 lines) and write_file to edit files safely. Do NOT write shell heredoc patches.
5. Use run_command to run test suites, build commands, or shell utilities.
6. When finished or satisfied with results, respond directly with a concise text response summarizing your actions. Do not invoke tools after completing your objective.`;

export const executePrompt = async (
  options: AgentExecutionOptions
): Promise<AgentExecutionResult> => {
  const sessionId = options.sessionId;
  const runId = options.runId;

  const span = tracer.startSpan('agent.execute', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: options.runId || '',
      [AXRAY_ATTRIBUTES.SESSION_ID]: options.sessionId || '',
      [AXRAY_ATTRIBUTES.PHASE]: 'agent',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'agent.execute',
      [AXRAY_ATTRIBUTES.CONTAINER_ID]: options.containerId,
      [AXRAY_ATTRIBUTES.AGENT_MODEL]: DEFAULT_GROQ_MODEL,
      'prompt.length': options.prompt.length,
    },
  });

  console.log(`[Agent] Starting Groq execution loop for runId=${options.runId || 'N/A'} in container ${options.containerId}`);

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.warn(`[Agent Warning] GROQ_API_KEY missing. Returning fallback simulation.`);
    if (sessionId && runId) {
      appendTerminalLine(sessionId, runId, 'error', 'GROQ_API_KEY missing. Unable to run live LLM agent.');
    }
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
  const executedToolsCache = new Map<string, { output: string; exitCode: number }>();

  try {
    while (turn < maxTurns) {
      turn++;
      console.log(`[Agent Turn ${turn}/${maxTurns}] Querying Groq (${DEFAULT_GROQ_MODEL})...`);

      if (sessionId) {
        emitLiveEvent(sessionId, {
          sessionId,
          runId,
          timestamp: new Date().toISOString(),
          eventType: 'llm.request.started',
          phase: 'llm',
          status: 'running',
          title: `LLM Turn ${turn}`,
          description: DEFAULT_GROQ_MODEL,
          metadata: { turn, model: DEFAULT_GROQ_MODEL },
        });
      }

      const llmSpan = tracer.startSpan('llm.request', {
        attributes: {
          [AXRAY_ATTRIBUTES.RUN_ID]: options.runId || '',
          [AXRAY_ATTRIBUTES.SESSION_ID]: options.sessionId || '',
          [AXRAY_ATTRIBUTES.PHASE]: 'llm',
          [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'llm.request',
          [AXRAY_ATTRIBUTES.AGENT_TURN]: turn,
          [AXRAY_ATTRIBUTES.AGENT_MODEL]: DEFAULT_GROQ_MODEL,
          [AXRAY_ATTRIBUTES.GEN_AI_SYSTEM]: 'groq',
          [AXRAY_ATTRIBUTES.GEN_AI_MODEL]: DEFAULT_GROQ_MODEL,
        },
      });

      let completion: any;
      let pTokens = 0;
      let cTokens = 0;
      let tTokens = 0;

      try {
        const fetchCompletion = async (overrideToolChoice?: any) => {
          return await groq.chat.completions.create({
            model: DEFAULT_GROQ_MODEL,
            messages,
            tools: TOOL_DECLARATIONS,
            tool_choice: overrideToolChoice || 'required',
            temperature: 0.2,
          });
        };

        try {
          completion = await fetchCompletion('required');
        } catch (initialErr: any) {
          const isParseError =
            initialErr?.error?.code === 'output_parse_failed' ||
            initialErr?.code === 'output_parse_failed' ||
            (typeof initialErr?.message === 'string' && initialErr.message.includes('output_parse_failed'));

          if (isParseError) {
            console.warn(`[Agent Turn ${turn}/${maxTurns}] output_parse_failed detected, retrying with correction...`);
            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, 'agent', `[Turn ${turn}] output_parse_failed detected. Retrying with correction...`);
            }
            const failedGen = initialErr?.error?.failed_generation || initialErr?.failed_generation || '';
            const feedback = `Your previous response was not a valid tool call${failedGen ? ` (failed generation: "${failedGen}")` : ''}. You must respond with exactly one tool call and nothing else. Try again.`;

            messages.push({
              role: 'user',
              content: feedback,
            });

            // Retry once with tool_choice forced to 'required'
            completion = await fetchCompletion('required');
          } else {
            throw initialErr;
          }
        }

        if (completion.usage) {
          pTokens = completion.usage.prompt_tokens || 0;
          cTokens = completion.usage.completion_tokens || 0;
          tTokens = completion.usage.total_tokens || (pTokens + cTokens);
          totalTokens += tTokens;

          llmSpan.setAttribute(AXRAY_ATTRIBUTES.GEN_AI_INPUT_TOKENS, pTokens);
          llmSpan.setAttribute(AXRAY_ATTRIBUTES.GEN_AI_OUTPUT_TOKENS, cTokens);
          llmSpan.setAttribute(AXRAY_ATTRIBUTES.GEN_AI_TOTAL_TOKENS, tTokens);
        }

        llmSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (llmErr: any) {
        llmSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: llmErr?.message || String(llmErr),
        });
        llmSpan.end();
        throw llmErr;
      }
      llmSpan.end();

      if (sessionId) {
        emitLiveEvent(sessionId, {
          sessionId,
          runId,
          timestamp: new Date().toISOString(),
          eventType: 'llm.request.completed',
          phase: 'llm',
          status: 'completed',
          title: `LLM Turn ${turn}`,
          description: DEFAULT_GROQ_MODEL,
          metadata: {
            turn,
            model: DEFAULT_GROQ_MODEL,
            inputTokens: pTokens,
            outputTokens: cTokens,
            totalTokens: tTokens,
          },
        });
      }

      const responseMessage = completion.choices[0]?.message;
      if (!responseMessage) {
        throw new Error('Groq returned empty response message');
      }

      // Sanitize responseMessage for messages history (strip heavy write_file content)
      const sanitizedResponseMessage = JSON.parse(JSON.stringify(responseMessage));
      if (sanitizedResponseMessage.tool_calls) {
        for (const tc of sanitizedResponseMessage.tool_calls) {
          if (tc.function?.name === 'write_file') {
            try {
              const parsedArgs = JSON.parse(tc.function.arguments || '{}');
              if (parsedArgs.content) {
                parsedArgs.content = '<content written, see file on disk>';
                tc.function.arguments = JSON.stringify(parsedArgs);
              }
            } catch {}
          }
        }
      }

      // Append sanitized response to messages array
      messages.push(sanitizedResponseMessage);

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

          if (sessionId) {
            emitLiveEvent(sessionId, {
              sessionId,
              runId,
              timestamp: new Date().toISOString(),
              eventType: 'tool.started',
              phase: 'tool',
              status: 'running',
              title: `Tool: ${fnName}`,
              description: fnArgs.path || fnArgs.command || fnArgs.pattern || fnName,
              metadata: {
                toolName: fnName,
                filePath: fnArgs.path,
                commandSummary: fnArgs.command || fnArgs.pattern,
              },
            });
          }

          const toolSpan = tracer.startSpan('tool.execute', {
            attributes: {
              [AXRAY_ATTRIBUTES.RUN_ID]: options.runId || '',
              [AXRAY_ATTRIBUTES.SESSION_ID]: options.sessionId || '',
              [AXRAY_ATTRIBUTES.PHASE]: 'tool',
              [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'tool.execute',
              [AXRAY_ATTRIBUTES.TOOL_NAME]: fnName,
              [AXRAY_ATTRIBUTES.CONTAINER_ID]: options.containerId,
            },
          });

          let toolOutput = '';
          let exitCode = 0;

          const cacheKey = `${fnName}:${JSON.stringify(fnArgs)}`;
          let isCached = false;

          if (executedToolsCache.has(cacheKey)) {
            const cached = executedToolsCache.get(cacheKey)!;
            isCached = true;
            exitCode = cached.exitCode;
            toolOutput = `[Cached result - identical call already executed this run]\n${cached.output}`;
            console.log(`[Agent Tool Cache Hit] Function: "${fnName}", Args:`, fnArgs);
            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, 'agent', `[Cached Result] ${fnName}(${fnArgs.path || fnArgs.command || fnArgs.pattern || ''})`);
            }
          } else if (fnName === 'read_file') {
            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, 'agent', `Reading file ${fnArgs.path}...`);
            }
            toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_PATH, fnArgs.path || '');
            const readRes = await containerService.executeCommand(
              options.containerId,
              `head -n 100 ${WORKSPACE_DIR}/${fnArgs.path}`,
              { timeoutMs: 15000, maxBufferBytes: 100000 }
            );
            exitCode = readRes.exitCode;
            toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_EXIT_CODE, exitCode);
            if (exitCode === 0) {
              toolOutput = readRes.output;
              if (sessionId && runId) {
                appendTerminalLine(sessionId, runId, 'stdout', readRes.output);
              }
            } else {
              toolOutput = `Error reading file ${fnArgs.path}: ${readRes.output}`;
              if (sessionId && runId) {
                appendTerminalLine(sessionId, runId, 'stderr', toolOutput);
                appendTerminalLine(sessionId, runId, 'error', `Exit Code: ${exitCode}`);
              }
            }
          } else if (fnName === 'write_file') {
            const filePath = fnArgs.path || '';
            const content = fnArgs.content || '';
            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, 'agent', `Writing file ${filePath}...`);
            }
            toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_PATH, filePath);
            const base64Content = Buffer.from(content, 'utf8').toString('base64');
            const mkdirRes = await containerService.executeCommand(
              options.containerId,
              `mkdir -p $(dirname ${WORKSPACE_DIR}/${filePath})`
            );
            if (mkdirRes.exitCode !== 0) {
              toolOutput = `Error creating directory for ${filePath}: ${mkdirRes.output}`;
              exitCode = mkdirRes.exitCode;
              if (sessionId && runId) {
                appendTerminalLine(sessionId, runId, 'stderr', toolOutput);
                appendTerminalLine(sessionId, runId, 'error', `Exit Code: ${exitCode}`);
              }
            } else {
              const writeRes = await containerService.executeCommand(
                options.containerId,
                `echo '${base64Content}' | base64 -d > ${WORKSPACE_DIR}/${filePath}`,
                { timeoutMs: 15000 }
              );
              exitCode = writeRes.exitCode;
              toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_EXIT_CODE, exitCode);
              if (exitCode === 0) {
                toolOutput = `Successfully wrote file ${filePath}`;
                if (sessionId && runId) {
                  appendTerminalLine(sessionId, runId, 'success', toolOutput);
                }
              } else {
                toolOutput = `Error writing file ${filePath}: ${writeRes.output}`;
                if (sessionId && runId) {
                  appendTerminalLine(sessionId, runId, 'stderr', toolOutput);
                  appendTerminalLine(sessionId, runId, 'error', `Exit Code: ${exitCode}`);
                }
              }
            }
          } else if (fnName === 'search_files') {
            const pattern = fnArgs.pattern || '';
            const targetSubPath = fnArgs.path ? `${WORKSPACE_DIR}/${fnArgs.path}` : WORKSPACE_DIR;
            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, 'agent', `Searching files for pattern "${pattern}"...`);
            }
            toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_COMMAND, `search_files ${pattern}`);
            const searchRes = await containerService.executeCommand(
              options.containerId,
              `cd ${WORKSPACE_DIR} && grep -rn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.next "${pattern}" ${targetSubPath}`,
              { timeoutMs: 25000, maxBufferBytes: 100000 }
            );
            exitCode = searchRes.exitCode;
            toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_EXIT_CODE, exitCode);
            toolOutput = searchRes.output || `No occurrences of "${pattern}" found.`;

            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, exitCode === 0 ? 'stdout' : 'stderr', toolOutput);
            }
          } else if (fnName === 'run_command') {
            const command = fnArgs.command || '';
            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, 'command', command);
            }
            toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_COMMAND, command);
            const cmdRes = await containerService.executeCommand(
              options.containerId,
              `cd ${WORKSPACE_DIR} && ${command}`
            );
            exitCode = cmdRes.exitCode;
            toolSpan.setAttribute(AXRAY_ATTRIBUTES.TOOL_EXIT_CODE, exitCode);
            toolOutput = `Exit Code: ${exitCode}\nOutput:\n${cmdRes.output}`;

            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, exitCode === 0 ? 'stdout' : 'stderr', cmdRes.output);
              appendTerminalLine(sessionId, runId, exitCode === 0 ? 'success' : 'error', `Exit Code: ${exitCode}`);
            }
          } else {
            toolOutput = `Unknown tool "${fnName}"`;
            exitCode = 1;
            if (sessionId && runId) {
              appendTerminalLine(sessionId, runId, 'error', toolOutput);
            }
          }

          toolSpan.setStatus({ code: SpanStatusCode.OK });
          toolSpan.end();

          if (sessionId) {
            emitLiveEvent(sessionId, {
              sessionId,
              runId,
              timestamp: new Date().toISOString(),
              eventType: 'tool.completed',
              phase: 'tool',
              status: exitCode === 0 ? 'completed' : 'failed',
              title: `Tool: ${fnName}`,
              description: fnArgs.path || fnArgs.command || fnArgs.pattern || fnName,
              metadata: {
                toolName: fnName,
                filePath: fnArgs.path,
                commandSummary: fnArgs.command || fnArgs.pattern,
                exitCode,
              },
            });
          }

          // Truncate tool output for LLM message history (4,000 char max limit)
          const MAX_TOOL_OUTPUT_CHARS = 4000;
          let llmToolOutput = toolOutput;
          if (llmToolOutput.length > MAX_TOOL_OUTPUT_CHARS) {
            const originalLen = llmToolOutput.length;
            llmToolOutput =
              llmToolOutput.substring(0, MAX_TOOL_OUTPUT_CHARS) +
              `\n[...output truncated, ${originalLen} total characters. Refine your search/command if you need more.]`;
          }

          if (!isCached) {
            executedToolsCache.set(cacheKey, { output: llmToolOutput, exitCode });
          }

          // Tool resilience: Always pass tool output back to model (even on non-zero exit codes/timeouts)
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: llmToolOutput,
          });
        }
      } else {
        // Final text summary from AI
        const finalContent = responseMessage.content || 'Execution completed.';
        console.log(`[Agent] Finished execution in ${turn} turns (${totalTokens} tokens).`);

        if (sessionId && runId) {
          appendTerminalLine(sessionId, runId, 'agent', `Finished task execution in ${turn} turns.`);
        }

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
