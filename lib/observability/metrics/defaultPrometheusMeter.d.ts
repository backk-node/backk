import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
export declare const DEFAULT_METER_INTERVAL_IN_MILLIS = 5000;
export declare const prometheusExporter: PrometheusExporter;
declare const defaultPrometheusMeter: import("@opentelemetry/metrics").Meter;
export default defaultPrometheusMeter;
