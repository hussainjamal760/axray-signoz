import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { createSession, listSessions, getSessionDetails } from '../controllers/sessions.controller';

const router = Router();

router.get('/', requireAuth, listSessions);
router.post('/', requireAuth, createSession);
router.get('/:id', requireAuth, getSessionDetails);

export const sessionsRouter = router;
