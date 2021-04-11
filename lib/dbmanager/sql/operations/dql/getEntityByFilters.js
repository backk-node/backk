"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transformRowsToObjects_1 = __importDefault(require("./transformresults/transformRowsToObjects"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getSqlSelectStatementParts_1 = __importDefault(require("./utils/getSqlSelectStatementParts"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
const MongoDbQuery_1 = __importDefault(require("../../../mongodb/MongoDbQuery"));
const convertFilterObjectToSqlEquals_1 = __importDefault(require("./utils/convertFilterObjectToSqlEquals"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
const cls_hooked_1 = require("cls-hooked");
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryExecutePreHooks_1 = __importDefault(require("../../../hooks/tryExecutePreHooks"));
const DefaultPostQueryOperations_1 = __importDefault(require("../../../../types/postqueryoperations/DefaultPostQueryOperations"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
async function getEntityByFilters(dbManager, filters, EntityClass, options, isSelectForUpdate = false, isInternalCall = false) {
    var _a, _b, _c, _d, _e, _f;
    if (typeof filters === 'object' && !Array.isArray(filters)) {
        filters = convertFilterObjectToSqlEquals_1.default(filters);
    }
    else if (filters.find((filter) => filter instanceof MongoDbQuery_1.default)) {
        throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
    }
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        if ((options === null || options === void 0 ? void 0 : options.preHooks) || (options === null || options === void 0 ? void 0 : options.postHook) || (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn)) {
            didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        }
        updateDbLocalTransactionCount_1.default(dbManager);
        await tryExecutePreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.preHooks) !== null && _a !== void 0 ? _a : []);
        if (((_b = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = dbManager.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('globalTransaction')) || ((_d = dbManager.getClsNamespace()) === null || _d === void 0 ? void 0 : _d.get('localTransaction'))) {
            isSelectForUpdate = true;
        }
        const { rootWhereClause, rootSortClause, rootPaginationClause, columns, joinClauses, filterValues, outerSortClause } = getSqlSelectStatementParts_1.default(dbManager, (_e = options === null || options === void 0 ? void 0 : options.postQueryOperations) !== null && _e !== void 0 ? _e : new DefaultPostQueryOperations_1.default(), EntityClass, filters, isInternalCall);
        const tableName = getTableName_1.default(EntityClass.name);
        const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();
        const selectStatement = [
            `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName}`,
            rootWhereClause,
            rootSortClause,
            rootPaginationClause,
            `) AS ${tableAlias}`,
            joinClauses,
            outerSortClause,
            isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
        ]
            .filter((sqlPart) => sqlPart)
            .join(' ');
        const result = await dbManager.tryExecuteQueryWithNamedParameters(selectStatement, filterValues);
        const entities = transformRowsToObjects_1.default(dbManager.getResultRows(result), EntityClass, (_f = options === null || options === void 0 ? void 0 : options.postQueryOperations) !== null && _f !== void 0 ? _f : new DefaultPostQueryOperations_1.default(), dbManager, isInternalCall);
        let entity = entities[0], error;
        if ((entities === null || entities === void 0 ? void 0 : entities.length) === 0) {
            if (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundReturn) {
                [entity, error] = await options.ifEntityNotFoundReturn();
                entities.push(entity);
            }
            else {
                return [
                    null,
                    createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                        ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                        message: `${EntityClass.name} with given filter(s) not found`
                    })
                ];
            }
        }
        if (options === null || options === void 0 ? void 0 : options.postHook) {
            await tryExecutePostHook_1.default(options.postHook, entity);
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
exports.default = getEntityByFilters;
//# sourceMappingURL=getEntityByFilters.js.map