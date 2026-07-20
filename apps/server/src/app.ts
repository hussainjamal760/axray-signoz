import express, { Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';

import { config } from './config';
import { sessionMiddleware } from './middlewares/session.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import authRouter from './routes/auth.routes';

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

// Global Error Handler (must be registered last)
app.use(errorMiddleware);

export { app };
