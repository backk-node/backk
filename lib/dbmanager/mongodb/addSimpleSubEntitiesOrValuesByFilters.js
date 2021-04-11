"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryExecuteEntityPreHooks_1 = __importDefault(require("../hooks/tryExecuteEntityPreHooks"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const constants_1 = require("../../constants/constants");
const MongoDbQuery_1 = __importDefault(require("./MongoDbQuery"));
const SqlExpression_1 = __importDefault(require("../sql/expressions/SqlExpression"));
const convertFilterObjectToMongoDbQueries_1 = __importDefault(require("./convertFilterObjectToMongoDbQueries"));
const getRootOperations_1 = __importDefault(require("./getRootOperations"));
const convertUserDefinedFiltersToMatchExpression_1 = __importDefault(require("./convertUserDefinedFiltersToMatchExpression"));
const convertMongoDbQueriesToMatchExpression_1 = __importDefault(require("./convertMongoDbQueriesToMatchExpression"));
const replaceIdStringsWithObjectIds_1 = __importDefault(require("./replaceIdStringsWithObjectIds"));
async function addSimpleSubEntitiesOrValuesByFilters(client, dbManager, filters, subEntityPath, newSubEntities, EntityClass, options) {
    var _a;
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
    if (options === null || options === void 0 ? void 0 : options.entityPreHooks) {
        let [currentEntity, error] = await dbManager.getEntityByFilters(EntityClass, filters, undefined, true, true);
        if ((error === null || error === void 0 ? void 0 : error.statusCode) === constants_1.HttpStatusCodes.NOT_FOUND && (options === null || options === void 0 ? void 0 : options.ifEntityNotFoundUse)) {
            [currentEntity, error] = await options.ifEntityNotFoundUse();
        }
        if (!currentEntity) {
            return [null, error];
        }
        await tryExecuteEntityPreHooks_1.default((_a = options === null || options === void 0 ? void 0 : options.entityPreHooks) !== null && _a !== void 0 ? _a : [], currentEntity);
    }
    if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, subEntityPath)) {
        newSubEntities = newSubEntities.map((subEntity) => subEntity._id);
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
    await client
        .db(dbManager.dbName)
        .collection(EntityClass.name.toLowerCase())
        .updateOne(matchExpression, {
        ...versionUpdate,
        ...lastModifiedTimestampUpdate,
        $push: { [subEntityPath]: { $each: newSubEntities } }
    });
    return [null, null];
}
exports.default = addSimpleSubEntitiesOrValuesByFilters;
//# sourceMappingURL=addSimpleSubEntitiesOrValuesByFilters.js.map