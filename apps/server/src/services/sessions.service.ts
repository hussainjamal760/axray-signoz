import { Session, ISession } from '../models/session.model';
import { AgentRun } from '../models/agent-run.model';
import { AppError } from '../errors/AppError';

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
  });
  return session.save();
};

export const getUserSessions = async (userId: string): Promise<ISession[]> => {
  return Session.find({ userId }).populate('currentRunId').sort({ createdAt: -1 });
};

export const getSession = async (userId: string, sessionId: string): Promise<ISession> => {
  const session = await Session.findById(sessionId).populate('currentRunId');
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
