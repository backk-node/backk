"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createErrorFromErrorMessageAndThrowError_1 = __importDefault(require("../errors/createErrorFromErrorMessageAndThrowError"));
const serviceAnnotationContainer_1 = __importDefault(require("../decorators/service/serviceAnnotationContainer"));
const AuthorizationService_1 = __importDefault(require("./AuthorizationService"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const createErrorMessageWithStatusCode_1 = __importDefault(require("../errors/createErrorMessageWithStatusCode"));
const defaultServiceMetrics_1 = __importDefault(require("../observability/metrics/defaultServiceMetrics"));
const constants_1 = require("../constants/constants");
const backkErrors_1 = require("../errors/backkErrors");
async function tryAuthorize(service, functionName, serviceFunctionArgument, authHeader, authorizationService, usersService) {
    const ServiceClass = service.constructor;
    if (!authorizationService || !(authorizationService instanceof AuthorizationService_1.default)) {
        throw new Error('Authorization service missing');
    }
    if (authHeader === undefined) {
        if (serviceAnnotationContainer_1.default.isServiceAllowedForClusterInternalUse(ServiceClass) ||
            serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForClusterInternalUse(ServiceClass, functionName)) {
            return;
        }
    }
    else {
        if (serviceAnnotationContainer_1.default.isServiceAllowedForEveryUser(ServiceClass) ||
            serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForEveryUser(ServiceClass, functionName)) {
            return;
        }
        let allowedRoles = [];
        allowedRoles = allowedRoles.concat(serviceAnnotationContainer_1.default.getAllowedUserRoles(ServiceClass));
        allowedRoles = allowedRoles.concat(serviceFunctionAnnotationContainer_1.default.getAllowedUserRoles(ServiceClass, functionName));
        if (await authorizationService.hasUserRoleIn(allowedRoles, authHeader)) {
            return;
        }
        if (serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForSelf(ServiceClass, functionName) &&
            serviceFunctionArgument) {
            let userName = serviceFunctionArgument.userName;
            const userId = serviceFunctionArgument.userId ||
                (service.isUsersService() ? serviceFunctionArgument._id : undefined);
            if (!userId && !userName) {
                throw new Error(ServiceClass.name +
                    '.' +
                    functionName +
                    ': must have userId or userName property present in function argument');
            }
            if (!userName && userId && usersService) {
                const [userAccount] = await usersService.getUserNameById(userId);
                if (userAccount) {
                    userName = userAccount.userName;
                }
            }
            if (await authorizationService.areSameIdentities(userName, authHeader)) {
                return userName;
            }
        }
    }
    if (process.env.NODE_ENV === 'development' &&
        (serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForTests(ServiceClass, functionName) ||
            serviceAnnotationContainer_1.default.isServiceAllowedForClusterInternalUse(ServiceClass) ||
            serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForClusterInternalUse(ServiceClass, functionName))) {
        return;
    }
    defaultServiceMetrics_1.default.incrementAuthorizationFailuresByOne();
    createErrorFromErrorMessageAndThrowError_1.default(createErrorMessageWithStatusCode_1.default(`Error code: ${backkErrors_1.BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.errorCode}:${backkErrors_1.BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.message}`, constants_1.HttpStatusCodes.FORBIDDEN));
}
exports.default = tryAuthorize;
//# sourceMappingURL=tryAuthorize.js.map