"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = __importDefault(require("mustache"));
const tryExecuteServiceMethod_1 = __importDefault(require("./tryExecuteServiceMethod"));
const forEachAsyncParallel_1 = __importDefault(require("../utils/forEachAsyncParallel"));
const BackkResponse_1 = __importDefault(require("./BackkResponse"));
const forEachAsyncSequential_1 = __importDefault(require("../utils/forEachAsyncSequential"));
const BaseService_1 = __importDefault(require("../service/BaseService"));
const isValidServiceFunctionName_1 = __importDefault(require("./isValidServiceFunctionName"));
const constants_1 = require("../constants/constants");
const callRemoteService_1 = __importDefault(require("../remote/http/callRemoteService"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../errors/backkErrors");
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorages/getClsNamespace"));
async function executeMultiple(isConcurrent, serviceFunctionArgument, controller, headers, options, serviceFunctionCallIdToResponseMap, statusCodes, isTransactional = false) {
    const forEachFunc = isConcurrent ? forEachAsyncParallel_1.default : forEachAsyncSequential_1.default;
    let possibleErrorResponse = null;
    await forEachFunc(Object.entries(serviceFunctionArgument), async ([serviceFunctionCallId, { localOrRemoteServiceFunctionName, serviceFunctionArgument }]) => {
        var _a;
        if (possibleErrorResponse) {
            return;
        }
        const response = new BackkResponse_1.default();
        let renderedServiceFunctionArgument = serviceFunctionArgument;
        if ((_a = ((options === null || options === void 0 ? void 0 : options.shouldAllowTemplatesInMultipleServiceFunctionExecution) && !isConcurrent)) !== null && _a !== void 0 ? _a : false) {
            renderedServiceFunctionArgument = mustache_1.default.render(JSON.stringify(serviceFunctionArgument), serviceFunctionCallIdToResponseMap);
            renderedServiceFunctionArgument = JSON.parse(renderedServiceFunctionArgument);
        }
        if (localOrRemoteServiceFunctionName.includes('/')) {
            if (isTransactional) {
                response.send(createBackkErrorFromErrorCodeMessageAndStatus_1.default(backkErrors_1.BACKK_ERRORS.REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED_INSIDE_TRANSACTION));
                response.status(constants_1.HttpStatusCodes.BAD_REQUEST);
            }
            else if (!(options === null || options === void 0 ? void 0 : options.allowedServiceFunctionsRegExpForRemoteServiceCalls)) {
                response.send(createBackkErrorFromErrorCodeMessageAndStatus_1.default(backkErrors_1.BACKK_ERRORS.ALLOWED_REMOTE_SERVICE_FUNCTIONS_REGEXP_PATTERN_NOT_DEFINED));
                response.status(constants_1.HttpStatusCodes.BAD_REQUEST);
            }
            else if (!localOrRemoteServiceFunctionName.match(options.allowedServiceFunctionsRegExpForRemoteServiceCalls)) {
                response.send(createBackkErrorFromErrorCodeMessageAndStatus_1.default(backkErrors_1.BACKK_ERRORS.REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED));
                response.status(constants_1.HttpStatusCodes.BAD_REQUEST);
            }
            else {
                const [serviceHost, serviceFunctionName] = localOrRemoteServiceFunctionName.split('/');
                const [remoteResponse, error] = await callRemoteService_1.default(`http://${serviceHost}.svc.cluster.local/${serviceFunctionName}`);
                response.send(remoteResponse);
                response.status(error ? error.statusCode : constants_1.HttpStatusCodes.SUCCESS);
            }
        }
        else {
            await tryExecuteServiceMethod_1.default(controller, localOrRemoteServiceFunctionName, renderedServiceFunctionArgument, headers, response, options, false);
        }
        serviceFunctionCallIdToResponseMap[serviceFunctionCallId] = {
            statusCode: response.getStatusCode(),
            response: response.getResponse()
        };
        if (response.getErrorResponse()) {
            possibleErrorResponse = response.getErrorResponse();
        }
        statusCodes.push(response.getStatusCode());
    });
}
async function executeMultipleServiceFunctions(isConcurrent, shouldExecuteInsideTransaction, controller, serviceFunctionCalls, headers, resp, options) {
    const areServiceFunctionCallsValid = Object.values(serviceFunctionCalls).reduce((areCallsValid, serviceFunctionCall) => areCallsValid &&
        typeof serviceFunctionCall.serviceFunctionName === 'string' &&
        isValidServiceFunctionName_1.default(serviceFunctionCall.serviceFunctionName, controller) &&
        (serviceFunctionCall.serviceFunctionArgument === undefined ||
            typeof serviceFunctionCall.serviceFunctionArgument === 'object') &&
        !Array.isArray(serviceFunctionCall.serviceFunctionArgument), true);
    if (!areServiceFunctionCallsValid) {
        throw createErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
            message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message +
                'unknown service(s) or function(s) or invalid argument(s)'
        });
    }
    const serviceFunctionCallIdToResponseMap = {};
    const statusCodes = [];
    const services = Object.values(controller).filter((service) => service instanceof BaseService_1.default);
    const dbManager = services[0].getDbManager();
    const clsNamespace = getClsNamespace_1.default('multipleServiceFunctionExecutions');
    const clsNamespace2 = getClsNamespace_1.default('serviceFunctionExecution');
    await clsNamespace.runAndReturn(async () => {
        await clsNamespace2.runAndReturn(async () => {
            await dbManager.tryReserveDbConnectionFromPool();
            clsNamespace.set('connection', true);
            if (shouldExecuteInsideTransaction) {
                await dbManager.executeInsideTransaction(async () => {
                    clsNamespace.set('globalTransaction', true);
                    await executeMultiple(isConcurrent, serviceFunctionCalls, controller, headers, options, serviceFunctionCallIdToResponseMap, statusCodes, true);
                    clsNamespace.set('globalTransaction', false);
                    return [null, null];
                });
            }
            else {
                clsNamespace.set('globalTransaction', true);
                await executeMultiple(isConcurrent, serviceFunctionCalls, controller, headers, options, serviceFunctionCallIdToResponseMap, statusCodes);
                clsNamespace.set('globalTransaction', false);
            }
            dbManager.tryReleaseDbConnectionBackToPool();
            clsNamespace.set('connection', false);
        });
    });
    resp.status(Math.max(...statusCodes));
    resp.send(serviceFunctionCallIdToResponseMap);
}
exports.default = executeMultipleServiceFunctions;
//# sourceMappingURL=executeMultipleServiceFunctions.js.map