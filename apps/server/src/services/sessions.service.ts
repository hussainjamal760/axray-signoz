import mongoose from 'mongoose';
import { Session, ISession } from '../models/session.model';
import { AgentRun } from '../models/agent-run.model';
import { AppError } from '../errors/AppError';
import * as provisionerService from './provisioner.service';

export const createSession = async (
  userId: string,
  data: {
    repositoryId: number;
    repositoryFullName: string;
    branch: string;
  }
): Promise<ISession> => {
  const session = new Session({
    userId,
    ...data,
    status: 'active',
    workspaceInitialized: false,
  });

  const savedSession = await session.save();

  try {
    // Delegate infrastructure setup to provisionerService
    const provisionResult = await provisionerService.provisionSessionInfrastructure({
      repositoryFullName: savedSession.repositoryFullName,
      branch: savedSession.branch,
    });

    savedSession.containerId = provisionResult.containerId;
    savedSession.containerStatus = provisionResult.containerStatus;
    return await savedSession.save();
  } catch (error: unknown) {
    // Rollback session document if container provisioning fails
    await Session.deleteOne({ _id: savedSession._id });
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(500, `Failed to provision session infrastructure: ${message}`);
  }
};

export const getUserSessions = async (userId: string): Promise<ISession[]> => {
  return Session.find({ userId }).populate('latestRunId').sort({ createdAt: -1 });
};

export const getSession = async (userId: string, sessionId: string): Promise<ISession> => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new AppError(400, 'Invalid Session ID format');
  }
  const session = await Session.findById(sessionId).populate('latestRunId');
  if (!session || session.userId.toString() !== userId) {
    throw new AppError(404, 'Session not found');
  }
  return session;
};

export const updateSessionStatus = async (
  userId: string,
  sessionId: string,
  status: 'active' | 'archived'
): Promise<ISession> => {
  const session = await getSession(userId, sessionId);
  session.status = status;
  return session.save();
};

export const deleteSession = async (userId: string, sessionId: string): Promise<void> => {
  const session = await getSession(userId, sessionId);
  // Remove all related runs first
  await AgentRun.deleteMany({ sessionId: session._id });
  // Remove session
  await Session.deleteOne({ _id: session._id });
};
