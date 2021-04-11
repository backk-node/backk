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
const node_fetch_1 = __importDefault(require("node-fetch"));
const log_1 = __importStar(require("../../observability/logging/log"));
const createBackkErrorFromError_1 = __importDefault(require("../../errors/createBackkErrorFromError"));
const getRemoteResponseTestValue_1 = __importDefault(require("./getRemoteResponseTestValue"));
const cls_hooked_1 = require("cls-hooked");
const defaultServiceMetrics_1 = __importDefault(require("../../observability/metrics/defaultServiceMetrics"));
const constants_1 = require("../../constants/constants");
const validateServiceFunctionArguments_1 = require("../utils/validateServiceFunctionArguments");
const parseRemoteServiceFunctionCallUrlParts_1 = __importDefault(require("../utils/parseRemoteServiceFunctionCallUrlParts"));
const fs_1 = __importDefault(require("fs"));
const BackkError_1 = require("../../types/BackkError");
async function callRemoteService(remoteServiceFunctionUrl, serviceFunctionArgument, options) {
    var _a, _b, _c, _d, _e, _f;
    const clsNamespace = cls_hooked_1.getNamespace('serviceFunctionExecution');
    clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.set('remoteServiceCallCount', (clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.get('remoteServiceCallCount')) + 1);
    log_1.default(log_1.Severity.DEBUG, 'Call sync remote service', '', { remoteServiceFunctionUrl });
    defaultServiceMetrics_1.default.incrementRemoteServiceCallCountByOne(remoteServiceFunctionUrl);
    if (process.env.NODE_ENV === 'development') {
        await validateServiceFunctionArguments_1.validateServiceFunctionArguments([{ remoteServiceFunctionUrl, serviceFunctionArgument }]);
        const { topic, serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts_1.default(remoteServiceFunctionUrl);
        if (fs_1.default.existsSync('../' + topic) || fs_1.default.existsSync('./' + topic)) {
            const [serviceName, functionName] = serviceFunctionName.split('.');
            const controller = validateServiceFunctionArguments_1.remoteServiceNameToControllerMap[`${topic}$/${serviceName}`];
            const responseClassName = controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];
            const ResponseClass = controller[serviceName].Types[responseClassName];
            return [getRemoteResponseTestValue_1.default(ResponseClass), null];
        }
    }
    const authHeader = (_a = cls_hooked_1.getNamespace('serviceFunctionExecution')) === null || _a === void 0 ? void 0 : _a.get('authHeader');
    try {
        const response = await node_fetch_1.default(remoteServiceFunctionUrl, {
            method: (_c = (_b = options === null || options === void 0 ? void 0 : options.httpMethod) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : 'post',
            body: serviceFunctionArgument ? JSON.stringify(serviceFunctionArgument) : undefined,
            headers: {
                ...(serviceFunctionArgument ? { 'Content-Type': 'application/json' } : {}),
                Authorization: authHeader
            }
        });
        const responseBody = response.size > 0 ? await response.json() : undefined;
        if (response.status >= constants_1.HttpStatusCodes.ERRORS_START) {
            const message = (_d = responseBody.message) !== null && _d !== void 0 ? _d : JSON.stringify(responseBody);
            const stackTrace = (_e = responseBody.stackTrace) !== null && _e !== void 0 ? _e : undefined;
            const errorCode = (_f = responseBody.errorCode) !== null && _f !== void 0 ? _f : undefined;
            if (response.status >= constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR) {
                log_1.default(log_1.Severity.ERROR, message, stackTrace, {
                    errorCode,
                    statusCode: response.status,
                    remoteServiceFunctionCallUrl: remoteServiceFunctionUrl
                });
                defaultServiceMetrics_1.default.incrementSyncRemoteServiceHttp5xxErrorResponseCounter(remoteServiceFunctionUrl);
            }
            else {
                log_1.default(log_1.Severity.DEBUG, message, stackTrace, {
                    errorCode,
                    statusCode: response.status,
                    remoteServiceFunctionCallUrl: remoteServiceFunctionUrl
                });
                if (response.status === constants_1.HttpStatusCodes.FORBIDDEN) {
                    defaultServiceMetrics_1.default.incrementSyncRemoteServiceCallAuthFailureCounter(remoteServiceFunctionUrl);
                }
            }
            return [
                null,
                {
                    errorCode,
                    message,
                    stackTrace,
                    [BackkError_1.backkErrorSymbol]: true,
                    statusCode: response.status
                }
            ];
        }
        return [responseBody, null];
    }
    catch (error) {
        log_1.default(log_1.Severity.ERROR, error.message, error.stack, {
            remoteServiceFunctionCallUrl: remoteServiceFunctionUrl
        });
        defaultServiceMetrics_1.default.incrementRemoteServiceCallErrorCountByOne(remoteServiceFunctionUrl);
        return [null, createBackkErrorFromError_1.default(error)];
    }
}
exports.default = callRemoteService;
//# sourceMappingURL=callRemoteService.js.map