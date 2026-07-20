import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes, defaultResource } from "@opentelemetry/resources";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { trace, context, Span, SpanContext } from "@opentelemetry/api";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    "service.name": "axray-agent",
  }).merge(defaultResource()),
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: process.env.SIGNOZ_ENDPOINT 
        ? `${process.env.SIGNOZ_ENDPOINT}/v1/traces`
        : "http://localhost:4318/v1/traces",
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
