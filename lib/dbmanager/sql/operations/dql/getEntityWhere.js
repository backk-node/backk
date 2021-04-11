"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultPostQueryOperations_1 = __importDefault(require("../../../../types/postqueryoperations/DefaultPostQueryOperations"));
const getSqlSelectStatementParts_1 = __importDefault(require("./utils/getSqlSelectStatementParts"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
const isUniqueField_1 = __importDefault(require("./utils/isUniqueField"));
const SqlEquals_1 = __importDefault(require("../../expressions/SqlEquals"));
const transformRowsToObjects_1 = __importDefault(require("./transformresults/transformRowsToObjects"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const cls_hooked_1 = require("cls-hooked");
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
const tryExecutePreHooks_1 = __importDefault(require("../../../hooks/tryExecutePreHooks"));
async function getEntityWhere(dbManager, fieldPathName, fieldValue, EntityClass, preHooks, postQueryOperations, postHook, ifEntityNotFoundReturn, isSelectForUpdate = false, isInternalCall = false) {
    var _a, _b, _c;
    if (!isUniqueField_1.default(fieldPathName, EntityClass, dbManager.getTypes())) {
        throw new Error(`Field ${fieldPathName} is not unique. Annotate entity field with @Unique annotation`);
    }
    EntityClass = dbManager.getType(EntityClass);
    const finalPostQueryOperations = postQueryOperations !== null && postQueryOperations !== void 0 ? postQueryOperations : new DefaultPostQueryOperations_1.default();
    let didStartTransaction = false;
    try {
        if (postHook || preHooks || ifEntityNotFoundReturn) {
            didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        }
        await tryExecutePreHooks_1.default(preHooks !== null && preHooks !== void 0 ? preHooks : []);
        if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = dbManager.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = dbManager.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
            isSelectForUpdate = true;
        }
        updateDbLocalTransactionCount_1.default(dbManager);
        const lastDotPosition = fieldPathName.lastIndexOf('.');
        const fieldName = lastDotPosition === -1 ? fieldPathName : fieldPathName.slice(lastDotPosition + 1);
        const filters = [
            new SqlEquals_1.default({ [fieldName]: fieldValue }, lastDotPosition === -1 ? '' : fieldPathName.slice(0, lastDotPosition))
        ];
        const { rootWhereClause, columns, joinClauses, filterValues, outerSortClause } = getSqlSelectStatementParts_1.default(dbManager, finalPostQueryOperations, EntityClass, filters, isInternalCall);
        const tableName = getTableName_1.default(EntityClass.name);
        const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();
        const selectStatement = [
            `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName}`,
            rootWhereClause,
            `LIMIT 1) AS ${tableAlias}`,
            joinClauses,
            outerSortClause,
            isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
        ]
            .filter((sqlPart) => sqlPart)
            .join(' ');
        const result = await dbManager.tryExecuteQueryWithNamedParameters(selectStatement, filterValues);
        let entity, error = null;
        if (dbManager.getResultRows(result).length === 0 && ifEntityNotFoundReturn) {
            [entity, error] = await ifEntityNotFoundReturn();
        }
        else {
            if (dbManager.getResultRows(result).length === 0) {
                await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
                return [
                    null,
                    createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                        ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                        message: `${EntityClass.name} with ${fieldName}: ${fieldValue} not found`
                    })
                ];
            }
            entity = transformRowsToObjects_1.default(dbManager.getResultRows(result), EntityClass, finalPostQueryOperations, dbManager, isInternalCall)[0];
        }
        if (postHook) {
            await tryExecutePostHook_1.default(postHook, entity);
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
exports.default = getEntityWhere;
//# sourceMappingURL=getEntityWhere.js.map