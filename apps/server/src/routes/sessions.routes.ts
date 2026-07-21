import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createSessionSchema, updateSessionSchema, createAgentRunSchema } from '../schemas/sessions.schema';
import { createSession, listUserSessions, getSessionById, updateSession, deleteSession } from '../controllers/sessions.controller';
import { createRun, listRunsForSession } from '../controllers/agent-runs.controller';

const router = Router();

router.post('/', requireAuth, validate(createSessionSchema), createSession);
router.get('/', requireAuth, listUserSessions);
router.get('/:id', requireAuth, getSessionById);
router.patch('/:id', requireAuth, validate(updateSessionSchema), updateSession);
router.delete('/:id', requireAuth, deleteSession);

// Nested Agent Runs
router.post('/:sessionId/runs', requireAuth, validate(createAgentRunSchema), createRun);
router.get('/:sessionId/runs', requireAuth, listRunsForSession);

export const sessionsRouter = router;
