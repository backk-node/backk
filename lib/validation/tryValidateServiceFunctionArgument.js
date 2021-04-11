"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const createErrorFromErrorMessageAndThrowError_1 = __importDefault(require("../errors/createErrorFromErrorMessageAndThrowError"));
const createErrorMessageWithStatusCode_1 = __importDefault(require("../errors/createErrorMessageWithStatusCode"));
const getValidationErrors_1 = __importDefault(require("./getValidationErrors"));
const constants_1 = require("../constants/constants");
const isCreateFunction_1 = __importDefault(require("../service/crudentity/utils/isCreateFunction"));
const backkErrors_1 = require("../errors/backkErrors");
function filterOutManyToManyIdErrors(validationErrors) {
    validationErrors.forEach((validationError) => {
        var _a;
        if (validationError.constraints) {
            validationError.constraints = Object.entries(validationError.constraints).reduce((accumulatedConstraints, [validationName, validationErrorMessage]) => {
                if (validationName === 'isUndefined' && validationErrorMessage === '_id is not allowed') {
                    return accumulatedConstraints;
                }
                return { ...accumulatedConstraints, [validationName]: validationErrorMessage };
            }, {});
        }
        if (((_a = validationError.children) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            filterOutManyToManyIdErrors(validationError.children);
        }
    });
}
function getValidationErrorConstraintsCount(validationErrors) {
    return validationErrors.reduce((constraintsCount, validationError) => {
        var _a, _b;
        const newConstraintsCount = constraintsCount + Object.keys((_a = validationError.constraints) !== null && _a !== void 0 ? _a : {}).length;
        return ((_b = validationError.children) === null || _b === void 0 ? void 0 : _b.length) > 0
            ? newConstraintsCount + getValidationErrorConstraintsCount(validationError.children)
            : newConstraintsCount;
    }, 0);
}
async function tryValidateServiceFunctionArgument(ServiceClass, functionName, dbManager, serviceFunctionArgument) {
    try {
        await class_validator_1.validateOrReject(serviceFunctionArgument, {
            groups: [
                '__backk_firstRound__',
                ...(dbManager ? [dbManager.getDbManagerType()] : []),
                ...(isCreateFunction_1.default(ServiceClass, functionName) ? ['__backk_firstRoundWhenCreate__'] : []),
                ...(isCreateFunction_1.default(ServiceClass, functionName) ? [] : ['__backk_firstRoundWhenUpdate__'])
            ]
        });
        await class_validator_1.validateOrReject(serviceFunctionArgument, {
            whitelist: true,
            forbidNonWhitelisted: true,
            groups: [
                '__backk_argument__',
                ...(isCreateFunction_1.default(ServiceClass, functionName) ? ['__backk_create__'] : []),
                ...(isCreateFunction_1.default(ServiceClass, functionName) ? [] : ['__backk_update__'])
            ]
        });
    }
    catch (validationErrors) {
        validationErrors.forEach((validationError) => {
            if (validationError.children) {
                filterOutManyToManyIdErrors(validationError.children);
            }
        });
        if (getValidationErrorConstraintsCount(validationErrors) === 0) {
            return;
        }
        const errorMessage = `Error code ${backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.errorCode}:${backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message}` +
            getValidationErrors_1.default(validationErrors);
        createErrorFromErrorMessageAndThrowError_1.default(createErrorMessageWithStatusCode_1.default(errorMessage, constants_1.HttpStatusCodes.BAD_REQUEST));
    }
}
exports.default = tryValidateServiceFunctionArgument;
//# sourceMappingURL=tryValidateServiceFunctionArgument.js.map