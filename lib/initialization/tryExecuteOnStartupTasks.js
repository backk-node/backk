"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService_1 = __importDefault(require("../service/BaseService"));
const forEachAsyncSequential_1 = __importDefault(require("../utils/forEachAsyncSequential"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const getClsNamespace_1 = __importDefault(require("../continuationlocalstorage/getClsNamespace"));
async function tryExecuteOnStartUpTasks(controller, dbManager) {
    const clsNamespace = getClsNamespace_1.default('serviceFunctionExecution');
    const [, error] = await clsNamespace.runAndReturn(async () => {
        await dbManager.tryReserveDbConnectionFromPool();
        const [, error] = await dbManager.executeInsideTransaction(async () => {
            const serviceNameToServiceEntries = Object.entries(controller).filter(([, service]) => service instanceof BaseService_1.default);
            try {
                await forEachAsyncSequential_1.default(serviceNameToServiceEntries, async ([, service]) => {
                    await forEachAsyncSequential_1.default(Object.getOwnPropertyNames(Object.getPrototypeOf(service)), async (functionName) => {
                        if (serviceFunctionAnnotationContainer_1.default.hasOnStartUp(service.constructor, functionName)) {
                            const [, error] = await service[functionName]();
                            if (error) {
                                throw error;
                            }
                        }
                    });
                });
            }
            catch (error) {
                return [null, error];
            }
            return [null, null];
        });
        dbManager.tryReleaseDbConnectionBackToPool();
        return [null, error];
    });
    if (error) {
        throw new Error(error.message);
    }
}
exports.default = tryExecuteOnStartUpTasks;
//# sourceMappingURL=tryExecuteOnStartupTasks.js.map