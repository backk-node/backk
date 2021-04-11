"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncParallel_1 = __importDefault(require("../../../../utils/forEachAsyncParallel"));
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryStartLocalTransactionIfNeeded"));
const tryCommitLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryCommitLocalTransactionIfNeeded"));
const tryRollbackLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/tryRollbackLocalTransactionIfNeeded"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../transaction/cleanupLocalTransactionIfNeeded"));
const tryGetWhereClause_1 = __importDefault(require("../dql/clauses/tryGetWhereClause"));
const getFilterValues_1 = __importDefault(require("../dql/utils/getFilterValues"));
const MongoDbQuery_1 = __importDefault(require("../../../mongodb/MongoDbQuery"));
const convertFilterObjectToSqlEquals_1 = __importDefault(require("../dql/utils/convertFilterObjectToSqlEquals"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const tryExecuteEntityPreHooks_1 = __importDefault(require("../../../hooks/tryExecuteEntityPreHooks"));
const getEntityByFilters_1 = __importDefault(require("../dql/getEntityByFilters"));
const tryExecutePostHook_1 = __importDefault(require("../../../hooks/tryExecutePostHook"));
async function deleteEntityByFilters(dbManager, filters, EntityClass, options) {
    if (typeof filters === 'object' && !Array.isArray(filters)) {
        filters = convertFilterObjectToSqlEquals_1.default(filters);
    }
    else if (filters.find((filter) => filter instanceof MongoDbQuery_1.default)) {
        throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
    }
    const nonRootFilters = filters.find((filter) => filter.subEntityPath !== '');
    if (nonRootFilters) {
        throw new Error('All filters must have subEntityPath empty, ie. they must be root filters');
    }
    EntityClass = dbManager.getType(EntityClass);
    let didStartTransaction = false;
    try {
        didStartTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        let currentEntity, error;
        if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
            [currentEntity, error] = await getEntityByFilters_1.default(dbManager, filters, EntityClass, { postQueryOperations: options === null || options === void 0 ? void 0 : options.postQueryOperations }, true);
            if (!currentEntity) {
                throw error;
            }
            await tryExecuteEntityPreHooks_1.default(options === null || options === void 0 ? void 0 : options.entityPreHooks, currentEntity);
        }
        const whereClause = tryGetWhereClause_1.default(dbManager, '', filters);
        const filterValues = getFilterValues_1.default(filters);
        await Promise.all([
            forEachAsyncParallel_1.default(Object.values(entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name] || {}), async (joinSpec) => {
                if (!joinSpec.isReadonly) {
                    await dbManager.tryExecuteQueryWithNamedParameters(`DELETE FROM ${dbManager.schema.toLowerCase()}.${joinSpec.subEntityTableName.toLowerCase()} WHERE ${joinSpec.subEntityForeignIdFieldName.toLowerCase()} IN (SELECT _id FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} ${whereClause})`, filterValues);
                }
            }),
            forEachAsyncParallel_1.default(entityAnnotationContainer_1.default.manyToManyRelationTableSpecs, async ({ associationTableName, entityForeignIdFieldName }) => {
                if (associationTableName.startsWith(EntityClass.name + '_')) {
                    await dbManager.tryExecuteQueryWithNamedParameters(`DELETE FROM ${dbManager.schema.toLowerCase()}.${associationTableName.toLowerCase()} WHERE ${entityForeignIdFieldName.toLowerCase()} IN (SELECT _id FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} ${whereClause})`, filterValues);
                }
            }),
            dbManager.tryExecuteQueryWithNamedParameters(`DELETE FROM ${dbManager.schema.toLowerCase()}.${EntityClass.name.toLowerCase()} ${whereClause}`, filterValues)
        ]);
        if (options === null || options === void 0 ? void 0 : options.postHook) {
            await tryExecutePostHook_1.default(options === null || options === void 0 ? void 0 : options.postHook, currentEntity);
        }
        await tryCommitLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, null];
    }
    catch (errorOrBackkError) {
        await tryRollbackLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
        return [null, isBackkError_1.default(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError_1.default(errorOrBackkError)];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(didStartTransaction, dbManager);
    }
}
exports.default = deleteEntityByFilters;
//# sourceMappingURL=deleteEntityByFilters.js.map