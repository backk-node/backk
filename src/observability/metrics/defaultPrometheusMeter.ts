import { MeterProvider } from "@opentelemetry/metrics";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";

export const DEFAULT_METER_INTERVAL_IN_MILLIS = 5000;
export const prometheusExporter = new PrometheusExporter();

const cwd = process.cwd();
const serviceName = cwd.split('/').reverse()[0];

const defaultPrometheusMeter = new MeterProvider({
  exporter: prometheusExporter,
  interval: DEFAULT_METER_INTERVAL_IN_MILLIS,
}).getMeter(serviceName);

export default defaultPrometheusMeter;
