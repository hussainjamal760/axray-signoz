import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentRunSummary } from '@/features/agent-runs/types/agent-runs.types';
import { useSigNozAlerts } from '../hooks/useSigNozAlerts';

interface SmartAlertsTabProps {
  runs: AgentRunSummary[];
}

export const SmartAlertsTab: React.FC<SmartAlertsTabProps> = ({ runs }) => {
  const { data: signozAlerts } = useSigNozAlerts();

  const anomalies = useMemo(() => {
    const list: any[] = [];
    
    // 1. Add Real SigNoz Alerts (from backend)
    if (signozAlerts && Array.isArray(signozAlerts)) {
      signozAlerts.forEach((alert: any) => {
        // If alert is firing or configured, show it
        list.push({
          id: `signoz-${alert.id || alert.alert?.id || Math.random()}`,
          type: 'SIGNOZ_ALERT',
          severity: alert.severity === 'critical' ? 'critical' : 'high',
          title: alert.alertName || alert.alert?.name || 'SigNoz Monitor Alert',
          description: alert.description || alert.alert?.description || 'Triggered by a SigNoz custom alert rule.',
          timestamp: alert.startsAt || alert.updatedAt || new Date().toISOString(),
          isSigNoz: true,
        });
      });
    }

    if (!runs || runs.length === 0) return list;

    // 2. Add local heuristics (Smart Anomalies)
    const totalCost = runs.reduce((sum, r) => sum + (r.cost || 0), 0);
    const totalTokens = runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
    const hasFailed = runs.some(r => r.status === 'failed');

    const lastUpdatedAt = runs[0]?.updatedAt || new Date().toISOString();

    if (totalCost > 0.01) {
      list.push({
        id: 'cost-spike',
        type: 'COST_SPIKE',
        severity: 'high',
        title: 'High Cost Detected',
        description: `This session consumed $${totalCost.toFixed(4)}, exceeding the $0.01 threshold.`,
        timestamp: lastUpdatedAt
      });
    }

    if (totalTokens > 10000) {
      list.push({
        id: 'token-spike',
        type: 'TOKEN_SPIKE',
        severity: 'medium',
        title: 'Massive Token Usage',
        description: `This session consumed ${totalTokens.toLocaleString()} tokens, exceeding the 10,000 threshold.`,
        timestamp: lastUpdatedAt
      });
    }

    if (hasFailed) {
      list.push({
        id: 'execution-failure',
        type: 'EXECUTION_FAILURE',
        severity: 'critical',
        title: 'Execution Failed',
        description: `One or more agent executions failed with an error. Check traces and logs for details.`,
        timestamp: lastUpdatedAt
      });
    }

    return list;
  }, [runs, signozAlerts]);

  if (!anomalies || anomalies.length === 0) {
    return null; // Don't show anything if there are no anomalies
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <h3 className="text-sm font-semibold text-white tracking-widest uppercase">Proactive Alarms Triggered</h3>
      </div>
      
      <AnimatePresence>
        {anomalies.map((anomaly, i) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-2xl border backdrop-blur-md shadow-sm ${
              anomaly.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
              anomaly.severity === 'high' ? 'bg-amber-500/10 border-amber-500/20' :
              'bg-yellow-500/10 border-yellow-500/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                    anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    anomaly.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {anomaly.type.replace('_', ' ')}
                  </span>
                  {anomaly.isSigNoz && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      SIGNOZ API
                    </span>
                  )}
                  <span className="text-on-surface-variant font-mono text-xs">
                    {new Date(anomaly.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className={`text-base font-bold mt-3 tracking-tight ${
                  anomaly.severity === 'critical' ? 'text-red-300' :
                  anomaly.severity === 'high' ? 'text-amber-300' :
                  'text-yellow-300'
                }`}>
                  {anomaly.title}
                </h4>
                <p className="text-sm text-on-surface-variant/90 mt-1.5 leading-relaxed">
                  {anomaly.description}
                </p>
              </div>
              <div className={`p-2.5 rounded-full flex items-center justify-center ${
                anomaly.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]' :
                anomaly.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]' :
                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
              }`}>
                {anomaly.isSigNoz ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {anomaly.type.includes('COST') ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : anomaly.type.includes('TOKEN') ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    )}
                  </svg>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
