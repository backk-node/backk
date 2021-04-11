"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCronJob = void 0;
const cron_1 = require("cron");
const findAsyncSequential_1 = __importDefault(require("../utils/findAsyncSequential"));
const wait_1 = __importDefault(require("../utils/wait"));
const __Backk__JobScheduling_1 = __importDefault(require("./entities/__Backk__JobScheduling"));
const tryExecuteServiceMethod_1 = __importDefault(require("../execution/tryExecuteServiceMethod"));
const log_1 = require("../observability/logging/log");
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorages/getClsNamespace"));
const scheduledJobs = {};
async function scheduleCronJob(scheduledExecutionTimestampAsDate, retryIntervalsInSecs, dbManager, jobId, controller, serviceFunctionName, serviceFunctionArgument) {
    const job = new cron_1.CronJob(scheduledExecutionTimestampAsDate, async () => {
        await findAsyncSequential_1.default([0, ...retryIntervalsInSecs], async (retryIntervalInSecs) => {
            await wait_1.default(retryIntervalInSecs * 1000);
            const clsNamespace = getClsNamespace_1.default('multipleServiceFunctionExecutions');
            const clsNamespace2 = getClsNamespace_1.default('serviceFunctionExecution');
            return clsNamespace.runAndReturn(async () => {
                return clsNamespace2.runAndReturn(async () => {
                    try {
                        await dbManager.tryReserveDbConnectionFromPool();
                        clsNamespace.set('connection', true);
                        const possibleErrorResponse = await dbManager.executeInsideTransaction(async () => {
                            clsNamespace.set('globalTransaction', true);
                            const possibleErrorResponse = await dbManager.deleteEntityById(__Backk__JobScheduling_1.default, jobId, {
                                entityPreHooks: (jobScheduling) => !!jobScheduling
                            });
                            return (possibleErrorResponse ||
                                tryExecuteServiceMethod_1.default(controller, serviceFunctionName, serviceFunctionArgument !== null && serviceFunctionArgument !== void 0 ? serviceFunctionArgument : {}, {}, undefined, undefined, false));
                        });
                        clsNamespace.set('globalTransaction', true);
                        if (possibleErrorResponse) {
                            return false;
                        }
                        else {
                            delete scheduledJobs[jobId];
                            return true;
                        }
                    }
                    catch (error) {
                        log_1.logError(error);
                        return false;
                    }
                    finally {
                        dbManager.tryReleaseDbConnectionBackToPool();
                        clsNamespace.set('connection', false);
                    }
                });
            });
        });
    });
    scheduledJobs[jobId] = job;
    job.start();
}
exports.scheduleCronJob = scheduleCronJob;
//# sourceMappingURL=scheduleCronJob.js.map