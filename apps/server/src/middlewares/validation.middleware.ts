import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';

export const validate = (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues.map((e: any) => e.message).join(', ') });
    return;
  }
  req.body = result.data;
  next();
};
