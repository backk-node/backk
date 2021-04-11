"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryExecuteEntityPreHooks_1 = __importDefault(require("../hooks/tryExecuteEntityPreHooks"));
const startDbOperation_1 = __importDefault(require("../utils/startDbOperation"));
const tryStartLocalTransactionIfNeeded_1 = __importDefault(require("../sql/operations/transaction/tryStartLocalTransactionIfNeeded"));
const tryExecutePostHook_1 = __importDefault(require("../hooks/tryExecutePostHook"));
const isBackkError_1 = __importDefault(require("../../errors/isBackkError"));
const createBackkErrorFromError_1 = __importDefault(require("../../errors/createBackkErrorFromError"));
const cleanupLocalTransactionIfNeeded_1 = __importDefault(require("../sql/operations/transaction/cleanupLocalTransactionIfNeeded"));
const recordDbOperationDuration_1 = __importDefault(require("../utils/recordDbOperationDuration"));
const mongodb_1 = require("mongodb");
const MongoDbQuery_1 = __importDefault(require("./MongoDbQuery"));
const getRootOperations_1 = __importDefault(require("./getRootOperations"));
const convertMongoDbQueriesToMatchExpression_1 = __importDefault(require("./convertMongoDbQueriesToMatchExpression"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const replaceIdStringsWithObjectIds_1 = __importDefault(require("./replaceIdStringsWithObjectIds"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const SqlExpression_1 = __importDefault(require("../sql/expressions/SqlExpression"));
const convertFilterObjectToMongoDbQueries_1 = __importDefault(require("./convertFilterObjectToMongoDbQueries"));
const convertUserDefinedFiltersToMatchExpression_1 = __importDefault(require("./convertUserDefinedFiltersToMatchExpression"));
async function removeSimpleSubEntityByIdFromEntityByFilters(dbManager, filters, subEntityPath, subEntityId, EntityClass, options) {
    const dbOperationStartTimeInMillis = startDbOperation_1.default(dbManager, 'removeSubEntitiesByIdWhere');
    EntityClass = dbManager.getType(EntityClass);
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
    let shouldUseTransaction = false;
    try {
        shouldUseTransaction = await tryStartLocalTransactionIfNeeded_1.default(dbManager);
        return await dbManager.tryExecute(shouldUseTransaction, async (client) => {
            var _a;
            if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
                const [currentEntity, error] = await dbManager.getEntityByFilters(EntityClass, filters, undefined, true);
                if (!currentEntity) {
                    throw error;
                }
                await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
            }
            const entityPropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
            let versionUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.version) {
                versionUpdate = { $inc: { version: 1 } };
            }
            let lastModifiedTimestampUpdate = {};
            if (entityPropertyNameToPropertyTypeNameMap.lastModifiedTimestamp) {
                lastModifiedTimestampUpdate = { $set: { lastModifiedTimestamp: new Date() } };
            }
            const isManyToMany = typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, subEntityPath);
            const isMongoIdString = isNaN(parseInt(subEntityId, 10)) && subEntityId.length === 24;
            const pullCondition = isManyToMany
                ? { [subEntityPath]: subEntityId }
                : {
                    [subEntityPath]: {
                        [`${isMongoIdString ? '_id' : 'id'}`]: isMongoIdString ? new mongodb_1.ObjectId(subEntityId) : subEntityId
                    }
                };
            await client
                .db(dbManager.dbName)
                .collection(EntityClass.name.toLowerCase())
                .updateOne(matchExpression, { ...versionUpdate, ...lastModifiedTimestampUpdate, $pull: pullCondition });
            if (options === null || options === void 0 ? void 0 : options.postHook) {
                await tryExecutePostHook_1.default(options.postHook, null);
            }
            return [null, null];
        });
    }
    catch (errorOrBackkError) {
        return isBackkError_1.default(errorOrBackkError)
            ? [null, errorOrBackkError]
            : [null, createBackkErrorFromError_1.default(errorOrBackkError)];
    }
    finally {
        cleanupLocalTransactionIfNeeded_1.default(shouldUseTransaction, dbManager);
        recordDbOperationDuration_1.default(dbManager, dbOperationStartTimeInMillis);
    }
}
exports.default = removeSimpleSubEntityByIdFromEntityByFilters;
//# sourceMappingURL=removeSimpleSubEntityByIdFromEntityByFilters.js.map