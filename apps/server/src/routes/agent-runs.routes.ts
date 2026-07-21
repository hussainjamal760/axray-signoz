import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getRunById } from '../controllers/agent-runs.controller';

const router = Router();

router.get('/:id', requireAuth, getRunById);

export const agentRunsRouter = router;
