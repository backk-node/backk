import { SimpleSpanProcessor, SpanProcessor } from "@opentelemetry/tracing";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { ExporterConfig } from "@opentelemetry/exporter-jaeger/build/src/types";
import tracerProvider from "./tracerProvider";
import getMicroserviceName from "../../utils/getMicroserviceName";

function initializeTracing(spanProcessor: SpanProcessor) {
  tracerProvider.addSpanProcessor(spanProcessor);
}

export default function initializeDefaultJaegerTracing(jaegerExporterOptions?: Partial<ExporterConfig>) {
  initializeTracing(
    new SimpleSpanProcessor(
      new JaegerExporter({
        serviceName: getMicroserviceName(),
        ...(jaegerExporterOptions ?? {})
      })
    )
  );
}
