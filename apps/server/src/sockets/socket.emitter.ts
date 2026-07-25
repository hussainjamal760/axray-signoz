import { Server as SocketIOServer } from 'socket.io';
import { AxrayPhase } from '../lib/telemetry-attributes';

export interface LiveExecutionEvent {
  sessionId: string;
  runId?: string;
  timestamp: string;
  eventType: string;
  phase: AxrayPhase;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'incomplete' | 'cancelled';
  title: string;
  description?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
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

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(io: SocketIOServer): void {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_session', (sessionId: string) => {
      if (sessionId) {
        const room = `session:${sessionId}`;
        socket.join(room);
        console.log(`[Socket.IO] Socket ${socket.id} joined room "${room}"`);
      }
    });

    socket.on('leave_session', (sessionId: string) => {
      if (sessionId) {
        const room = `session:${sessionId}`;
        socket.leave(room);
        console.log(`[Socket.IO] Socket ${socket.id} left room "${room}"`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

export function emitLiveEvent(sessionId: string, event: LiveExecutionEvent): void {
  if (!ioInstance || !sessionId) return;
  const room = `session:${sessionId}`;
  ioInstance.to(room).emit('execution.event', event);
  console.log(`[Socket.IO Emit] Room "${room}" -> Event: ${event.eventType} (${event.title})`);
}

export function emitLiveTrace(sessionId: string, span: LiveTraceSpan): void {
  if (!ioInstance || !sessionId) return;
  const room = `session:${sessionId}`;
  ioInstance.to(room).emit('execution.trace', span);
}

export function emitTerminalLine(sessionId: string, line: LiveTerminalLine): void {
  if (!ioInstance || !sessionId) return;
  const room = `session:${sessionId}`;
  ioInstance.to(room).emit('terminal.line', line);
}
