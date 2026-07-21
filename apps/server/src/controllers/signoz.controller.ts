import { Request, Response } from 'express';
import { signozService } from '../services/signoz.service';

export const getSigNozLogs = async (req: Request, res: Response) => {
  console.log("[SigNoz Controller] Fetching Logs...");
  const data = await signozService.executeQuery("logs");
  res.json({ success: true, data });
};

export const getSigNozTraces = async (req: Request, res: Response) => {
  console.log("[SigNoz Controller] Fetching Traces...");
  const data = await signozService.executeQuery("traces");
  res.json({ success: true, data });
};
