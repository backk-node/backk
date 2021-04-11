"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transformRowsToObjects_1 = __importDefault(require("./transformresults/transformRowsToObjects"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getSqlSelectStatementParts_1 = __importDefault(require("./utils/getSqlSelectStatementParts"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const cls_hooked_1 = require("cls-hooked");
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../../../../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const DefaultPostQueryOperations_1 = __importDefault(require("../../../../types/postqueryoperations/DefaultPostQueryOperations"));
async function getEntitiesByIds(dbManager, _ids, EntityClass, postQueryOperations) {
    var _a, _b, _c;
    try {
        updateDbLocalTransactionCount_1.default(dbManager);
        let isSelectForUpdate = false;
        if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = dbManager.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = dbManager.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
            isSelectForUpdate = true;
        }
        const { rootSortClause, rootPaginationClause, columns, joinClauses, outerSortClause } = getSqlSelectStatementParts_1.default(dbManager, postQueryOperations !== null && postQueryOperations !== void 0 ? postQueryOperations : new DefaultPostQueryOperations_1.default(), EntityClass);
        const numericIds = _ids.map((id) => {
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) {
                throw createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                    message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + ' all _ids must be numeric values'
                });
            }
            return numericId;
        });
        const entityMetadata = getClassPropertyNameToPropertyTypeNameMap_1.default(EntityClass);
        const idFieldName = entityMetadata._id ? '_id' : 'id';
        const idPlaceholders = _ids.map((_, index) => dbManager.getValuePlaceholder(index + 1)).join(', ');
        const tableName = getTableName_1.default(EntityClass.name);
        const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();
        const selectStatement = [
            `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName} WHERE ${idFieldName} IN (${idPlaceholders})`,
            rootSortClause,
            rootPaginationClause,
            `) AS ${tableAlias}`,
            joinClauses,
            outerSortClause,
            isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
        ]
            .filter((sqlPart) => sqlPart)
            .join(' ');
        const result = await dbManager.tryExecuteQuery(selectStatement, numericIds);
        if (dbManager.getResultRows(result).length === 0) {
            return [null, createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                    message: `${EntityClass.name}s with _ids: ${_ids.join(', ')} not found`
                })];
        }
        const entities = transformRowsToObjects_1.default(dbManager.getResultRows(result), EntityClass, postQueryOperations !== null && postQueryOperations !== void 0 ? postQueryOperations : new DefaultPostQueryOperations_1.default(), dbManager);
        return [entities, null];
    }
    catch (error) {
        return [null, createBackkErrorFromError_1.default(error)];
    }
}
exports.default = getEntitiesByIds;
//# sourceMappingURL=getEntitiesByIds.js.map