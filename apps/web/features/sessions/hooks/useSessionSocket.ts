"use client";

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { TimelineEventMetadata, AxrayPhase } from '@/features/agent-runs/types';

export interface LiveSocketEvent {
  sessionId: string;
  runId?: string;
  timestamp: string;
  eventType: string;
  phase: AxrayPhase;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'incomplete';
  title: string;
  description?: string;
  durationMs?: number;
  metadata?: TimelineEventMetadata;
}

export interface LiveTraceSpan {
  sessionId: string;
  runId?: string;
  traceId: string;
  spanId: string;
  operation: string;
  status: 'completed' | 'running' | 'failed' | 'skipped';
  durationMs?: number;
  startTime: string;
  attributes?: Record<string, unknown>;
}

export interface LiveTerminalLine {
  sessionId: string;
  runId?: string;
  timestamp: string;
  type: 'command' | 'stdout' | 'stderr' | 'agent' | 'success' | 'error';
  text: string;
}

export interface UseSessionSocketOptions {
  enabled?: boolean;
}

export function useSessionSocket(sessionId?: string, options?: UseSessionSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LiveSocketEvent[]>([]);
  const [liveTraces, setLiveTraces] = useState<LiveTraceSpan[]>([]);
  const [liveTerminalLines, setLiveTerminalLines] = useState<LiveTerminalLine[]>([]);
  const [latestEvent, setLatestEvent] = useState<LiveSocketEvent | null>(null);

  const isEnabled = options?.enabled ?? true;

  useEffect(() => {
    if (!sessionId || !isEnabled) {
      setIsConnected(false);
      return;
    }

    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('join_session', sessionId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleExecutionEvent = (event: LiveSocketEvent) => {
      if (event.sessionId === sessionId) {
        setLatestEvent(event);
        setLiveEvents((prev) => [...prev, event]);
      }
    };

    const handleExecutionTrace = (span: LiveTraceSpan) => {
      if (span.sessionId === sessionId) {
        setLiveTraces((prev) => {
          const next = [span, ...prev];
          return next.slice(0, 20); // Keep latest 20 live trace previews
        });
      }
    };

    const handleTerminalLine = (line: LiveTerminalLine) => {
      if (line.sessionId === sessionId) {
        setLiveTerminalLines((prev) => [...prev, line]);
      }
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('execution.event', handleExecutionEvent);
    socket.on('execution.trace', handleExecutionTrace);
    socket.on('terminal.line', handleTerminalLine);

    return () => {
      socket.emit('leave_session', sessionId);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('execution.event', handleExecutionEvent);
      socket.off('execution.trace', handleExecutionTrace);
      socket.off('terminal.line', handleTerminalLine);
    };
  }, [sessionId, isEnabled]);

  const clearLiveEvents = () => {
    setLiveEvents([]);
    setLiveTraces([]);
    setLiveTerminalLines([]);
    setLatestEvent(null);
  };

  return {
    isConnected,
    liveEvents,
    liveTraces,
    liveTerminalLines,
    latestEvent,
    clearLiveEvents,
  };
}
