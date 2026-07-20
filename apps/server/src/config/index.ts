import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from the current working directory or system
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
  GITHUB_REDIRECT_URI: z.string().min(1, 'GITHUB_REDIRECT_URI is required'),
  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
