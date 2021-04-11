"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../../decorators/typeproperty/typePropertyAnnotationContainer"));
const DefaultPostQueryOperations_1 = __importDefault(require("../../types/postqueryoperations/DefaultPostQueryOperations"));
const forEachAsyncParallel_1 = __importDefault(require("../../utils/forEachAsyncParallel"));
const getTypeInfoForTypeName_1 = __importDefault(require("../../utils/type/getTypeInfoForTypeName"));
const mongodb_1 = require("mongodb");
const isEntityTypeName_1 = __importDefault(require("../../utils/type/isEntityTypeName"));
const jsonpath_plus_1 = require("jsonpath-plus");
const MongoDbQuery_1 = __importDefault(require("./MongoDbQuery"));
const replaceSubEntityPaths_1 = __importDefault(require("./replaceSubEntityPaths"));
const replaceFieldPathNames_1 = __importDefault(require("./replaceFieldPathNames"));
const getProjection_1 = __importDefault(require("./getProjection"));
const getRootProjection_1 = __importDefault(require("./getRootProjection"));
const getEntitiesByFilters_1 = __importDefault(require("./operations/dql/getEntitiesByFilters"));
async function tryFetchAndAssignSubEntitiesForManyToManyRelationships(dbManager, rows, EntityClass, Types, filters, postQueryOperations, isInternalCall = false, propertyJsonPath = '$.', subEntityPath = '') {
    const entityPropertyNameToPropertyTypeMap = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
    const projection = getProjection_1.default(EntityClass, postQueryOperations);
    const rootProjection = getRootProjection_1.default(projection, EntityClass, Types);
    await forEachAsyncParallel_1.default(Object.entries(entityPropertyNameToPropertyTypeMap), async ([propertyName, propertyTypeName]) => {
        if (typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(EntityClass, propertyName)) {
            const wantedSubEntityPath = subEntityPath ? subEntityPath + '.' + propertyName : propertyName;
            let foundProjection = !!Object.keys(projection).find((fieldPathName) => {
                if (fieldPathName.includes('.')) {
                    return fieldPathName.startsWith(wantedSubEntityPath);
                }
                return false;
            });
            if (!foundProjection) {
                if (rootProjection[propertyName] === 1) {
                    foundProjection = true;
                }
            }
            if (!foundProjection) {
                return;
            }
            await forEachAsyncParallel_1.default(rows, async (row) => {
                const [subEntityIds] = jsonpath_plus_1.JSONPath({
                    json: row,
                    path: propertyJsonPath + propertyName
                });
                const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
                let subEntityFilters = replaceSubEntityPaths_1.default(filters, wantedSubEntityPath);
                subEntityFilters = subEntityFilters.map((subEntityFilter) => {
                    if ('filterQuery' in subEntityFilter) {
                        return new MongoDbQuery_1.default(subEntityFilter.filterQuery, subEntityFilter.subEntityPath);
                    }
                    return subEntityFilter;
                });
                const finalPostQueryOperations = postQueryOperations !== null && postQueryOperations !== void 0 ? postQueryOperations : new DefaultPostQueryOperations_1.default();
                const subEntitySortBys = replaceSubEntityPaths_1.default(finalPostQueryOperations.sortBys, wantedSubEntityPath);
                const subEntityPaginations = replaceSubEntityPaths_1.default(finalPostQueryOperations.paginations, wantedSubEntityPath);
                const subEntityIncludeResponseFields = replaceFieldPathNames_1.default(finalPostQueryOperations.includeResponseFields, wantedSubEntityPath);
                const subEntityExcludeResponseFields = replaceFieldPathNames_1.default(finalPostQueryOperations.excludeResponseFields, wantedSubEntityPath);
                const [subEntities, error] = await getEntitiesByFilters_1.default(dbManager, [
                    new MongoDbQuery_1.default({
                        _id: { $in: (subEntityIds !== null && subEntityIds !== void 0 ? subEntityIds : []).map((subEntityId) => new mongodb_1.ObjectId(subEntityId)) }
                    }),
                    ...(subEntityFilters !== null && subEntityFilters !== void 0 ? subEntityFilters : [])
                ], Types[baseTypeName], { postQueryOperations: {
                        includeResponseFields: subEntityIncludeResponseFields,
                        excludeResponseFields: subEntityExcludeResponseFields,
                        sortBys: subEntitySortBys,
                        paginations: subEntityPaginations
                    } }, true, isInternalCall);
                if (error) {
                    throw error;
                }
                const [subEntitiesParent] = jsonpath_plus_1.JSONPath({ json: row, path: propertyJsonPath + propertyName + '^' });
                if (subEntitiesParent) {
                    subEntitiesParent[propertyName] = subEntities;
                }
            });
        }
        const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
        const SubEntityClass = Types[baseTypeName];
        if (isEntityTypeName_1.default(baseTypeName)) {
            await tryFetchAndAssignSubEntitiesForManyToManyRelationships(dbManager, rows, SubEntityClass, Types, filters, postQueryOperations, isInternalCall, propertyJsonPath + propertyName + '[*].', subEntityPath + propertyName);
        }
    });
}
exports.default = tryFetchAndAssignSubEntitiesForManyToManyRelationships;
//# sourceMappingURL=tryFetchAndAssignSubEntitiesForManyToManyRelationships.js.map