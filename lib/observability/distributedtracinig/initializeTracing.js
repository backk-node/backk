"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDefaultJaegerTracing = exports.initializeTracing = void 0;
const tracing_1 = require("@opentelemetry/tracing");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
const tracerProvider_1 = __importDefault(require("./tracerProvider"));
const getServiceName_1 = __importDefault(require("../../utils/getServiceName"));
function initializeTracing(spanProcessor) {
    tracerProvider_1.default.addSpanProcessor(spanProcessor);
}
exports.initializeTracing = initializeTracing;
function initializeDefaultJaegerTracing(jaegerExporterOptions) {
    initializeTracing(new tracing_1.SimpleSpanProcessor(new exporter_jaeger_1.JaegerExporter({
        serviceName: getServiceName_1.default(),
        ...(jaegerExporterOptions !== null && jaegerExporterOptions !== void 0 ? jaegerExporterOptions : {})
    })));
}
exports.initializeDefaultJaegerTracing = initializeDefaultJaegerTracing;
//# sourceMappingURL=initializeTracing.js.map