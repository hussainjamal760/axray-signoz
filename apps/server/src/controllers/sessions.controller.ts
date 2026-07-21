import { Request, Response, NextFunction } from 'express';
import { Session } from '../models/session.model';
import { AppError } from '../errors/AppError';

export const listSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

    res.json(
      sessions.map((s) => ({
        id: s._id.toString(),
        repositoryId: s.repositoryId,
        repositoryFullName: s.repositoryFullName,
        owner: s.owner,
        branchName: s.branchName,
        prompt: s.prompt,
        status: s.status,
        agentId: s.agentId,
        containerId: s.containerId,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const getSessionDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const session = await Session.findOne({ _id: id, userId });
    if (!session) {
      throw new AppError(404, 'Session not found');
    }

    res.json({
      id: session._id.toString(),
      repositoryId: session.repositoryId,
      repositoryFullName: session.repositoryFullName,
      owner: session.owner,
      branchName: session.branchName,
      prompt: session.prompt,
      status: session.status,
      agentId: session.agentId,
      containerId: session.containerId,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { repositoryId, repositoryFullName, owner, branchName, prompt } = req.body;

    if (!repositoryId || !repositoryFullName || !owner || !branchName || !prompt) {
      throw new AppError(400, 'Missing required session parameters');
    }

    const newSession = new Session({
      userId,
      repositoryId,
      repositoryFullName,
      owner,
      branchName,
      prompt,
      status: 'pending',
    });

    await newSession.save();

    res.status(201).json({
      id: newSession._id.toString(),
      repositoryId: newSession.repositoryId,
      repositoryFullName: newSession.repositoryFullName,
      owner: newSession.owner,
      branchName: newSession.branchName,
      prompt: newSession.prompt,
      status: newSession.status,
      agentId: newSession.agentId,
      containerId: newSession.containerId,
      createdAt: newSession.createdAt.toISOString(),
      updatedAt: newSession.updatedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
