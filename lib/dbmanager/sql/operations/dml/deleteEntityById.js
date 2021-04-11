"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const getEntityById_1 = __importDefault(require("../dql/getEntityById"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("../../../hooks/tryExecuteEntityPreHooks"));
async function deleteEntityById(dbManager, _id, EntityClass, entityPreHooks, postHook, postQueryOperations, isRecursive = false) {
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        let currentEntity, error;
        if (entityPreHooks) {
            [currentEntity, error] = await getEntityById_1.default(dbManager, _id, EntityClass, { postQueryOperations }, true, true);
            if (!currentEntity) {
                throw error;
            }
            await tryExecuteEntityPreHooks_1.default(entityPreHooks, currentEntity);
        }
        const numericId = parseInt(_id, 10);
        if (isNaN(numericId)) {
            throw createErrorFromErrorCodeMessageAndStatus_1.default({
                ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + '_id: must be a numeric id'
            });
        }
        await Promise.all([
            forEachAsyncParallel_1.default(Object.values(entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name] || {}), async (joinSpec) => {
                if (!joinSpec.isReadonly) {
                    await dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${joinSpec.subEntityTableName.toLowerCase()} WHERE ${joinSpec.subEntityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)}`, [numericId]);
                }
            }),
            forEachAsyncParallel_1.default(entityAnnotationContainer_1.default.manyToManyRelationTableSpecs, async ({ associationTableName, entityForeignIdFieldName }) => {
                if (associationTableName.startsWith(EntityClass.name + '_')) {
                    const sqlStatement = `DELETE FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)}`;
                    await dbManager.tryExecuteSql(sqlStatement, [numericId]);
                }
            }),
            isRecursive ? Promise.resolve(undefined) : dbManager.tryExecuteSql(`DELETE FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} WHERE ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()}._id = ${dbManager.getValuePlaceholder(1)}`, [numericId])
        ]);
        if (postHook) {
            await tryExecutePostHook_1.default(postHook, currentEntity);
        }
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, null];
    }
    catch (errorOrBackkError) {
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [
            null,
            isBackkError_1.default(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError_1.default(errorOrBackkError)
        ];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = deleteEntityById;
//# sourceMappingURL=deleteEntityById.js.map