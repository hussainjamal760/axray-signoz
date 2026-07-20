import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getRepos, getBranches, createBranch } from '../controllers/github.controller';

const router = Router();

router.get('/repos', requireAuth, getRepos);
router.get('/repos/:owner/:repo/branches', requireAuth, getBranches);
router.post('/repos/:owner/:repo/branches', requireAuth, createBranch);

export const githubRouter = router;
