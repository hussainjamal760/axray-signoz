import { Request, Response, NextFunction } from 'express';
import * as agentRunsService from '../services/agent-runs.service';
import * as signozTimelineService from '../services/signoz-timeline.service';
import { AppError } from '../errors/AppError';
import { AgentRun } from '../models/agent-run.model';

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

export const getSpanLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { spanId } = req.params;
    const logs = await signozTimelineService.fetchSigNozLogsForSpanId(spanId);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

export const getAnomalies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: runId } = req.params;
    
    // Check MongoDB for actual run data to find anomalies
    const run = await AgentRun.findById(runId);
    if (!run) {
      res.status(404).json({ success: false, error: 'Run not found' });
      return;
    }

    const anomalies = [];

    // 1. Cost Anomaly
    if (run.cost && run.cost > 0.01) {
      anomalies.push({
        id: `cost-${run.id}`,
        type: 'COST_SPIKE',
        title: 'High Cost Detected',
        description: `This session consumed $${run.cost.toFixed(4)}, exceeding the $0.01 threshold.`,
        severity: 'high',
        timestamp: run.updatedAt
      });
    }

    // 2. Token Anomaly
    if (run.tokensUsed && run.tokensUsed > 10000) {
      anomalies.push({
        id: `token-${run.id}`,
        type: 'TOKEN_SPIKE',
        title: 'Massive Token Usage',
        description: `This session consumed ${run.tokensUsed.toLocaleString()} tokens, exceeding the 10,000 threshold.`,
        severity: 'medium',
        timestamp: run.updatedAt
      });
    }

    // 3. Status Anomaly
    if (run.status === 'failed') {
      anomalies.push({
        id: `status-${run.id}`,
        type: 'EXECUTION_FAILURE',
        title: 'Execution Failed',
        description: `The agent execution failed with an error. Check traces and logs for details.`,
        severity: 'critical',
        timestamp: run.updatedAt
      });
    }

    res.json({ success: true, count: anomalies.length, anomalies });
  } catch (error) {
    next(error);
  }
};

export const getSessionToolPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      throw new AppError(400, 'Session ID is required');
    }

    const { fetchToolPerformanceFromClickHouse } = await import('../services/signoz-timeline.service');
    const tools = await fetchToolPerformanceFromClickHouse(sessionId);

    res.json({ success: true, tools });
  } catch (error) {
    next(error);
  }
};

