"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.severityNameToSeverityMap = exports.Severity = void 0;
const fs = __importStar(require("fs"));
const tracerProvider_1 = __importDefault(require("../distributedtracinig/tracerProvider"));
const getTimeZone_1 = __importDefault(require("../../utils/getTimeZone"));
const getServiceName_1 = __importDefault(require("../../utils/getServiceName"));
const constants_1 = require("../../constants/constants");
var Severity;
(function (Severity) {
    Severity[Severity["DEBUG"] = 5] = "DEBUG";
    Severity[Severity["INFO"] = 9] = "INFO";
    Severity[Severity["WARN"] = 13] = "WARN";
    Severity[Severity["ERROR"] = 17] = "ERROR";
    Severity[Severity["FATAL"] = 21] = "FATAL";
})(Severity = exports.Severity || (exports.Severity = {}));
exports.severityNameToSeverityMap = {
    DEBUG: Severity.DEBUG,
    INFO: Severity.INFO,
    WARN: Severity.WARN,
    ERROR: Severity.ERROR,
    FATAL: Severity.FATAL
};
const cwd = process.cwd();
const serviceName = getServiceName_1.default();
const packageJson = fs.readFileSync(cwd + '/package.json', { encoding: 'UTF-8' });
const packageObj = JSON.parse(packageJson);
if (process.env.NODE_ENV !== 'development' &&
    (!process.env.NODE_NAME || !process.env.SERVICE_NAMESPACE || !process.env.SERVICE_INSTANCE_ID)) {
    throw new Error('NODE_NAME, SERVICE_NAMESPACE and SERVICE_INSTANCE_ID environment variables must be defined');
}
let lastLoggedErrorName = '';
let lastLoggedTimeInMillis = Date.now();
let lastSpanId = '';
function log(severityNumber, name, body, attributes) {
    var _a, _b, _c, _d, _e, _f, _g;
    const minLoggingSeverityNumber = exports.severityNameToSeverityMap[(_a = process.env.LOG_LEVEL) !== null && _a !== void 0 ? _a : 'INFO'];
    const now = new Date();
    const spanId = (_b = tracerProvider_1.default
        .getTracer('default')
        .getCurrentSpan()) === null || _b === void 0 ? void 0 : _b.context().spanId;
    if (severityNumber >= minLoggingSeverityNumber) {
        const logEntry = {
            Timestamp: now.valueOf() + '000000',
            TraceId: (_c = tracerProvider_1.default
                .getTracer('default')
                .getCurrentSpan()) === null || _c === void 0 ? void 0 : _c.context().traceId,
            SpanId: spanId,
            TraceFlags: (_d = tracerProvider_1.default
                .getTracer('default')
                .getCurrentSpan()) === null || _d === void 0 ? void 0 : _d.context().traceFlags,
            SeverityText: Severity[severityNumber],
            SeverityNumber: severityNumber,
            Name: name,
            Body: body,
            Resource: {
                'service.name': serviceName,
                'service.namespace': (_e = process.env.SERVICE_NAMESPACE) !== null && _e !== void 0 ? _e : '',
                'service.instance.id': (_f = process.env.SERVICE_INSTANCE_ID) !== null && _f !== void 0 ? _f : '',
                'service.version': packageObj.version,
                'node.name': (_g = process.env.NODE_NAME) !== null && _g !== void 0 ? _g : ''
            },
            Attributes: {
                isoTimestamp: now.toISOString() + getTimeZone_1.default(),
                ...attributes
            }
        };
        if (lastLoggedErrorName !== name ||
            Date.now() > lastLoggedTimeInMillis + constants_1.Values._100 ||
            severityNumber !== Severity.ERROR ||
            spanId !== lastSpanId) {
            console.log(logEntry);
        }
        lastLoggedErrorName = name;
        lastLoggedTimeInMillis = Date.now();
        lastSpanId = spanId;
    }
}
exports.default = log;
function logError(error) {
    var _a;
    log(Severity.ERROR, error.message, (_a = error.stack) !== null && _a !== void 0 ? _a : '');
}
exports.logError = logError;
//# sourceMappingURL=log.js.map