"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const __Backk__CronJobScheduling_1 = __importDefault(require("./entities/__Backk__CronJobScheduling"));
const cron_parser_1 = __importDefault(require("cron-parser"));
const forEachAsyncParallel_1 = __importDefault(require("../utils/forEachAsyncParallel"));
const constants_1 = require("../constants/constants");
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorage/getClsNamespace"));
async function tryInitializeCronJobSchedulingTable(dbManager) {
    const clsNamespace = getClsNamespace_1.default('serviceFunctionExecution');
    await forEachAsyncParallel_1.default(Object.entries(serviceFunctionAnnotationContainer_1.default.getServiceFunctionNameToCronScheduleMap()), async ([serviceFunctionName, cronSchedule]) => {
        const [, error] = await clsNamespace.runAndReturn(async () => {
            await dbManager.tryReserveDbConnectionFromPool();
            const [, error] = await dbManager.executeInsideTransaction(async () => {
                const [entity, error] = await dbManager.getEntityByFilters(__Backk__CronJobScheduling_1.default, { serviceFunctionName }, undefined);
                const interval = cron_parser_1.default.parseExpression(cronSchedule);
                if ((error === null || error === void 0 ? void 0 : error.statusCode) === constants_1.HttpStatusCodes.NOT_FOUND) {
                    return dbManager.createEntity(__Backk__CronJobScheduling_1.default, {
                        serviceFunctionName,
                        lastScheduledTimestamp: new Date(120000),
                        nextScheduledTimestamp: interval.next().toDate()
                    });
                }
                else if (entity) {
                    return dbManager.updateEntity(__Backk__CronJobScheduling_1.default, {
                        _id: entity._id,
                        serviceFunctionName,
                        lastScheduledTimestamp: new Date(120000),
                        nextScheduledTimestamp: interval.next().toDate()
                    });
                }
                return [entity, error];
            });
            dbManager.tryReleaseDbConnectionBackToPool();
            return [null, error];
        });
        if (error) {
            throw new Error(error.message);
        }
    });
}
exports.default = tryInitializeCronJobSchedulingTable;
//# sourceMappingURL=tryInitializeCronJobSchedulingTable.js.map