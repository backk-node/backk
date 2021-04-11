"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __Backk__JobScheduling_1 = __importDefault(require("./entities/__Backk__JobScheduling"));
const class_validator_1 = require("class-validator");
const getValidationErrors_1 = __importDefault(require("../validation/getValidationErrors"));
const createErrorFromErrorMessageAndThrowError_1 = __importDefault(require("../errors/createErrorFromErrorMessageAndThrowError"));
const createErrorMessageWithStatusCode_1 = __importDefault(require("../errors/createErrorMessageWithStatusCode"));
const constants_1 = require("../constants/constants");
const class_transformer_1 = require("class-transformer");
const JobScheduling_1 = __importDefault(require("./entities/JobScheduling"));
const scheduleCronJob_1 = require("./scheduleCronJob");
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../errors/backkErrors");
const emptyError_1 = __importDefault(require("../errors/emptyError"));
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorages/getClsNamespace"));
async function tryScheduleJobExecution(controller, scheduledExecutionArgument, headers, resp) {
    const instantiatedScheduledExecutionArgument = class_transformer_1.plainToClass(JobScheduling_1.default, scheduledExecutionArgument);
    try {
        await class_validator_1.validateOrReject(instantiatedScheduledExecutionArgument, {
            whitelist: true,
            forbidNonWhitelisted: true
        });
    }
    catch (validationErrors) {
        const errorMessage = `Error code ${backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.errorCode}:${backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message}:` +
            getValidationErrors_1.default(validationErrors);
        createErrorFromErrorMessageAndThrowError_1.default(createErrorMessageWithStatusCode_1.default(errorMessage, constants_1.HttpStatusCodes.BAD_REQUEST));
    }
    const { serviceFunctionName, scheduledExecutionTimestamp, serviceFunctionArgument, retryIntervalsInSecs } = scheduledExecutionArgument;
    const [serviceName, functionName] = serviceFunctionName.split('.');
    if (!controller[serviceName]) {
        throw createErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE,
            message: backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE.message + serviceName
        });
    }
    const serviceFunctionResponseValueTypeName = controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap[functionName];
    if (!controller[serviceName][functionName] || !serviceFunctionResponseValueTypeName) {
        throw createErrorFromErrorCodeMessageAndStatus_1.default({
            ...backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION,
            message: backkErrors_1.BACKK_ERRORS.UNKNOWN_SERVICE_FUNCTION.message + serviceFunctionName
        });
    }
    const retryIntervalsInSecsStr = retryIntervalsInSecs.join(',');
    const serviceFunctionArgumentStr = serviceFunctionArgument ? JSON.stringify(serviceFunctionArgument) : '';
    const scheduledExecutionTimestampAsDate = new Date(Date.parse(scheduledExecutionTimestamp));
    const dbManager = controller[serviceName].getDbManager();
    let entity = null;
    let error = emptyError_1.default;
    const clsNamespace = getClsNamespace_1.default('serviceFunctionExecution');
    await clsNamespace.runAndReturn(async () => {
        await dbManager.tryReserveDbConnectionFromPool();
        [entity, error] = await dbManager.createEntity(__Backk__JobScheduling_1.default, {
            serviceFunctionName,
            retryIntervalsInSecs: retryIntervalsInSecsStr,
            scheduledExecutionTimestamp: scheduledExecutionTimestampAsDate,
            serviceFunctionArgument: serviceFunctionArgumentStr
        });
        dbManager.tryReleaseDbConnectionBackToPool();
    });
    if (error) {
        throw error;
    }
    const jobId = entity._id;
    await scheduleCronJob_1.scheduleCronJob(scheduledExecutionTimestampAsDate, retryIntervalsInSecs, dbManager, jobId, controller, serviceFunctionName, { ...serviceFunctionArgument, jobId });
    resp === null || resp === void 0 ? void 0 : resp.send({
        jobId
    });
}
exports.default = tryScheduleJobExecution;
//# sourceMappingURL=tryScheduleJobExecution.js.map