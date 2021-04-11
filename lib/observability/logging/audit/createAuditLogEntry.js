"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const tracerProvider_1 = __importDefault(require("../../distributedtracinig/tracerProvider"));
const getTimeZone_1 = __importDefault(require("../../../utils/getTimeZone"));
const getServiceName_1 = __importDefault(require("../../../utils/getServiceName"));
const cwd = process.cwd();
const serviceName = getServiceName_1.default();
const packageJson = fs_1.default.readFileSync(cwd + '/package.json', { encoding: 'UTF-8' });
const packageObj = JSON.parse(packageJson);
function createAuditLogEntry(userName, clientIp, authorizationHeader, userOperation, userOperationResult, userOperationHttpStatusCode, userOperationErrorMessage, attributes) {
    var _a, _b, _c, _d, _e, _f;
    const now = new Date();
    return {
        userName,
        clientIp,
        authorizationHeader,
        userOperation,
        userOperationResult,
        userOperationHttpStatusCode,
        userOperationErrorMessage,
        Timestamp: now.valueOf() + '000000',
        TraceId: (_a = tracerProvider_1.default
            .getTracer('default')
            .getCurrentSpan()) === null || _a === void 0 ? void 0 : _a.context().traceId,
        SpanId: (_b = tracerProvider_1.default
            .getTracer('default')
            .getCurrentSpan()) === null || _b === void 0 ? void 0 : _b.context().spanId,
        TraceFlags: (_c = tracerProvider_1.default
            .getTracer('default')
            .getCurrentSpan()) === null || _c === void 0 ? void 0 : _c.context().traceFlags,
        Resource: {
            'service.name': serviceName,
            'service.namespace': (_d = process.env.SERVICE_NAMESPACE) !== null && _d !== void 0 ? _d : '',
            'service.instance.id': (_e = process.env.SERVICE_INSTANCE_ID) !== null && _e !== void 0 ? _e : '',
            'service.version': packageObj.version,
            'node.name': (_f = process.env.NODE_NAME) !== null && _f !== void 0 ? _f : ''
        },
        Attributes: {
            isoTimestamp: now.toISOString() + getTimeZone_1.default(),
            ...attributes
        }
    };
}
exports.default = createAuditLogEntry;
//# sourceMappingURL=createAuditLogEntry.js.map