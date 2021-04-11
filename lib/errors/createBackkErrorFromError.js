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
Object.defineProperty(exports, "__esModule", { value: true });
const BackkError_1 = require("../types/BackkError");
const log_1 = __importStar(require("../observability/logging/log"));
const constants_1 = require("../constants/constants");
function createBackkErrorFromError(error) {
    var _a, _b;
    let statusCode = parseInt(error.message.slice(0, 3));
    let message = error.message.slice(4);
    if (isNaN(statusCode)) {
        statusCode = constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR;
        message = error.message;
    }
    let errorCode;
    const ERROR_CODE_PREFIX = 'Error code ';
    if (message.startsWith(ERROR_CODE_PREFIX)) {
        const [errorCodeStr, ...errorMessageParts] = message.split(':');
        errorCode = errorCodeStr.slice(ERROR_CODE_PREFIX.length);
        message = errorMessageParts.join(':').trim();
    }
    log_1.default(log_1.Severity.DEBUG, message, (_a = error.stack) !== null && _a !== void 0 ? _a : '', { errorCode, statusCode });
    if (statusCode >= constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR) {
        log_1.default(log_1.Severity.ERROR, message, (_b = error.stack) !== null && _b !== void 0 ? _b : '', { errorCode, statusCode });
    }
    return {
        [BackkError_1.backkErrorSymbol]: true,
        statusCode,
        errorCode,
        message,
        stackTrace: (process.env.LOG_LEVEL === 'DEBUG' || process.env.NODE_ENV === 'development') &&
            statusCode === constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
            ? error.stack
            : undefined
    };
}
exports.default = createBackkErrorFromError;
//# sourceMappingURL=createBackkErrorFromError.js.map