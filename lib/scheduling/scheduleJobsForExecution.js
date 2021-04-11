"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledJobs = void 0;
const findAsyncSequential_1 = __importDefault(require("../utils/findAsyncSequential"));
const wait_1 = __importDefault(require("../utils/wait"));
const __Backk__JobScheduling_1 = __importDefault(require("./entities/__Backk__JobScheduling"));
const log_1 = require("../observability/logging/log");
const forEachAsyncParallel_1 = __importDefault(require("../utils/forEachAsyncParallel"));
const scheduleCronJob_1 = require("./scheduleCronJob");
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorages/getClsNamespace"));
exports.scheduledJobs = null;
async function scheduleJobsForExecution(controller, dbManager) {
    if (!controller) {
        return false;
    }
    await findAsyncSequential_1.default([0, 1, 2, 5, 10, 30, 60, 120, 300, 600], async (retryDelayInSecs) => {
        await wait_1.default(retryDelayInSecs * 1000);
        const clsNamespace = getClsNamespace_1.default('serviceFunctionExecution');
        await clsNamespace.runAndReturn(async () => {
            try {
                await dbManager.tryReserveDbConnectionFromPool();
                [exports.scheduledJobs] = await dbManager.getAllEntities(__Backk__JobScheduling_1.default);
                dbManager.tryReleaseDbConnectionBackToPool();
            }
            catch (error) {
            }
        });
        return !!exports.scheduledJobs;
    });
    if (!exports.scheduledJobs) {
        log_1.logError(new Error('Unable to load scheduled jobs from database'));
        return false;
    }
    await forEachAsyncParallel_1.default(exports.scheduledJobs, async ({ _id, retryIntervalsInSecs, scheduledExecutionTimestamp, serviceFunctionName, serviceFunctionArgument }) => {
        await scheduleCronJob_1.scheduleCronJob(scheduledExecutionTimestamp, retryIntervalsInSecs.split(',').map((retryIntervalInSecs) => parseInt(retryIntervalInSecs, 10)), dbManager, _id, controller, serviceFunctionName, serviceFunctionArgument ? JSON.parse(serviceFunctionArgument) : undefined);
    });
    return true;
}
exports.default = scheduleJobsForExecution;
//# sourceMappingURL=scheduleJobsForExecution.js.map