"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const getEntityById_1 = __importDefault(require("../dql/getEntityById"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("../../../hooks/tryExecuteEntityPreHooks"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
async function removeFieldValues(dbManager, _id, fieldName, fieldValues, EntityClass, options) {
    var _a;
    if (fieldName.includes('.')) {
        throw new Error('fieldName parameter may not contain dots, i.e. it cannot be a field path name');
    }
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        const [currentEntity, error] = await getEntityById_1.default(dbManager, _id, EntityClass, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true, true);
        if (!currentEntity) {
            throw error;
        }
        await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
        const promises = [];
        const foreignIdFieldName = EntityClass.name.charAt(0).toLowerCase() + EntityClass.name.slice(1) + 'Id';
        const numericId = parseInt(_id, 10);
        if (isNaN(numericId)) {
            throw createErrorFromErrorCodeMessageAndStatus_1.default({
                ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + '_id: must be a numeric id'
            });
        }
        promises.push(forEachAsyncParallel_1.default(fieldValues, async (fieldValue) => {
            const deleteStatement = `DELETE FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase() +
                '_' +
                fieldName
                    .slice(0, -1)
                    .toLowerCase()} WHERE ${foreignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)} AND ${fieldName.slice(0, -1).toLowerCase()} = ${dbManager.getValuePlaceholder(2)}`;
            await dbManager.tryExecuteSql(deleteStatement, [_id, fieldValue]);
        }));
        const columns = [];
        const values = [];
        if (currentEntity === null || currentEntity === void 0 ? void 0 : currentEntity.version) {
            columns.push('version');
            values.push(currentEntity.version + 1);
        }
        if (currentEntity.lastModifiedTimestamp) {
            columns.push('lastModifiedTimestamp');
            values.push(new Date());
        }
        const setStatements = columns
            .map((fieldName, index) => fieldName.toLowerCase() + ' = ' + dbManager.getValuePlaceholder(index + 1))
            .join(', ');
        if (setStatements) {
            let sqlStatement = `UPDATE ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} SET ${setStatements}`;
            if (numericId !== undefined) {
                sqlStatement += ` WHERE _id = ${dbManager.getValuePlaceholder(columns.length + 1)}`;
            }
            promises.push(dbManager.tryExecuteQuery(sqlStatement, numericId === undefined ? values : [...values, numericId]));
        }
        await Promise.all(promises);
        if (options === null || options === void 0 ? void 0 : options.postHook) {
            await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, null);
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
exports.default = removeFieldValues;
//# sourceMappingURL=removeFieldValues.js.map