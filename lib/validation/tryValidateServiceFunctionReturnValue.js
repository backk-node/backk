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
const class_validator_1 = require("class-validator");
const createErrorFromErrorMessageAndThrowError_1 = __importDefault(require("../errors/createErrorFromErrorMessageAndThrowError"));
const createErrorMessageWithStatusCode_1 = __importDefault(require("../errors/createErrorMessageWithStatusCode"));
const class_transformer_1 = require("class-transformer");
const getValidationErrors_1 = __importDefault(require("./getValidationErrors"));
const constants_1 = require("../constants/constants");
const log_1 = __importStar(require("../observability/logging/log"));
async function tryValidateServiceFunctionReturnValue(returnValue, ReturnValueType, serviceFunctionName) {
    const instantiatedResponse = class_transformer_1.plainToClass(ReturnValueType, returnValue);
    try {
        await class_validator_1.validateOrReject(instantiatedResponse, {
            groups: ['__backk_response__'],
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: true
        });
    }
    catch (validationErrors) {
        const errorMessage = serviceFunctionName + ': Invalid service function return value: ' + getValidationErrors_1.default(validationErrors);
        log_1.default(log_1.Severity.ERROR, errorMessage, '');
        createErrorFromErrorMessageAndThrowError_1.default(createErrorMessageWithStatusCode_1.default(errorMessage, constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
}
exports.default = tryValidateServiceFunctionReturnValue;
//# sourceMappingURL=tryValidateServiceFunctionReturnValue.js.map