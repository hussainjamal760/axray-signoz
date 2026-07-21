import { AgentRun, IAgentRun } from '../models/agent-run.model';
import { getSession } from './sessions.service';
import { Session } from '../models/session.model';
import { AppError } from '../errors/AppError';

export const createRun = async (
  userId: string,
  sessionId: string,
  prompt: string
): Promise<IAgentRun> => {
  const session = await getSession(userId, sessionId);

  const run = new AgentRun({
    sessionId,
    prompt,
    status: 'pending',
  });

  const savedRun = await run.save();

  // Atomically update the Session's current active run mapping
  await Session.updateOne(
    { _id: session._id },
    { $set: { currentRunId: savedRun._id } }
  );

  return savedRun;
};

export const getRunsForSession = async (
  userId: string,
  sessionId: string
): Promise<IAgentRun[]> => {
  await getSession(userId, sessionId);
  return AgentRun.find({ sessionId }).sort({ createdAt: -1 });
};

export const getRun = async (userId: string, runId: string): Promise<IAgentRun> => {
  const run = await AgentRun.findById(runId);
  if (!run) {
    throw new AppError(404, 'Agent run not found');
  }
  await getSession(userId, run.sessionId.toString());
  return run;
};
