import { Request, Response, NextFunction } from 'express';
import {
  listUserRepositories,
  listRepositoryBranches,
  createRepositoryBranch,
} from '../services/github.service';
import { getGithubAccessToken } from '../lib/github';
import { createBranchSchema } from '../schemas/github.schema';

export const getRepos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = getGithubAccessToken(req);
    if (!accessToken) {
      res.status(401).json({ error: 'Unauthorized: Missing GitHub access token' });
      return;
    }

    const repos = await listUserRepositories(accessToken);
    res.json(repos);
  } catch (error) {
    next(error);
  }
};

export const getBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Missing owner or repo parameter' });
      return;
    }

    const accessToken = getGithubAccessToken(req);
    if (!accessToken) {
      res.status(401).json({ error: 'Unauthorized: Missing GitHub access token' });
      return;
    }

    const branches = await listRepositoryBranches(accessToken, owner, repo);
    res.json(branches);
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Missing owner or repo parameter' });
      return;
    }

    const accessToken = getGithubAccessToken(req);
    if (!accessToken) {
      res.status(401).json({ error: 'Unauthorized: Missing GitHub access token' });
      return;
    }

    const parseResult = createBranchSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { branchName } = parseResult.data;

    await createRepositoryBranch(accessToken, owner, repo, branchName);

    res.status(201).json({
      success: true,
      branch: branchName,
    });
  } catch (error) {
    next(error);
  }
};
