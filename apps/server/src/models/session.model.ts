import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'active' | 'archived';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
  status: SessionStatus;
  currentRunId?: mongoose.Types.ObjectId;
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
    currentRunId: { type: Schema.Types.ObjectId, ref: 'AgentRun' },
  },
  {
    timestamps: true,
  }
);

// Optimize session lists lookup
SessionSchema.index({ userId: 1, createdAt: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
