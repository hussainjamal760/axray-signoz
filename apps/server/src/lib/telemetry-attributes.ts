/**
 * Centralized OpenTelemetry Semantic Attribute Keys for AXRAY
 * Establishes consistent telemetry attribute conventions across sessions, workspaces, agent turns, tools, and SigNoz queries.
 */

export const AXRAY_ATTRIBUTES = {
  // Core Identifiers
  SESSION_ID: 'axray.session.id',
  RUN_ID: 'axray.run.id',
  PHASE: 'axray.phase',
  EVENT_TYPE: 'axray.event.type',
  IS_INITIAL_SETUP: 'axray.is_initial_setup',
  RUN_STATUS: 'axray.run.status',

  // Workspace & Infrastructure Metadata
  REPOSITORY: 'axray.repository',
  BRANCH: 'axray.branch',
  RUNTIME: 'axray.runtime',
  RUNTIME_VERSION: 'axray.runtime.version',
  RUNTIME_IMAGE: 'axray.runtime.image',
  CONTAINER_ID: 'container.id',

  // Agent & LLM Execution Metadata
  AGENT_MODEL: 'axray.agent.model',
  AGENT_TURN: 'axray.agent.turn',
  AGENT_MAX_TURNS: 'axray.agent.max_turns',

  // Tool Execution Metadata
  TOOL_NAME: 'axray.tool.name',
  TOOL_PATH: 'axray.tool.path',
  TOOL_COMMAND: 'axray.tool.command',
  TOOL_EXIT_CODE: 'axray.tool.exit_code',

  // OpenTelemetry GenAI Semantic Conventions
  GEN_AI_SYSTEM: 'gen_ai.system',
  GEN_AI_MODEL: 'gen_ai.request.model',
  GEN_AI_INPUT_TOKENS: 'gen_ai.usage.input_tokens',
  GEN_AI_OUTPUT_TOKENS: 'gen_ai.usage.output_tokens',
  GEN_AI_TOTAL_TOKENS: 'gen_ai.usage.total_tokens',

  // Git Diff Statistics
  GIT_FILES_CHANGED: 'axray.git.files_changed',
  GIT_INSERTIONS: 'axray.git.insertions',
  GIT_DELETIONS: 'axray.git.deletions',
  GIT_DIFF_TRUNCATED: 'axray.git.diff_truncated',
} as const;

export type AxrayPhase =
  | 'setup'
  | 'workspace'
  | 'agent'
  | 'llm'
  | 'tool'
  | 'git'
  | 'completion'
  | 'error';
