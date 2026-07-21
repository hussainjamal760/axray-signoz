import express, { Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';

import { config } from './config';
import { sessionMiddleware } from './middlewares/session.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './routes/auth.routes';
import { githubRouter } from './routes/github.routes';
import { sessionsRouter } from './routes/sessions.routes';
import { agentRunsRouter } from './routes/agent-runs.routes';
import { signozRouter } from './routes/signoz.routes';

const app = express();

// Set up CORS
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(sessionMiddleware);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// App routes
app.use('/api/auth', authRouter);
app.use('/api/github', githubRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/runs', agentRunsRouter);
app.use('/api/signoz', signozRouter);

// Global Error Handler (must be registered last)
app.use(errorMiddleware);

export { app };
