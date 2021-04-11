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
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const lodash_1 = __importDefault(require("lodash"));
const ioredis_1 = __importDefault(require("ioredis"));
const tryAuthorize_1 = __importDefault(require("../authorization/tryAuthorize"));
const tryVerifyCaptchaToken_1 = __importDefault(require("../captcha/tryVerifyCaptchaToken"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const UserAccountBaseService_1 = __importDefault(require("../service/useraccount/UserAccountBaseService"));
const tryValidateServiceFunctionArgument_1 = __importDefault(require("../validation/tryValidateServiceFunctionArgument"));
const tryValidateServiceFunctionReturnValue_1 = __importDefault(require("../validation/tryValidateServiceFunctionReturnValue"));
const defaultServiceMetrics_1 = __importDefault(require("../observability/metrics/defaultServiceMetrics"));
const createBackkErrorFromError_1 = __importDefault(require("../errors/createBackkErrorFromError"));
const log_1 = __importStar(require("../observability/logging/log"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const constants_1 = require("../constants/constants");
const getServiceNamespace_1 = __importDefault(require("../utils/getServiceNamespace"));
const createAuditLogEntry_1 = __importDefault(require("../observability/logging/audit/createAuditLogEntry"));
const executeMultipleServiceFunctions_1 = __importDefault(require("./executeMultipleServiceFunctions"));
const tryScheduleJobExecution_1 = __importDefault(require("../scheduling/tryScheduleJobExecution"));
const isExecuteMultipleRequest_1 = __importDefault(require("./isExecuteMultipleRequest"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createErrorFromErrorCodeMessageAndStatus"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../errors/backkErrors");
const emptyError_1 = __importDefault(require("../errors/emptyError"));
const fetchFromRemoteServices_1 = __importDefault(require("./fetchFromRemoteServices"));
const isBackkError_1 = __importDefault(require("../errors/isBackkError"));
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorages/getClsNamespace"));
async function tryExecuteServiceMethod(controller, serviceFunctionName, serviceFunctionArgument, headers, resp, options, shouldCreateClsNamespace = true) {
    var _a, _b, _c, _d;
    let storedError;
    let userName;
    let response;
    const [serviceName, functionName] = serviceFunctionName.split('.');
    try {
        if ((options === null || options === void 0 ? void 0 : options.areMultipleServiceFunctionExecutionsAllowed) &&
            isExecuteMultipleRequest_1.default(serviceFunctionName)) {
            if (options === null || options === void 0 ? void 0 : options.maxServiceFunctionCountInMultipleServiceFunctionExecution) {
                if (Object.keys(serviceFunctionArgument).length > (options === null || options === void 0 ? void 0 : options.maxServiceFunctionCountInMultipleServiceFunctionExecution)) {
                    throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                        ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                        message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + 'too many service functions called'
                    });
                }
            }
            else {
                throw new Error('Missing maxServiceFunctionCountInMultipleServiceFunctionExecution option');
            }
            if (serviceFunctionName === 'executeMultipleInParallelWithoutTransaction') {
                return await executeMultipleServiceFunctions_1.default(true, false, controller, serviceFunctionArgument, headers, resp, options);
            }
            else if (serviceFunctionName === 'executeMultipleInSequenceWithoutTransaction') {
                return await executeMultipleServiceFunctions_1.default(false, false, controller, serviceFunctionArgument, headers, resp, options);
            }
            else if (serviceFunctionName === 'executeMultipleInParallelInsideTransaction') {
                return await executeMultipleServiceFunctions_1.default(true, true, controller, serviceFunctionArgument, headers, resp, options);
            }
            else if (serviceFunctionName === 'executeMultipleInSequenceInsideTransaction') {
                return executeMultipleServiceFunctions_1.default(false, true, controller, serviceFunctionArgument, headers, resp, options);
            }
        }
        log_1.default(log_1.Severity.DEBUG, 'Service function call', serviceFunctionName);
        defaultServiceMetrics_1.default.incrementServiceFunctionCallsByOne(serviceFunctionName);
        const serviceFunctionCallStartTimeInMillis = Date.now();
        if (serviceFunctionName === 'scheduleJobExecution') {
            return await tryScheduleJobExecution_1.default(controller, serviceFunctionArgument, headers, resp);
        }
        if ((options === null || options === void 0 ? void 0 : options.httpMethod) === 'GET') {
            if (!serviceFunctionName.match((_a = options === null || options === void 0 ? void 0 : options.allowedServiceFunctionsRegExpForHttpGetMethod) !== null && _a !== void 0 ? _a : /^\w+\.get/) || ((_b = options === null || options === void 0 ? void 0 : options.deniedServiceFunctionsForForHttpGetMethod) === null || _b === void 0 ? void 0 : _b.includes(serviceFunctionName))) {
                throw createErrorFromErrorCodeMessageAndStatus_1.default(backkErrors_1.BACKK_ERRORS.HTTP_METHOD_MUST_BE_POST);
            }
            serviceFunctionArgument = decodeURIComponent(serviceFunctionArgument);
            try {
                serviceFunctionArgument = JSON.parse(serviceFunctionArgument);
            }
            catch (error) {
                throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                    message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message +
                        'argument not valid or too long. Argument must be a URI encoded JSON string'
                });
            }
        }
        if (serviceFunctionName === 'metadataService.getServicesMetadata') {
            if (!options || options.isMetadataServiceEnabled === undefined || options.isMetadataServiceEnabled) {
                resp === null || resp === void 0 ? void 0 : resp.send(controller.publicServicesMetadata);
                return;
            }
            else {
                throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE,
                    message: backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE.message + serviceName
                });
            }
        }
        else if (serviceFunctionName === 'livenessCheckService.isServiceAlive') {
            resp === null || resp === void 0 ? void 0 : resp.send();
            return;
        }
        else if ((serviceFunctionName === 'readinessCheckService.isServiceReady' ||
            serviceFunctionName === 'startupCheckService.isServiceStarted') &&
            (!controller[serviceName] || !controller[serviceName][functionName])) {
            resp === null || resp === void 0 ? void 0 : resp.send();
            return;
        }
        if (!controller[serviceName]) {
            throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                ...backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE,
                message: backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE.message + serviceName
            });
        }
        const serviceFunctionResponseValueTypeName = controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];
        if (!controller[serviceName][functionName] || !serviceFunctionResponseValueTypeName) {
            throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                ...backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION,
                message: backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION.message + serviceFunctionName
            });
        }
        const serviceFunctionArgumentTypeName = controller[`${serviceName}__BackkTypes__`].functionNameToParamTypeNameMap[functionName];
        if (typeof serviceFunctionArgument !== 'object' ||
            Array.isArray(serviceFunctionArgument) ||
            (serviceFunctionArgumentTypeName && serviceFunctionArgument === null)) {
            throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + 'argument must be a JSON object'
            });
        }
        if (serviceFunctionArgument === null || serviceFunctionArgument === void 0 ? void 0 : serviceFunctionArgument.captchaToken) {
            await tryVerifyCaptchaToken_1.default(controller, serviceFunctionArgument.captchaToken);
        }
        const usersService = Object.values(controller).find((service) => service instanceof UserAccountBaseService_1.default);
        userName = await tryAuthorize_1.default(controller[serviceName], functionName, serviceFunctionArgument, headers.Authorization, controller['authorizationService'], usersService);
        const dbManager = controller[serviceName].getDbManager();
        let instantiatedServiceFunctionArgument;
        if (serviceFunctionArgumentTypeName) {
            instantiatedServiceFunctionArgument = class_transformer_1.plainToClass(controller[serviceName]['Types'][serviceFunctionArgumentTypeName], serviceFunctionArgument);
            Object.entries(instantiatedServiceFunctionArgument).forEach(([propName, propValue]) => {
                if (Array.isArray(propValue) && propValue.length > 0) {
                    instantiatedServiceFunctionArgument[propName] = propValue.map((pv) => {
                        if (lodash_1.default.isPlainObject(pv)) {
                            const serviceMetadata = controller.servicesMetadata.find((serviceMetadata) => serviceMetadata.serviceName === serviceName);
                            const { baseTypeName } = getTypeInfoForTypeName_1.default(serviceMetadata.types[serviceFunctionArgumentTypeName][propName]);
                            return class_transformer_1.plainToClass(controller[serviceName]['Types'][baseTypeName], pv);
                        }
                        return pv;
                    });
                }
                else {
                    if (lodash_1.default.isPlainObject(propValue)) {
                        const serviceMetadata = controller.servicesMetadata.find((serviceMetadata) => serviceMetadata.serviceName === serviceName);
                        const { baseTypeName } = getTypeInfoForTypeName_1.default(serviceMetadata.types[serviceFunctionArgumentTypeName][propName]);
                        instantiatedServiceFunctionArgument[propName] = class_transformer_1.plainToClass(controller[serviceName]['Types'][baseTypeName], propValue);
                    }
                }
            });
            if (!instantiatedServiceFunctionArgument) {
                throw createBackkErrorFromErrorCodeMessageAndStatus_1.default(backkErrors_1.BACKK_ERRORS.MISSING_SERVICE_FUNCTION_ARGUMENT);
            }
            await tryValidateServiceFunctionArgument_1.default(controller[serviceName].constructor, functionName, dbManager, instantiatedServiceFunctionArgument);
        }
        if ((options === null || options === void 0 ? void 0 : options.httpMethod) === 'GET' && (controller === null || controller === void 0 ? void 0 : controller.responseCacheConfigService.shouldCacheServiceFunctionCallResponse(serviceFunctionName, serviceFunctionArgument))) {
            const key = 'BackkResponseCache' +
                ':' +
                getServiceNamespace_1.default() +
                ':' +
                serviceFunctionName +
                ':' +
                JSON.stringify(serviceFunctionArgument);
            const redis = new ioredis_1.default(`redis://${process.env.REDIS_SERVER}`);
            let cachedResponseJson;
            try {
                cachedResponseJson = await redis.get(key);
            }
            catch (error) {
                log_1.default(log_1.Severity.ERROR, 'Redis cache error: ' + error.message, error.stack, {
                    redisServer: process.env.REDIS_SERVER
                });
            }
            if (cachedResponseJson) {
                log_1.default(log_1.Severity.DEBUG, 'Redis cache debug: fetched service function call response from cache', '', {
                    redisServer: process.env.REDIS_SERVER,
                    key
                });
                defaultServiceMetrics_1.default.incrementServiceFunctionCallCacheHitCounterByOne(serviceFunctionName);
                try {
                    response = JSON.parse(cachedResponseJson);
                }
                catch {
                }
            }
        }
        let ttl;
        let backkError = emptyError_1.default;
        if (!response) {
            const clsNamespace = getClsNamespace_1.default('serviceFunctionExecution');
            [response, backkError] = await clsNamespace.runAndReturn(async () => {
                clsNamespace.set('authHeader', headers.Authorization);
                clsNamespace.set('dbLocalTransactionCount', 0);
                clsNamespace.set('remoteServiceCallCount', 0);
                clsNamespace.set('postHookRemoteServiceCallCount', 0);
                clsNamespace.set('dbManagerOperationAfterRemoteServiceCall', false);
                try {
                    if (dbManager) {
                        await dbManager.tryReserveDbConnectionFromPool();
                    }
                    [response, backkError] = await controller[serviceName][functionName](instantiatedServiceFunctionArgument);
                    if (dbManager) {
                        dbManager.tryReleaseDbConnectionBackToPool();
                    }
                    if (clsNamespace.get('dbLocalTransactionCount') > 1 &&
                        clsNamespace.get('remoteServiceCallCount') === 0 &&
                        !serviceFunctionAnnotationContainer_1.default.isServiceFunctionNonTransactional(controller[serviceName].constructor, functionName)) {
                        throw new Error(serviceFunctionName +
                            ": multiple database manager operations must be executed inside a transaction (use database manager's executeInsideTransaction method) or service function must be annotated with @NoTransaction");
                    }
                    else if (clsNamespace.get('dbLocalTransactionCount') >= 1 &&
                        clsNamespace.get('remoteServiceCallCount') === 1 &&
                        !serviceFunctionAnnotationContainer_1.default.isServiceFunctionNonTransactional(controller[serviceName].constructor, functionName)) {
                        throw new Error(serviceFunctionName +
                            ': database manager operation and remote service callRemoteService must be executed inside a transaction or service function must be annotated with @NoTransaction if no transaction is needed');
                    }
                    else if ((clsNamespace.get('remoteServiceCallCount') > 1 ||
                        clsNamespace.get('postHookRemoteServiceCallCount') > 1) &&
                        !serviceFunctionAnnotationContainer_1.default.isServiceFunctionNonDistributedTransactional(controller[serviceName].constructor, functionName)) {
                        throw new Error(serviceFunctionName +
                            ": multiple remote service calls cannot be executed because distributed transactions are not supported. To allow multiple remote service calls that don't require a transaction, annotate service function with @NoDistributedTransaction");
                    }
                    else if (clsNamespace.get('dbManagerOperationAfterRemoteServiceCall') &&
                        !serviceFunctionAnnotationContainer_1.default.isServiceFunctionNonDistributedTransactional(controller[serviceName].constructor, functionName)) {
                        throw new Error(serviceFunctionName +
                            ': database manager operation(s) that can fail cannot be called after a remote service callRemoteService that cannot be rolled back. Alternatively, service function must be annotated with @NoDistributedTransaction if no distributed transaction is needed');
                    }
                }
                catch (error) {
                    backkError = createBackkErrorFromError_1.default(error);
                }
                return [response ? response : undefined, backkError];
            });
            if (backkError) {
                if (backkError.statusCode >= constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR) {
                    defaultServiceMetrics_1.default.incrementHttp5xxErrorsByOne();
                }
                else if (backkError.statusCode >= constants_1.HttpStatusCodes.CLIENT_ERRORS_START) {
                    defaultServiceMetrics_1.default.incrementHttpClientErrorCounter(serviceFunctionName);
                }
                throw new common_1.HttpException(backkError, backkError.statusCode);
            }
            if (response) {
                const serviceFunctionBaseReturnTypeName = getTypeInfoForTypeName_1.default(controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName]).baseTypeName;
                const ServiceFunctionReturnType = controller[serviceName]['Types'][serviceFunctionBaseReturnTypeName];
                const backkError = await fetchFromRemoteServices_1.default(ServiceFunctionReturnType, instantiatedServiceFunctionArgument, response, controller[serviceName]['Types']);
                if (backkError) {
                    if (backkError.statusCode >= constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR) {
                        defaultServiceMetrics_1.default.incrementHttp5xxErrorsByOne();
                    }
                    else if (backkError.statusCode >= constants_1.HttpStatusCodes.CLIENT_ERRORS_START) {
                        defaultServiceMetrics_1.default.incrementHttpClientErrorCounter(serviceFunctionName);
                    }
                    throw new common_1.HttpException(backkError, backkError.statusCode);
                }
                if (Array.isArray(response) && response.length > 0 && typeof response[0] === 'object') {
                    await tryValidateServiceFunctionReturnValue_1.default(response[0], ServiceFunctionReturnType, serviceFunctionName);
                }
                else if (typeof response === 'object') {
                    await tryValidateServiceFunctionReturnValue_1.default(response, ServiceFunctionReturnType, serviceFunctionName);
                }
                if ((options === null || options === void 0 ? void 0 : options.httpMethod) === 'GET' && (controller === null || controller === void 0 ? void 0 : controller.responseCacheConfigService.shouldCacheServiceFunctionCallResponse(serviceFunctionName, serviceFunctionArgument))) {
                    const redis = new ioredis_1.default(`redis://${process.env.REDIS_SERVER}`);
                    const responseJson = JSON.stringify(response);
                    const key = 'BackkResponseCache' +
                        ':' +
                        getServiceNamespace_1.default() +
                        ':' +
                        serviceFunctionName +
                        ':' +
                        JSON.stringify(serviceFunctionArgument);
                    try {
                        ttl = await redis.ttl(key);
                        await redis.set(key, responseJson);
                        log_1.default(log_1.Severity.DEBUG, 'Redis cache debug: stored service function call response to cache', '', {
                            redisUrl: process.env.REDIS_SERVER,
                            key
                        });
                        defaultServiceMetrics_1.default.incrementServiceFunctionCallCachedResponsesCounterByOne(serviceName);
                        if (ttl < 0) {
                            ttl = controller === null || controller === void 0 ? void 0 : controller.responseCacheConfigService.getCachingDurationInSecs(serviceFunctionName, serviceFunctionArgument);
                            await redis.expire(key, ttl);
                        }
                    }
                    catch (error) {
                        log_1.default(log_1.Severity.ERROR, 'Redis cache errorMessageOnPreHookFuncExecFailure: ' + error.message, error.stack, {
                            redisUrl: process.env.REDIS_SERVER
                        });
                    }
                }
                if (response.version) {
                    if (response.version === headers['If-None-Match']) {
                        response = null;
                        resp === null || resp === void 0 ? void 0 : resp.status(constants_1.HttpStatusCodes.NOT_MODIFIED);
                    }
                    if (typeof (resp === null || resp === void 0 ? void 0 : resp.header) === 'function') {
                        resp === null || resp === void 0 ? void 0 : resp.header('ETag', response.version);
                    }
                    else if (typeof (resp === null || resp === void 0 ? void 0 : resp.set) === 'function') {
                        resp === null || resp === void 0 ? void 0 : resp.set('ETag', response.version);
                    }
                }
            }
        }
        const serviceFunctionProcessingTimeInMillis = Date.now() - serviceFunctionCallStartTimeInMillis;
        defaultServiceMetrics_1.default.incrementServiceFunctionProcessingTimeInSecsBucketCounterByOne(serviceFunctionName, serviceFunctionProcessingTimeInMillis / 1000);
        if (ttl) {
            if (typeof (resp === null || resp === void 0 ? void 0 : resp.header) === 'function') {
                resp === null || resp === void 0 ? void 0 : resp.header('Cache-Control', 'max-age=' + ttl);
            }
            else if (typeof (resp === null || resp === void 0 ? void 0 : resp.set) === 'function') {
                resp === null || resp === void 0 ? void 0 : resp.set('Cache-Control', 'max-age=' + ttl);
            }
        }
        if (typeof (resp === null || resp === void 0 ? void 0 : resp.header) === 'function') {
            resp === null || resp === void 0 ? void 0 : resp.header('X-content-type-options', 'nosniff');
            resp === null || resp === void 0 ? void 0 : resp.header('Strict-Transport-Security', 'max-age=' + constants_1.MAX_INT_VALUE + '; includeSubDomains');
        }
        else if (typeof (resp === null || resp === void 0 ? void 0 : resp.set) === 'function') {
            resp === null || resp === void 0 ? void 0 : resp.set('X-content-type-options', 'nosniff');
            resp === null || resp === void 0 ? void 0 : resp.set('Strict-Transport-Security', 'max-age=' + constants_1.MAX_INT_VALUE + '; includeSubDomains');
        }
        Object.entries(serviceFunctionAnnotationContainer_1.default.getResponseHeadersForServiceFunction(controller[serviceName].constructor, functionName) || {}).forEach(([headerName, headerValueOrGenerator]) => {
            if (typeof headerValueOrGenerator === 'string') {
                if (typeof (resp === null || resp === void 0 ? void 0 : resp.header) === 'function') {
                    resp.header(headerName, headerValueOrGenerator);
                }
                else if (typeof (resp === null || resp === void 0 ? void 0 : resp.set) === 'function') {
                    resp.set(headerName, headerValueOrGenerator);
                }
            }
            else if (typeof headerValueOrGenerator === 'function') {
                const headerValue = headerValueOrGenerator(serviceFunctionArgument, response);
                if (headerValue !== undefined) {
                    if (typeof (resp === null || resp === void 0 ? void 0 : resp.header) === 'function') {
                        resp.header(headerName, headerValue);
                    }
                    else if (typeof (resp === null || resp === void 0 ? void 0 : resp.set) === 'function') {
                        resp.set(headerName, headerValue);
                    }
                }
            }
        });
        const responseStatusCode = serviceFunctionAnnotationContainer_1.default.getResponseStatusCodeForServiceFunction(controller[serviceName].constructor, functionName);
        resp === null || resp === void 0 ? void 0 : resp.status(responseStatusCode && process.env.NODE_ENV !== 'development'
            ? responseStatusCode
            : constants_1.HttpStatusCodes.SUCCESS);
        resp === null || resp === void 0 ? void 0 : resp.send(response);
    }
    catch (errorOrBackkError) {
        storedError = errorOrBackkError;
        if (resp && errorOrBackkError instanceof common_1.HttpException) {
            resp.status(errorOrBackkError.getStatus());
            resp.send(errorOrBackkError.getResponse());
        }
        else if (resp && isBackkError_1.default(errorOrBackkError)) {
            resp.status(errorOrBackkError.statusCode);
            resp.send(errorOrBackkError);
        }
        else {
            if (errorOrBackkError instanceof common_1.HttpException) {
                throw errorOrBackkError;
            }
            else if (isBackkError_1.default(errorOrBackkError)) {
                throw new common_1.HttpException(errorOrBackkError, errorOrBackkError.statusCode);
            }
            throw errorOrBackkError;
        }
    }
    finally {
        if (controller[serviceName] instanceof UserAccountBaseService_1.default || userName) {
            const auditLogEntry = createAuditLogEntry_1.default((_c = userName !== null && userName !== void 0 ? userName : serviceFunctionArgument === null || serviceFunctionArgument === void 0 ? void 0 : serviceFunctionArgument.userName) !== null && _c !== void 0 ? _c : '', (_d = headers['X-Forwarded-For']) !== null && _d !== void 0 ? _d : '', headers.Authorization, controller[serviceName] instanceof UserAccountBaseService_1.default ? functionName : serviceFunctionName, storedError ? 'failure' : 'success', storedError === null || storedError === void 0 ? void 0 : storedError.getStatus(), storedError === null || storedError === void 0 ? void 0 : storedError.getResponse().errorMessage, controller[serviceName] instanceof UserAccountBaseService_1.default
                ? serviceFunctionArgument
                : { _id: response === null || response === void 0 ? void 0 : response._id });
            await (controller === null || controller === void 0 ? void 0 : controller.auditLoggingService).log(auditLogEntry);
        }
    }
}
exports.default = tryExecuteServiceMethod;
//# sourceMappingURL=tryExecuteServiceMethod.js.map