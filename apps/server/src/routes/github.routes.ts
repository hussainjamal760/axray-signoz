import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createBranchSchema } from '../schemas/github.schema';
import { getRepos, getBranches, createBranch } from '../controllers/github.controller';

const router = Router();

router.get('/repos', requireAuth, getRepos);
router.get('/repos/:owner/:repo/branches', requireAuth, getBranches);
router.post('/repos/:owner/:repo/branches', requireAuth, validate(createBranchSchema), createBranch);

export const githubRouter = router;
