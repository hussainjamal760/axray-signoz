import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { resourceFromAttributes, defaultResource } from '@opentelemetry/resources';
import { SimpleSpanProcessor, SpanProcessor, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { trace, metrics, Tracer, SpanStatusCode } from '@opentelemetry/api';

export interface SpanRecord {
  id: string;
  parentId?: string;
  traceId: string;
  name: string;
  status: 'completed' | 'running' | 'failed' | 'skipped';
  startTime: string;
  endTime?: string;
  durationMs?: number;
  attributes: Record<string, any>;
}

export class SpanStoreProcessor implements SpanProcessor {
  private activeSpans = new Map<string, SpanRecord>();
  private completedSpans: SpanRecord[] = [];

  onStart(span: any): void {
    const spanContext = span.spanContext();
    const spanId = spanContext?.spanId;
    if (!spanId) return;

    const parentId = span.parentSpanId;
    const traceId = spanContext.traceId;
    const attributes = { ...span.attributes };
    const startTime = new Date().toISOString();

    const record: SpanRecord = {
      id: spanId,
      parentId,
      traceId,
      name: span.name,
      status: 'running',
      startTime,
      attributes,
    };

    this.activeSpans.set(spanId, record);
  }

  onEnd(span: ReadableSpan): void {
    const spanId = span.spanContext().spanId;
    const parentId = (span as any).parentSpanId;

    const record: SpanRecord = this.activeSpans.get(spanId) || {
      id: spanId,
      parentId,
      traceId: span.spanContext().traceId,
      name: span.name,
      status: 'completed',
      startTime: new Date(span.startTime[0] * 1000 + span.startTime[1] / 1e6).toISOString(),
      attributes: { ...span.attributes },
    };

    const endTimeDate = new Date(span.endTime[0] * 1000 + span.endTime[1] / 1e6);
    const startTimeDate = new Date(span.startTime[0] * 1000 + span.startTime[1] / 1e6);

    record.endTime = endTimeDate.toISOString();
    record.startTime = startTimeDate.toISOString();
    record.durationMs = Math.round(endTimeDate.getTime() - startTimeDate.getTime());
    record.status = span.status.code === SpanStatusCode.ERROR ? 'failed' : 'completed';
    record.attributes = { ...span.attributes };

    this.activeSpans.delete(spanId);
    this.completedSpans.push(record);

    if (this.completedSpans.length > 2000) {
      this.completedSpans.shift();
    }

    const sessionId = record.attributes?.['axray.session.id'] || record.attributes?.['session.id'];
    const runId = record.attributes?.['axray.run.id'] || record.attributes?.['run.id'];
    if (sessionId) {
      try {
        const { emitLiveTrace } = require('../sockets/socket.emitter');
        emitLiveTrace(sessionId, {
          sessionId,
          runId,
          traceId: record.traceId,
          spanId: record.id,
          operation: record.name,
          status: record.status,
          durationMs: record.durationMs,
          startTime: record.startTime,
          attributes: record.attributes,
        });
      } catch {}
    }
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  getSpansForSession(sessionId: string): SpanRecord[] {
    const active = Array.from(this.activeSpans.values()).filter(
      s => s.attributes && (s.attributes['axray.session.id'] === sessionId || s.attributes['session.id'] === sessionId)
    );
    const completed = this.completedSpans.filter(
      s => s.attributes && (s.attributes['axray.session.id'] === sessionId || s.attributes['session.id'] === sessionId)
    );

    return [...completed, ...active].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  getSpansForRun(runId: string): SpanRecord[] {
    const isRunMatch = (s: SpanRecord) => {
      if (!s.attributes) return false;
      return s.attributes['axray.run.id'] === runId || s.attributes['run.id'] === runId;
    };

    const active = Array.from(this.activeSpans.values()).filter(isRunMatch);
    const completed = this.completedSpans.filter(isRunMatch);

    return [...completed, ...active].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }
}

export const spanStoreProcessor = new SpanStoreProcessor();

function getBaseOtlpEndpoint(rawEndpoint?: string): string {
  const endpoint = rawEndpoint || process.env.OTLP_BASE_ENDPOINT || process.env.OTLP_ENDPOINT || 'http://localhost:4318';
  return endpoint.replace(/\/(v1\/(traces|logs|metrics))?\/?$/, '');
}

function getOtlpTraceUrl(): string {
  if (process.env.OTLP_TRACE_ENDPOINT) return process.env.OTLP_TRACE_ENDPOINT;
  if (process.env.OTLP_ENDPOINT && process.env.OTLP_ENDPOINT.endsWith('/v1/traces')) return process.env.OTLP_ENDPOINT;
  return `${getBaseOtlpEndpoint(process.env.OTLP_ENDPOINT)}/v1/traces`;
}

function getOtlpLogsUrl(): string {
  if (process.env.OTLP_LOGS_ENDPOINT) return process.env.OTLP_LOGS_ENDPOINT;
  return `${getBaseOtlpEndpoint(process.env.OTLP_ENDPOINT)}/v1/logs`;
}

function getOtlpMetricsUrl(): string {
  if (process.env.OTLP_METRICS_ENDPOINT) return process.env.OTLP_METRICS_ENDPOINT;
  return `${getBaseOtlpEndpoint(process.env.OTLP_ENDPOINT)}/v1/metrics`;
}

const traceUrl = getOtlpTraceUrl();
const logsUrl = getOtlpLogsUrl();
const metricsUrl = getOtlpMetricsUrl();

let sdk: NodeSDK | null = null;

export function startTelemetry(): void {
  if (sdk) return;

  sdk = new NodeSDK({
    resource: defaultResource().merge(
      resourceFromAttributes({
        'service.name': process.env.OTEL_SERVICE_NAME || 'axray-agent',
        'telemetry.sdk.language': 'nodejs',
      })
    ),
    spanProcessors: [
      spanStoreProcessor,
      new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: traceUrl,
        })
      ),
    ],
    logRecordProcessors: [
      new SimpleLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: logsUrl,
        }),
      }),
    ],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: metricsUrl,
      }),
      exportIntervalMillis: 1000,
    }),
  });

  sdk.start();
  console.log(`[Telemetry] OpenTelemetry SDK initialized for service "axray-agent" (Traces: ${traceUrl}, Logs: ${logsUrl}, Metrics: ${metricsUrl})`);
}

export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}

export const tracer: Tracer = trace.getTracer('axray-agent');

const meter = metrics.getMeter('axray-agent');

export const agentRunsCounter = meter.createCounter('agent.runs.total', {
  description: 'Total number of agent runs',
});

export const agentErrorsCounter = meter.createCounter('agent.errors.total', {
  description: 'Total number of agent run errors',
});

export const agentTokensInputCounter = meter.createCounter('agent_tokens_input_total', {
  description: 'Total number of input tokens used',
});

export const agentTokensOutputCounter = meter.createCounter('agent_tokens_output_total', {
  description: 'Total number of output tokens used',
});

export function emitAgentLog(level: 'info' | 'warn' | 'error', body: string, attributes?: Record<string, any>): void {
  try {
    const logger = logs.getLogger('axray-agent');
    const severityNumber =
      level === 'error' ? SeverityNumber.ERROR : level === 'warn' ? SeverityNumber.WARN : SeverityNumber.INFO;

    // Filter out service.name and telemetry.sdk.language if passed in attributes to prevent Resource vs Attribute ambiguity in SigNoz
    const logAttributes = { ...(attributes || {}) };
    delete logAttributes['service.name'];
    delete logAttributes['telemetry.sdk.language'];

    logger.emit({
      severityNumber,
      severityText: level.toUpperCase(),
      body,
      attributes: logAttributes,
    });
  } catch {}
}


