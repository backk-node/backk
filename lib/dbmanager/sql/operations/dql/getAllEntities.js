"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transformRowsToObjects_1 = __importDefault(require("./transformresults/transformRowsToObjects"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getSqlSelectStatementParts_1 = __importDefault(require("./utils/getSqlSelectStatementParts"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
const DefaultPostQueryOperations_1 = __importDefault(require("../../../../types/postqueryoperations/DefaultPostQueryOperations"));
const Pagination_1 = __importDefault(require("../../../../types/postqueryoperations/Pagination"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
const cls_hooked_1 = require("cls-hooked");
async function getAllEntities(dbManager, EntityClass, postQueryOperations) {
    var _a, _b, _c;
    updateDbLocalTransactionCount_1.default(dbManager);
    EntityClass = dbManager.getType(EntityClass);
    const finalPostQueryOperations = postQueryOperations !== null && postQueryOperations !== void 0 ? postQueryOperations : {
        ...new DefaultPostQueryOperations_1.default(),
        paginations: [new Pagination_1.default('', 1, Number.MAX_SAFE_INTEGER)]
    };
    try {
        let isSelectForUpdate = false;
        if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = dbManager.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = dbManager.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
            isSelectForUpdate = true;
        }
        const { columns, joinClauses, rootSortClause, outerSortClause } = getSqlSelectStatementParts_1.default(dbManager, finalPostQueryOperations, EntityClass);
        const tableName = getTableName_1.default(EntityClass.name);
        const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();
        const selectStatement = [
            `SELECT ${columns} FROM (SELECT * FROM ${dbManager.schema}.${tableName}`,
            rootSortClause,
            `) AS ${tableAlias}`,
            joinClauses,
            outerSortClause,
            isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
        ]
            .filter((sqlPart) => sqlPart)
            .join(' ');
        const result = await dbManager.tryExecuteQuery(selectStatement);
        const entities = transformRowsToObjects_1.default(dbManager.getResultRows(result), EntityClass, finalPostQueryOperations, dbManager);
        return [entities, null];
    }
    catch (error) {
        return [null, createBackkErrorFromError_1.default(error)];
    }
}
exports.default = getAllEntities;
//# sourceMappingURL=getAllEntities.js.map