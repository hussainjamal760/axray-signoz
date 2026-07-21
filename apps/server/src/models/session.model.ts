import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'active' | 'archived';
export type ContainerStatus = 'creating' | 'running' | 'stopped' | 'failed';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
  status: SessionStatus;
  containerId?: string;
  containerStatus?: ContainerStatus;
  workspaceInitialized: boolean;
  latestRunId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
    latestRunId: { type: Schema.Types.ObjectId, ref: 'AgentRun' },
  },
  {
    timestamps: true,
  }
);

// Optimize session lists lookup
SessionSchema.index({ userId: 1, createdAt: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
