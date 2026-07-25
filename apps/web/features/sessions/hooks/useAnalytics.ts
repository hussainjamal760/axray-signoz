"use client";

import { useMemo } from "react";
import { AgentRunSummary } from "@/features/agent-runs/types";

export interface DailyBucket {
  date: string;      // "Jul 20" format
  isoDate: string;   // ISO date key for sorting
  success: number;
  failed: number;
  total: number;
  cost: number;      // total $ cost that day
  tokens: number;    // total tokens that day
}

export interface FailureCategory {
  name: string;
  count: number;
}

export interface AnalyticsMetrics {
  totalRuns: number;
  successCount: number;
  failedCount: number;
  cancelledCount: number;
  successRate: number;         // 0-100
  avgDurationMs: number;
  avgTokens: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRun: number;
  dailyBuckets: DailyBucket[];
  failureCategories: FailureCategory[];
  mostCommonFailure: string;
  avgDurationLabel: string;    // human readable "4.2s"
  lastRunAt: string | null;
  modelsUsed: { name: string; count: number }[];
}

function categorizeError(msg: string | undefined): string {
  if (!msg) return "Unknown";
  const lower = msg.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("429") || lower.includes("quota")) return "Rate Limit";
  if (lower.includes("timeout") || lower.includes("timed out")) return "Timeout";
  if (lower.includes("parse") || lower.includes("json") || lower.includes("syntax")) return "Parse Error";
  if (lower.includes("enoent") || lower.includes("not found") || lower.includes("no such file")) return "File Not Found";
  if (lower.includes("network") || lower.includes("econnreset") || lower.includes("fetch")) return "Network Error";
  if (lower.includes("context") || lower.includes("token limit") || lower.includes("length")) return "Context Overflow";
  return "Logic Error";
}

function formatDuration(ms: number): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function toDateKey(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toISOString().split("T")[0];
  } catch {
    return isoStr;
  }
}

function toDisplayDate(isoKey: string): string {
  try {
    const d = new Date(isoKey + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return isoKey;
  }
}

export function useAnalytics(runs: AgentRunSummary[]): AnalyticsMetrics {
  return useMemo(() => {
    const totalRuns = runs.length;

    if (totalRuns === 0) {
      return {
        totalRuns: 0, successCount: 0, failedCount: 0, cancelledCount: 0,
        successRate: 0, avgDurationMs: 0, avgTokens: 0, totalTokens: 0,
        totalCost: 0, avgCostPerRun: 0, dailyBuckets: [], failureCategories: [],
        mostCommonFailure: "-", avgDurationLabel: "-", lastRunAt: null, modelsUsed: [],
      };
    }

    const successCount = runs.filter(r => r.status === "completed").length;
    const failedCount = runs.filter(r => r.status === "failed").length;
    const cancelledCount = runs.filter(r => r.status === "cancelled").length;
    const successRate = Math.round((successCount / totalRuns) * 100);

    const runsWithDuration = runs.filter(r => r.durationMs);
    const avgDurationMs = runsWithDuration.length
      ? runsWithDuration.reduce((s, r) => s + (r.durationMs || 0), 0) / runsWithDuration.length
      : 0;

    const runsWithTokens = runs.filter(r => r.tokensUsed);
    const totalTokens = runsWithTokens.reduce((s, r) => s + (r.tokensUsed || 0), 0);
    const avgTokens = runsWithTokens.length ? Math.round(totalTokens / runsWithTokens.length) : 0;

    const totalCost = runs.reduce((s, r) => s + (r.cost || 0), 0);
    const runsWithCost = runs.filter(r => r.cost);
    const avgCostPerRun = runsWithCost.length ? totalCost / runsWithCost.length : 0;

    // Group runs by day
    const bucketMap = new Map<string, DailyBucket>();
    for (const run of runs) {
      const isoKey = toDateKey(run.createdAt);
      if (!bucketMap.has(isoKey)) {
        bucketMap.set(isoKey, { date: toDisplayDate(isoKey), isoDate: isoKey, success: 0, failed: 0, total: 0, cost: 0, tokens: 0 });
      }
      const b = bucketMap.get(isoKey)!;
      b.total++;
      if (run.status === "completed") b.success++;
      else if (run.status === "failed") b.failed++;
      b.cost += run.cost || 0;
      b.tokens += run.tokensUsed || 0;
    }
    const dailyBuckets = Array.from(bucketMap.values())
      .sort((a, b) => a.isoDate.localeCompare(b.isoDate))
      .slice(-30); // last 30 days

    // Failure categories
    const failedRuns = runs.filter(r => r.status === "failed");
    const catMap = new Map<string, number>();
    for (const run of failedRuns) {
      const cat = categorizeError(run.errorMessage);
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    }
    const failureCategories = Array.from(catMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const mostCommonFailure = failureCategories[0]?.name || "-";

    // Sort runs by createdAt and get last run
    const sorted = [...runs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const lastRunAt = sorted[0]?.createdAt || null;

    // Model usage breakdown
    const modelMap = new Map<string, number>();
    for (const run of runs) {
      if (run.modelName) {
        modelMap.set(run.modelName, (modelMap.get(run.modelName) || 0) + 1);
      }
    }
    const modelsUsed = Array.from(modelMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRuns, successCount, failedCount, cancelledCount,
      successRate, avgDurationMs, avgTokens, totalTokens,
      totalCost, avgCostPerRun, dailyBuckets, failureCategories,
      mostCommonFailure, avgDurationLabel: formatDuration(avgDurationMs),
      lastRunAt, modelsUsed,
    };
  }, [runs]);
}
