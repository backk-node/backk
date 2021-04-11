"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const createBackkErrorFromError_1 = __importDefault(require("./createBackkErrorFromError"));
function createErrorFromErrorMessageAndThrowError(errorMessage) {
    const errorResponse = createBackkErrorFromError_1.default(new Error(errorMessage));
    throw new common_1.HttpException(errorResponse, errorResponse.statusCode);
}
exports.default = createErrorFromErrorMessageAndThrowError;
//# sourceMappingURL=createErrorFromErrorMessageAndThrowError.js.map