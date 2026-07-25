import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateAgentRunSchema } from '../schemas/sessions.schema';
import { getRunById, updateRun, getRunTimeline, getRunLogs, getSpanLogs, getAnomalies } from '../controllers/agent-runs.controller';

const router = Router();

router.get('/:runId/timeline', getRunTimeline);
router.get('/:runId/logs', getRunLogs);
router.get('/:id/logs/span/:spanId', getSpanLogs);
router.get('/:id/anomalies', getAnomalies);
router.get('/:id', requireAuth, getRunById);
router.patch('/:id', requireAuth, validate(updateAgentRunSchema), updateRun);

export const agentRunsRouter = router;
