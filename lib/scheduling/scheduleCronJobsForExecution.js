"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const cron_parser_1 = __importDefault(require("cron-parser"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const __Backk__CronJobScheduling_1 = __importDefault(require("./entities/__Backk__CronJobScheduling"));
const findAsyncSequential_1 = __importDefault(require("../utils/findAsyncSequential"));
const wait_1 = __importDefault(require("../utils/wait"));
const log_1 = require("../observability/logging/log");
const tryExecuteServiceMethod_1 = __importDefault(require("../execution/tryExecuteServiceMethod"));
const findServiceFunctionArgumentType_1 = __importDefault(require("../metadata/findServiceFunctionArgumentType"));
const BackkResponse_1 = __importDefault(require("../execution/BackkResponse"));
const constants_1 = require("../constants/constants");
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorage/getClsNamespace"));
const cronJobs = {};
function scheduleCronJobsForExecution(controller, dbManager) {
    if (process.env.NODE_ENV === 'development') {
        return;
    }
    Object.entries(serviceFunctionAnnotationContainer_1.default.getServiceFunctionNameToCronScheduleMap()).forEach(([serviceFunctionName, cronSchedule]) => {
        const job = new cron_1.CronJob(cronSchedule, async () => {
            const retryIntervalsInSecs = serviceFunctionAnnotationContainer_1.default.getServiceFunctionNameToRetryIntervalsInSecsMap()[serviceFunctionName];
            const interval = cron_parser_1.default.parseExpression(cronSchedule);
            await findAsyncSequential_1.default([0, ...retryIntervalsInSecs], async (retryIntervalInSecs) => {
                await wait_1.default(retryIntervalInSecs * 1000);
                return getClsNamespace_1.default('multipleServiceFunctionExecutions').runAndReturn(async () => {
                    return getClsNamespace_1.default('serviceFunctionExecution').runAndReturn(async () => {
                        try {
                            await dbManager.tryReserveDbConnectionFromPool();
                            getClsNamespace_1.default('multipleServiceFunctionExecutions').set('connection', true);
                            const [, error] = await dbManager.executeInsideTransaction(async () => {
                                getClsNamespace_1.default('multipleServiceFunctionExecutions').set('globalTransaction', true);
                                const [, error] = await dbManager.updateEntityByFilters(__Backk__CronJobScheduling_1.default, { serviceFunctionName }, {
                                    lastScheduledTimestamp: new Date(),
                                    nextScheduledTimestamp: interval.next().toDate()
                                }, {
                                    entityPreHooks: {
                                        shouldSucceedOrBeTrue: ({ nextScheduledTimestamp }) => Math.abs(Date.now() - nextScheduledTimestamp.valueOf()) < constants_1.Values._500
                                    }
                                });
                                if ((error === null || error === void 0 ? void 0 : error.statusCode) === constants_1.HttpStatusCodes.BAD_REQUEST) {
                                    return [null, null];
                                }
                                if (error) {
                                    return [null, error];
                                }
                                const ServiceFunctionArgType = findServiceFunctionArgumentType_1.default(controller, serviceFunctionName);
                                const serviceFunctionArgument = ServiceFunctionArgType ? new ServiceFunctionArgType() : {};
                                const response = new BackkResponse_1.default();
                                await tryExecuteServiceMethod_1.default(controller, serviceFunctionName, serviceFunctionArgument, {}, response, undefined, false);
                                return [null, response.getErrorResponse()];
                            });
                            getClsNamespace_1.default('multipleServiceFunctionExecutions').set('globalTransaction', true);
                            return !error;
                        }
                        catch (error) {
                            log_1.logError(error);
                            return false;
                        }
                        finally {
                            dbManager.tryReleaseDbConnectionBackToPool();
                            getClsNamespace_1.default('multipleServiceFunctionExecutions').set('connection', false);
                        }
                    });
                });
            });
        });
        cronJobs[serviceFunctionName] = job;
        job.start();
    });
}
exports.default = scheduleCronJobsForExecution;
//# sourceMappingURL=scheduleCronJobsForExecution.js.map