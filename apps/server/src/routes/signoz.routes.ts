import { Router } from 'express';
import { getSigNozLogs, getSigNozTraces } from '../controllers/signoz.controller';

export const signozRouter = Router();

// /api/signoz/logs
signozRouter.get('/logs', getSigNozLogs);

// /api/signoz/traces
signozRouter.get('/traces', getSigNozTraces);
