import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes, defaultResource } from "@opentelemetry/resources";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { trace, context, Span, SpanContext } from "@opentelemetry/api";

// Build the OTLP ingest URL for SigNoz Cloud.
// Supports two env-var patterns:
//   1. OTLP_ENDPOINT (full base URL, e.g. https://ingest.us2.signoz.cloud:443)
//   2. SIGNOZ_REGION  (short region code, e.g. us2, in, eu)
// Falls back to localhost for local dev without SigNoz.
function getIngestUrl(): string {
  if (process.env.OTLP_ENDPOINT) {
    return `${process.env.OTLP_ENDPOINT}/v1/traces`;
  }
  const region = process.env.SIGNOZ_REGION;
  if (region) {
    return `https://ingest.${region}.signoz.cloud:443/v1/traces`;
  }
  return "http://localhost:4318/v1/traces";
}

const ingestUrl = getIngestUrl();

// Build headers — include the ingestion key when sending to SigNoz Cloud.
const exporterHeaders: Record<string, string> = {};
if (process.env.SIGNOZ_INGESTION_KEY) {
  exporterHeaders["signoz-ingestion-key"] = process.env.SIGNOZ_INGESTION_KEY;
}

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    "service.name": "axray-agent",
  }).merge(defaultResource()),
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: ingestUrl,
      headers: exporterHeaders,
    })
  ),
});

/**
 * Start the OpenTelemetry SDK.
 */
export function startTelemetry() {
  sdk.start();
}

/**
 * Shut down the OpenTelemetry SDK.
 */
export async function shutdownTelemetry() {
  await sdk.shutdown();
}

export const tracer = trace.getTracer("axray-agent");
