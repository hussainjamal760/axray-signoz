import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes, defaultResource } from '@opentelemetry/resources';
import { SimpleSpanProcessor, SpanProcessor, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { trace, Tracer, SpanStatusCode } from '@opentelemetry/api';

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

  getSpansForRun(runId: string, includeSetupForSessionId?: string): SpanRecord[] {
    const isRunMatch = (s: SpanRecord) => {
      if (!s.attributes) return false;
      if (s.attributes['axray.run.id'] === runId || s.attributes['run.id'] === runId) return true;
      if (
        includeSetupForSessionId &&
        (s.attributes['axray.session.id'] === includeSetupForSessionId || s.attributes['session.id'] === includeSetupForSessionId)
      ) {
        if (
          s.attributes['axray.phase'] === 'setup' ||
          s.attributes['axray.is_initial_setup'] === true ||
          s.name === 'session.create' ||
          s.name === 'container.start'
        ) {
          return true;
        }
      }
      return false;
    };

    const active = Array.from(this.activeSpans.values()).filter(isRunMatch);
    const completed = this.completedSpans.filter(isRunMatch);

    return [...completed, ...active].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }
}

export const spanStoreProcessor = new SpanStoreProcessor();

function getTraceIngestUrl(): string {
  if (process.env.OTLP_ENDPOINT) {
    return `${process.env.OTLP_ENDPOINT}/v1/traces`;
  }
  const region = process.env.SIGNOZ_REGION;
  if (region) {
    return `https://ingest.${region}.signoz.cloud:443/v1/traces`;
  }
  return 'http://localhost:4318/v1/traces';
}

const traceUrl = getTraceIngestUrl();

const exporterHeaders: Record<string, string> = {};
const ingestionKey = process.env.SIGNOZ_INGESTION_KEY || process.env.SIGNOZ_API_KEY;
if (ingestionKey) {
  exporterHeaders['signoz-ingestion-key'] = ingestionKey;
}

let sdk: NodeSDK | null = null;

export function startTelemetry(): void {
  if (sdk) return;

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      'service.name': 'axray-server',
    }).merge(defaultResource()),
    spanProcessors: [
      spanStoreProcessor,
      new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: traceUrl,
          headers: exporterHeaders,
        })
      ),
    ],
  });

  sdk.start();
  console.log(`[Telemetry] OpenTelemetry SDK initialized (ingest: ${traceUrl})`);
}

export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}

export const tracer: Tracer = trace.getTracer('axray-server');
