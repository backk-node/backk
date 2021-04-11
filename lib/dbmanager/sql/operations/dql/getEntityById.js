"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transformRowsToObjects_1 = __importDefault(require("./transformresults/transformRowsToObjects"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const DefaultPostQueryOperations_1 = __importDefault(require("../../../../types/postqueryoperations/DefaultPostQueryOperations"));
const getSqlSelectStatementParts_1 = __importDefault(require("./utils/getSqlSelectStatementParts"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const cls_hooked_1 = require("cls-hooked");
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const tryExecutePreHooks_1 = __importDefault(require("../../../hooks/tryExecutePreHooks"));
async function getEntityById(dbManager, _id, EntityClass, options, isSelectForUpdate = false, isInternalCall = false) {
    var _a, _b, _c, _d, _e, _f;
    EntityClass = dbManager.getType(EntityClass);
    const finalPostQueryOperations = (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) !== null && _a !== void 0 ? _a : new DefaultPostQueryOperations_1.default();
    let didStartTransaction = false;
    try {
        if (((_b = finalPostQueryOperations === null || finalPostQueryOperations === void 0 ? void 0 : finalPostQueryOperations.includeResponseFields) === null || _b === void 0 ? void 0 : _b.length) === 1 &&
            finalPostQueryOperations.includeResponseFields[0] === '_id') {
            return { _id };
        }
        if ((options === null || options === void 0 ? void 0 : options.postHook) || (options === null || options === void 0 ? void 0 : options.preHooks) || (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn)) {
            didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        }
        await tryExecutePreHooks_1.default((_c = options === null || options === void 0 ? void 0 : options.preHooks) !== null && _c !== void 0 ? _c : []);
        updateDbLocalTransactionCount_1.default(dbManager);
        if (((_d = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _d === void 0 ? void 0 : _d.get('globalTransaction')) || ((_e = dbManager.getClsNamespace()) === null || _e === void 0 ? void 0 : _e.get('globalTransaction')) || ((_f = dbManager.getClsNamespace()) === null || _f === void 0 ? void 0 : _f.get('localTransaction'))) {
            isSelectForUpdate = true;
        }
        const { columns, joinClauses, outerSortClause } = getSqlSelectStatementParts_1.default(dbManager, finalPostQueryOperations, EntityClass, undefined, isInternalCall);
        const typeMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
        const idFieldName = typeMetadata._id ? '_id' : 'id';
        const numericId = parseInt(_id, 10);
        if (isNaN(numericId)) {
            throw createErrorFromErrorCodeMessageAndStatus_1.default({
                ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + idFieldName + ' must be a numeric id'
            });
        }
        const tableName = getTableName_1.default(EntityClass.name);
        const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();
        const selectStatement = [
            `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName}`,
            `WHERE ${idFieldName} = ${dbManager.getValuePlaceholder(1)} LIMIT 1) AS ${tableAlias}`,
            joinClauses,
            outerSortClause,
            isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
        ]
            .filter((sqlPart) => sqlPart)
            .join(' ');
        const result = await dbManager.tryExecuteQuery(selectStatement, [numericId]);
        let entity, error = null;
        if (dbManager.getResultRows(result).length === 0 && (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn)) {
            [entity, error] = await (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn());
        }
        else {
            if (dbManager.getResultRows(result).length === 0) {
                await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
                return [
                    null,
                    createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                        ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                        message: `${EntityClass.name} with _id ${_id} not found`
                    })
                ];
            }
            entity = transformRowsToObjects_1.default(dbManager.getResultRows(result), EntityClass, finalPostQueryOperations, dbManager, isInternalCall)[0];
        }
        if (options === null || options === void 0 ? void 0 : options.postHook) {
            await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, entity);
        }
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [entity, error];
    }
    catch (error) {
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, createBackkErrorFromError_1.default(error)];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = getEntityById;
//# sourceMappingURL=getEntityById.js.map