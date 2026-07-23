import mongoose, { Schema, Document } from 'mongoose';

export type RunStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface IAgentRun extends Document {
  sessionId: mongoose.Types.ObjectId;
  prompt: string;
  status: RunStatus;
  response?: string;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  tokensUsed?: number;
  cost?: number;
  modelName?: string;
  errorMessage?: string;
  containerId?: string;
  worktreePath?: string;
  branchCommit?: string;
  diff?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
  diffTruncated?: boolean;
  diffSize?: number;
  changeSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentRunSchema: Schema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'queued', 'running', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    response: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    durationMs: { type: Number },
    tokensUsed: { type: Number },
    cost: { type: Number },
    modelName: { type: String },
    errorMessage: { type: String },
    containerId: { type: String },
    worktreePath: { type: String },
    branchCommit: { type: String },
    diff: { type: String },
    filesChanged: { type: [String] },
    insertions: { type: Number },
    deletions: { type: Number },
    diffTruncated: { type: Boolean, default: false },
    diffSize: { type: Number },
    changeSummary: { type: String },
  },
  {
    timestamps: true,
  }
);

// Optimize run queries per session
AgentRunSchema.index({ sessionId: 1, createdAt: -1 });

export const AgentRun = mongoose.model<IAgentRun>('AgentRun', AgentRunSchema);
