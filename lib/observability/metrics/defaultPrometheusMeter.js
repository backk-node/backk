"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prometheusExporter = exports.DEFAULT_METER_INTERVAL_IN_MILLIS = void 0;
const metrics_1 = require("@opentelemetry/metrics");
const exporter_prometheus_1 = require("@opentelemetry/exporter-prometheus");
exports.DEFAULT_METER_INTERVAL_IN_MILLIS = 5000;
exports.prometheusExporter = new exporter_prometheus_1.PrometheusExporter();
const cwd = process.cwd();
const serviceName = cwd.split('/').reverse()[0];
const defaultPrometheusMeter = new metrics_1.MeterProvider({
    exporter: exports.prometheusExporter,
    interval: exports.DEFAULT_METER_INTERVAL_IN_MILLIS,
}).getMeter(serviceName);
exports.default = defaultPrometheusMeter;
//# sourceMappingURL=defaultPrometheusMeter.js.map