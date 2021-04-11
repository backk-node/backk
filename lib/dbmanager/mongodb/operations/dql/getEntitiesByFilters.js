"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MongoDbQuery_1 = __importDefault(require("../../MongoDbQuery"));
const SqlExpression_1 = __importDefault(require("../../../sql/expressions/SqlExpression"));
const startDbOperation_1 = __importDefault(require("../../../utils/startDbOperation"));
const updateDbLocalTransactionCount_1 = __importDefault(require("../../../sql/operations/dql/utils/updateDbLocalTransactionCount"));
const convertFilterObjectToMongoDbQueries_1 = __importDefault(require("../../convertFilterObjectToMongoDbQueries"));
const getRootOperations_1 = __importDefault(require("../../getRootOperations"));
const convertUserDefinedFiltersToMatchExpression_1 = __importDefault(require("../../convertUserDefinedFiltersToMatchExpression"));
const convertMongoDbQueriesToMatchExpression_1 = __importDefault(require("../../convertMongoDbQueriesToMatchExpression"));
const replaceIdStringsWithObjectIds_1 = __importDefault(require("../../replaceIdStringsWithObjectIds"));
const cls_hooked_1 = require("cls-hooked");
const mongodb_1 = require("mongodb");
const getJoinPipelines_1 = __importDefault(require("../../getJoinPipelines"));
const getTableName_1 = __importStar(require("../../../utils/getTableName"));
const getFieldOrdering_1 = __importDefault(require("../../getFieldOrdering"));
const performPostQueryOperations_1 = __importDefault(require("../../performPostQueryOperations"));
const tryFetchAndAssignSubEntitiesForManyToManyRelationships_1 = __importDefault(require("../../tryFetchAndAssignSubEntitiesForManyToManyRelationships"));
const paginateSubEntities_1 = __importDefault(require("../../paginateSubEntities"));
const removePrivateProperties_1 = __importDefault(require("../../removePrivateProperties"));
const decryptEntities_1 = __importDefault(require("../../../../crypt/decryptEntities"));
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const recordDbOperationDuration_1 = __importDefault(require("../../../utils/recordDbOperationDuration"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../../../sql/operations/transaction/tryStartLocalTransactionIfNeeded"));
const tryExecutePreHooks_1 = __importDefault(require("../../../hooks/tryExecutePreHooks"));
const tryExecuteEntitiesPostHook_1 = __importDefault(require("../../../hooks/tryExecuteEntitiesPostHook"));
async function getEntitiesByFilters(dbManager, filters, EntityClass, options, isRecursive = false, isInternalCall = false) {
    var _a, _b, _c;
    const dbOperationStartTimeInMillis = startDbOperation_1.default(dbManager, 'getEntitiesByFilters');
    let matchExpression;
    let finalFilters;
    if (typeof filters === 'object' && !Array.isArray(filters)) {
        finalFilters = convertFilterObjectToMongoDbQueries_1.default(filters);
    }
    else {
        finalFilters = filters;
    }
    if (Array.isArray(finalFilters) && (finalFilters === null || finalFilters === void 0 ? void 0 : finalFilters.find((filter) => filter instanceof SqlExpression_1.default))) {
        throw new Error('SqlExpression is not supported for MongoDB');
    }
    else {
        const rootFilters = getRootOperations_1.default(finalFilters, EntityClass, dbManager.getTypes());
        const rootUserDefinedFilters = rootFilters.filter((filter) => !(filter instanceof MongoDbQuery_1.default));
        const rootMongoDbQueries = rootFilters.filter((filter) => filter instanceof MongoDbQuery_1.default);
        const userDefinedFiltersMatchExpression = convertUserDefinedFiltersToMatchExpression_1.default(rootUserDefinedFilters);
        const mongoDbQueriesMatchExpression = convertMongoDbQueriesToMatchExpression_1.default(rootMongoDbQueries);
        matchExpression = {
            ...userDefinedFiltersMatchExpression,
            ...mongoDbQueriesMatchExpression
        };
    }
    replaceIdStringsWithObjectIds_1.default(matchExpression);
    EntityClass = dbManager.getType(EntityClass);
    const Types = dbManager.getTypes();
    let shouldUseTransaction = false;
    try {
        if ((options === null || options === void 0 ? void 0 : options.preHooks) || (options === null || options === void 0 ? void 0 : options.postHook)) {
            shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        }
        if (!isRecursive) {
            updateDbLocalTransactionCount_1.default(dbManager);
        }
        let isSelectForUpdate = false;
        if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = dbManager.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = dbManager.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
            isSelectForUpdate = true;
        }
        const entities = await dbManager.tryExecute(shouldUseTransaction, async (client) => {
            var _a;
            if (isSelectForUpdate) {
                await client
                    .db(dbManager.dbName)
                    .collection(EntityClass.name.toLowerCase())
                    .updateMany(matchExpression, { $set: { _backkLock: new mongodb_1.ObjectId() } });
            }
            if (options === null || options === void 0 ? void 0 : options.preHooks) {
                await tryExecutePreHooks_1.default(options.preHooks);
            }
            const joinPipelines = getJoinPipelines_1.default(EntityClass, Types);
            const cursor = client
                .db(dbManager.dbName)
                .collection(getTableName_1.default(EntityClass.name))
                .aggregate([...joinPipelines, getFieldOrdering_1.default(Types[getTableName_1.getEntityName(EntityClass.name)])])
                .match(matchExpression);
            performPostQueryOperations_1.default(cursor, options === null || options === void 0 ? void 0 : options.postQueryOperations, EntityClass, Types);
            const rows = await cursor.toArray();
            await tryFetchAndAssignSubEntitiesForManyToManyRelationships_1.default(dbManager, rows, EntityClass, dbManager.getTypes(), finalFilters, options === null || options === void 0 ? void 0 : options.postQueryOperations, isInternalCall);
            paginateSubEntities_1.default(rows, (_a = options === null || options === void 0 ? void 0 : options.postQueryOperations) === null || _a === void 0 ? void 0 : _a.paginations, EntityClass, dbManager.getTypes());
            removePrivateProperties_1.default(rows, EntityClass, dbManager.getTypes(), isInternalCall);
            decryptEntities_1.default(rows, EntityClass, dbManager.getTypes(), false);
            return rows;
        });
        if (options === null || options === void 0 ? void 0 : options.postHook) {
            await tryExecuteEntitiesPostHook_1.default(options.postHook, entities);
        }
        return [entities, null];
    }
    catch (errorOrBackkError) {
        return isBackkError_1.default(errorOrBackkError)
            ? [null, errorOrBackkError]
            : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
    }
    finally {
        recordDbOperationDuration_1.default(dbManager, dbOperationStartTimeInMillis);
    }
}
exports.default = getEntitiesByFilters;
//# sourceMappingURL=getEntitiesByFilters.js.map