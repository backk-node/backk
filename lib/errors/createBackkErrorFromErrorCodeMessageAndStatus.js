"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createBackkErrorFromError_1 = __importDefault(require("./createBackkErrorFromError"));
const constants_1 = require("../constants/constants");
function createBackkErrorFromErrorCodeMessageAndStatus(errorCodeMessageAndStatus) {
    var _a;
    return createBackkErrorFromError_1.default(new Error(((_a = errorCodeMessageAndStatus.statusCode) !== null && _a !== void 0 ? _a : constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR) +
        ':Error code ' +
        errorCodeMessageAndStatus.errorCode +
        ':' +
        errorCodeMessageAndStatus.message));
}
exports.default = createBackkErrorFromErrorCodeMessageAndStatus;
//# sourceMappingURL=createBackkErrorFromErrorCodeMessageAndStatus.js.map