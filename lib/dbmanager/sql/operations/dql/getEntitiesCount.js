"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getSqlSelectStatementParts_1 = __importDefault(require("./utils/getSqlSelectStatementParts"));
const DefaultPostQueryOperations_1 = __importDefault(require("../../../../types/postqueryoperations/DefaultPostQueryOperations"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
const MongoDbQuery_1 = __importDefault(require("../../../mongodb/MongoDbQuery"));
const convertFilterObjectToSqlEquals_1 = __importDefault(require("./utils/convertFilterObjectToSqlEquals"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
async function getEntitiesCount(dbManager, filters, EntityClass) {
    if (typeof filters === 'object' && !Array.isArray(filters)) {
        filters = convertFilterObjectToSqlEquals_1.default(filters);
    }
    else if (filters === null || filters === void 0 ? void 0 : filters.find((filter) => filter instanceof MongoDbQuery_1.default)) {
        throw new Error('filters must be an array of SqlExpressions and/or UserDefinedFilters');
    }
    updateDbLocalTransactionCount_1.default(dbManager);
    EntityClass = dbManager.getType(EntityClass);
    try {
        const { rootWhereClause, filterValues } = getSqlSelectStatementParts_1.default(dbManager, new DefaultPostQueryOperations_1.default(), EntityClass, filters);
        const tableName = getTableName_1.default(EntityClass.name);
        const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();
        const sqlStatement = [
            `SELECT COUNT(*) as count FROM ${dbManager.schema}.${tableName} AS ${tableAlias}`,
            rootWhereClause
        ]
            .filter((sqlPart) => sqlPart)
            .join(' ');
        const result = await dbManager.tryExecuteQueryWithNamedParameters(sqlStatement, filterValues);
        const entityCount = dbManager.getResultRows(result)[0].count;
        return [entityCount, null];
    }
    catch (error) {
        return [null, createBackkErrorFromError_1.default(error)];
    }
}
exports.default = getEntitiesCount;
//# sourceMappingURL=getEntitiesCount.js.map