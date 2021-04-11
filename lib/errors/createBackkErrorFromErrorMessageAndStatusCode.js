"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createErrorMessageWithStatusCode_1 = __importDefault(require("./createErrorMessageWithStatusCode"));
const createBackkErrorFromError_1 = __importDefault(require("./createBackkErrorFromError"));
function createBackkErrorFromErrorMessageAndStatusCode(errorMessage, statusCode) {
    const finalErrorMessage = createErrorMessageWithStatusCode_1.default(errorMessage, statusCode);
    return createBackkErrorFromError_1.default(new Error(finalErrorMessage));
}
exports.default = createBackkErrorFromErrorMessageAndStatusCode;
//# sourceMappingURL=createBackkErrorFromErrorMessageAndStatusCode.js.map