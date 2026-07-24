import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'active' | 'archived';
export type ContainerStatus = 'creating' | 'running' | 'stopped' | 'failed';
export type PullRequestStatus = 'creating' | 'open' | 'merged' | 'closed' | 'failed';

export interface IWorkspaceSpec {
  runtime: string;
  runtimeVersion: string;
  packageManager: string;
  installCommand: string;
  buildCommand?: string | null;
  runCommand?: string | null;
  testCommand?: string | null;
  reasoning: string;
}

export interface IPullRequest {
  provider: 'github';
  prNumber: number;
  prUrl: string;
  branchName: string;
  baseBranch: string;
  status: PullRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
  status: SessionStatus;
  containerId?: string;
  containerStatus?: ContainerStatus;
  workspaceInitialized: boolean;
  workspaceSpec?: IWorkspaceSpec;
  latestRunId?: mongoose.Types.ObjectId;
  pullRequest?: IPullRequest;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSpecSchema: Schema = new Schema(
  {
    runtime: { type: String, required: true },
    runtimeVersion: { type: String, required: true },
    packageManager: { type: String, required: true },
    installCommand: { type: String, required: true },
    buildCommand: { type: String },
    runCommand: { type: String },
    testCommand: { type: String },
    reasoning: { type: String, required: true },
  },
  { _id: false }
);

const PullRequestSchema: Schema = new Schema(
  {
    provider: { type: String, default: 'github', required: true },
    prNumber: { type: Number, required: true },
    prUrl: { type: String, required: true },
    branchName: { type: String, required: true },
    baseBranch: { type: String, required: true },
    status: {
      type: String,
      enum: ['creating', 'open', 'merged', 'closed', 'failed'],
      default: 'open',
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    repositoryId: { type: Number, required: true },
    repositoryFullName: { type: String, required: true },
    branch: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    containerId: { type: String },
    containerStatus: {
      type: String,
      enum: ['creating', 'running', 'stopped', 'failed'],
      default: 'creating',
    },
    workspaceInitialized: { type: Boolean, default: false, required: true },
    workspaceSpec: { type: WorkspaceSpecSchema },
    latestRunId: { type: Schema.Types.ObjectId, ref: 'AgentRun' },
    pullRequest: { type: PullRequestSchema },
  },
  {
    timestamps: true,
  }
);

// Optimize session lists lookup
SessionSchema.index({ userId: 1, createdAt: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
