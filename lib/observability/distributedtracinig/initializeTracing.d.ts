import { SpanProcessor } from "@opentelemetry/tracing";
import { ExporterConfig } from "@opentelemetry/exporter-jaeger/build/src/types";
export declare function initializeTracing(spanProcessor: SpanProcessor): void;
export declare function initializeDefaultJaegerTracing(jaegerExporterOptions?: Partial<ExporterConfig>): void;
