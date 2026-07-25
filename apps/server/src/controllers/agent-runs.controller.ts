import { Request, Response, NextFunction } from 'express';
import * as agentRunsService from '../services/agent-runs.service';
import * as signozTimelineService from '../services/signoz-timeline.service';
import { AppError } from '../errors/AppError';

export const createRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { sessionId } = req.params;
    const { prompt } = req.body;

    const accessToken = req.session?.githubAccessToken;
    const run = await agentRunsService.createRun(userId, sessionId, prompt, accessToken);
    res.status(202).json(run);
  } catch (error) {
    next(error);
  }
};

export const listRunsForSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { sessionId } = req.params;
    const runs = await agentRunsService.getRunsForSession(userId, sessionId);
    res.json(runs);
  } catch (error) {
    next(error);
  }
};

export const getRunById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { id } = req.params;
    const run = await agentRunsService.getRun(userId, id);
    res.json(run);
  } catch (error) {
    next(error);
  }
};

export const updateRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { id } = req.params;
    const { status } = req.body;

    const run = await agentRunsService.updateRunStatus(userId, id, status);
    res.json(run);
  } catch (error) {
    next(error);
  }
};

export const getRunTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { runId } = req.params;
    const timeline = await signozTimelineService.getTimelineForRun(runId);
    res.json(timeline);
  } catch (error) {
    next(error);
  }
};

export const getRunLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { runId } = req.params;
    const logs = await signozTimelineService.fetchSigNozLogsFromClickHouse(runId);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

