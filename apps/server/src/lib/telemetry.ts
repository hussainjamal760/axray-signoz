import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes, defaultResource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, Tracer } from '@opentelemetry/api';

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
