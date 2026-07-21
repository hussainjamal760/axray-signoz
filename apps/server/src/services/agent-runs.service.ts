import mongoose from 'mongoose';
import { AgentRun, IAgentRun } from '../models/agent-run.model';
import { getSession } from './sessions.service';
import { Session } from '../models/session.model';
import { AppError } from '../errors/AppError';
import * as runnerService from './runner.service';

export const createRun = async (
  userId: string,
  sessionId: string,
  prompt: string
): Promise<IAgentRun> => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new AppError(400, 'Invalid Session ID format');
  }
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
    { $set: { latestRunId: savedRun._id } }
  );

  // Trigger fire-and-forget background execution
  void runnerService.executeRun(savedRun._id.toString());

  return savedRun;
};

export const getRunsForSession = async (
  userId: string,
  sessionId: string
): Promise<IAgentRun[]> => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new AppError(400, 'Invalid Session ID format');
  }
  await getSession(userId, sessionId);
  return AgentRun.find({ sessionId }).sort({ createdAt: -1 });
};

export const getRun = async (userId: string, runId: string): Promise<IAgentRun> => {
  if (!mongoose.Types.ObjectId.isValid(runId)) {
    throw new AppError(400, 'Invalid Run ID format');
  }
  const run = await AgentRun.findById(runId);
  if (!run) {
    throw new AppError(404, 'Agent run not found');
  }
  await getSession(userId, run.sessionId.toString());
  return run;
};

export const updateRunStatus = async (
  userId: string,
  runId: string,
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
): Promise<IAgentRun> => {
  const run = await getRun(userId, runId);
  run.status = status;
  if (status === 'running' && !run.startedAt) {
    run.startedAt = new Date();
  }
  if (
    (status === 'completed' || status === 'failed' || status === 'cancelled') &&
    !run.completedAt
  ) {
    run.completedAt = new Date();
    if (run.startedAt) {
      run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    }
  }
  return run.save();
};
