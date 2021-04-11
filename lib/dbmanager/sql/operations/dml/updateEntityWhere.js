"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const getEntityWhere_1 = __importDefault(require("../dql/getEntityWhere"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("../../../hooks/tryExecuteEntityPreHooks"));
async function updateEntityWhere(dbManager, fieldPathName, fieldValue, entity, EntityClass, entityPreHooks, postHook, postQueryOperations) {
    var _a;
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        let [currentEntity, error] = await getEntityWhere_1.default(dbManager, fieldPathName, fieldValue, EntityClass, undefined, postQueryOperations, undefined, undefined, true);
        if (!currentEntity) {
            throw error;
        }
        await tryExecuteEntityPreHooks_1.default(entityPreHooks !== null && entityPreHooks !== void 0 ? entityPreHooks : [], currentEntity);
        [, error] = await dbManager.updateEntity(EntityClass, { _id: (_a = currentEntity === null || currentEntity === void 0 ? void 0 : currentEntity._id) !== null && _a !== void 0 ? _a : "", ...entity });
        if (postHook) {
            await tryExecutePostHook_1.default(postHook, null);
        }
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, error];
    }
    catch (errorOrBackkError) {
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, isBackkError_1.default(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError_1.default(errorOrBackkError)];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = updateEntityWhere;
//# sourceMappingURL=updateEntityWhere.js.map