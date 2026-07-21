import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId: number;
  repositoryFullName: string;
  owner: string;
  branchName: string;
  prompt: string;
  status: SessionStatus;
  agentId?: string;
  containerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    repositoryId: { type: Number, required: true },
    repositoryFullName: { type: String, required: true },
    owner: { type: String, required: true },
    branchName: { type: String, required: true },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    agentId: { type: String },
    containerId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
