import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { SimpleLogRecordProcessor, ConsoleLogRecordExporter } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { HostMetrics } from "@opentelemetry/host-metrics";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { resourceFromAttributes, defaultResource } from "@opentelemetry/resources";
import { SimpleSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { trace, context, Span, SpanContext } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
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

function getLogsUrl(): string {
  if (process.env.OTLP_ENDPOINT) {
    return `${process.env.OTLP_ENDPOINT}/v1/logs`;
  }
  const region = process.env.SIGNOZ_REGION;
  if (region) {
    return `https://ingest.${region}.signoz.cloud:443/v1/logs`;
  }
  return "http://localhost:4318/v1/logs";
}

function getMetricsUrl(): string {
  if (process.env.OTLP_ENDPOINT) {
    return `${process.env.OTLP_ENDPOINT}/v1/metrics`;
  }
  const region = process.env.SIGNOZ_REGION;
  if (region) {
    return `https://ingest.${region}.signoz.cloud:443/v1/metrics`;
  }
  return "http://localhost:4318/v1/metrics";
}

const ingestUrl = getIngestUrl();
const logsUrl = getLogsUrl();
const metricsUrl = getMetricsUrl();

// Build headers — include the ingestion key when sending to SigNoz Cloud.
const exporterHeaders: Record<string, string> = {};
if (process.env.SIGNOZ_INGESTION_KEY) {
  exporterHeaders["signoz-ingestion-key"] = process.env.SIGNOZ_INGESTION_KEY;
}

const sdk = new NodeSDK({
  resource: defaultResource().merge(
    resourceFromAttributes({
      "service.name": "axray-agent",
    })
  ),
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: ingestUrl,
        headers: exporterHeaders,
      })
    ),
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
  logRecordProcessors: [
    new SimpleLogRecordProcessor({
      exporter: new OTLPLogExporter({
        url: logsUrl,
        headers: exporterHeaders,
      }),
    }),
    new SimpleLogRecordProcessor({
      exporter: new ConsoleLogRecordExporter(),
    }),
  ],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: metricsUrl,
      headers: exporterHeaders,
    }),
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // We can disable specific instrumentations if they are too noisy, but we'll enable the defaults for now.
      '@opentelemetry/instrumentation-fs': {
        requireParentSpan: true, // Only trace FS operations that happen inside our main tasks
      },
    }),
  ],
});

/**
 * Start the OpenTelemetry SDK.
 */
export function startTelemetry() {
  sdk.start();

  // Start capturing Host Metrics (CPU, Memory, etc.)
  const hostMetrics = new HostMetrics({ name: "axray-agent-host-metrics" });
  hostMetrics.start();

  // Patch console to capture logs
  const logger = logs.getLogger("axray-agent");

  const originalConsoleLog = console.log;
  console.log = function (...args) {
    originalConsoleLog.apply(console, args);
    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
      body: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "),
    });
  };

  const originalConsoleError = console.error;
  console.error = function (...args) {
    originalConsoleError.apply(console, args);
    logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: "ERROR",
      body: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "),
    });
  };

  const originalConsoleWarn = console.warn;
  console.warn = function (...args) {
    originalConsoleWarn.apply(console, args);
    logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: "WARN",
      body: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "),
    });
  };

  const originalConsoleInfo = console.info;
  console.info = function (...args) {
    originalConsoleInfo.apply(console, args);
    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
      body: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "),
    });
  };
}

/**
 * Shut down the OpenTelemetry SDK.
 */
export async function shutdownTelemetry() {
  await sdk.shutdown();
}

export const tracer = trace.getTracer("axray-agent");

// Import metrics API to create custom instruments
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("axray-agent");

export const agentRunsCounter = meter.createCounter("agent.runs.total", {
  description: "Total number of agent runs",
});

export const agentErrorsCounter = meter.createCounter("agent.errors.total", {
  description: "Total number of agent run errors",
});

export const agentTokensInputCounter = meter.createCounter("agent.tokens.input.total", {
  description: "Total number of input tokens used",
});

export const agentTokensOutputCounter = meter.createCounter("agent.tokens.output.total", {
  description: "Total number of output tokens used",
});
