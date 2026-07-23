import { Request, Response, NextFunction } from 'express';
import * as sessionsService from '../services/sessions.service';
import * as timelineService from '../services/timeline.service';
import { AppError } from '../errors/AppError';

export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { repositoryId, repositoryFullName, branch } = req.body;

    const session = await sessionsService.createSession(userId, {
      repositoryId,
      repositoryFullName,
      branch,
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const listUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const sessions = await sessionsService.getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { id } = req.params;
    const session = await sessionsService.getSession(userId, id);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { id } = req.params;
    const { status } = req.body;

    const session = await sessionsService.updateSessionStatus(userId, id, status);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { id } = req.params;
    await sessionsService.deleteSession(userId, id);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSessionTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const sessionId = req.params.sessionId || req.params.id;
    const timeline = await timelineService.getTimelineForSession(sessionId);
    res.json(timeline);
  } catch (error) {
    next(error);
  }
};
