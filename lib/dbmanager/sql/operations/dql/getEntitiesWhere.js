"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shouldUseRandomInitializationVector_1 = __importDefault(require("../../../../crypt/shouldUseRandomInitializationVector"));
const shouldEncryptValue_1 = __importDefault(require("../../../../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../../../../crypt/encrypt"));
const transformRowsToObjects_1 = __importDefault(require("./transformresults/transformRowsToObjects"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getSqlSelectStatementParts_1 = __importDefault(require("./utils/getSqlSelectStatementParts"));
const updateDbLocalTransactionCount_1 = __importDefault(require("./utils/updateDbLocalTransactionCount"));
const isUniqueField_1 = __importDefault(require("./utils/isUniqueField"));
const SqlEquals_1 = __importDefault(require("../../expressions/SqlEquals"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
const createBackkErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const cls_hooked_1 = require("cls-hooked");
const DefaultPostQueryOperations_1 = __importDefault(require("../../../../types/postqueryoperations/DefaultPostQueryOperations"));
async function getEntitiesWhere(dbManager, fieldPathName, fieldValue, EntityClass, postQueryOperations) {
    var _a, _b, _c;
    if (!isUniqueField_1.default(fieldPathName, EntityClass, dbManager.getTypes())) {
        throw new Error(`Field ${fieldPathName} is not unique. Annotate entity field with @Unique annotation`);
    }
    EntityClass = dbManager.getType(EntityClass);
    try {
        updateDbLocalTransactionCount_1.default(dbManager);
        let isSelectForUpdate = false;
        if (((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) || ((_b = dbManager.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) || ((_c = dbManager.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
            isSelectForUpdate = true;
        }
        let finalFieldValue = fieldValue;
        const lastDotPosition = fieldPathName.lastIndexOf('.');
        const fieldName = lastDotPosition === -1 ? fieldPathName : fieldPathName.slice(lastDotPosition + 1);
        if (!shouldUseRandomInitializationVector_1.default(fieldName) && shouldEncryptValue_1.default(fieldName)) {
            finalFieldValue = encrypt_1.default(fieldValue, false);
        }
        const filters = [
            new SqlEquals_1.default({ [fieldName]: finalFieldValue }, lastDotPosition === -1 ? '' : fieldPathName.slice(0, lastDotPosition))
        ];
        const { rootWhereClause, rootSortClause, rootPaginationClause, columns, joinClauses, filterValues, outerSortClause } = getSqlSelectStatementParts_1.default(dbManager, postQueryOperations !== null && postQueryOperations !== void 0 ? postQueryOperations : new DefaultPostQueryOperations_1.default(), EntityClass, filters);
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
        if (dbManager.getResultRows(result).length === 0) {
            return [
                null,
                createBackkErrorFromErrorCodeMessageAndStatus_1.default({
                    ...backkErrors_1.BACKK_ERRORS.ENTITY_NOT_FOUND,
                    message: `${EntityClass.name} with ${fieldName}: ${fieldValue} not found`
                })
            ];
        }
        const entities = transformRowsToObjects_1.default(dbManager.getResultRows(result), EntityClass, postQueryOperations !== null && postQueryOperations !== void 0 ? postQueryOperations : new DefaultPostQueryOperations_1.default(), dbManager);
        return [entities, null];
    }
    catch (error) {
        return [null, createBackkErrorFromError_1.default(error)];
    }
}
exports.default = getEntitiesWhere;
//# sourceMappingURL=getEntitiesWhere.js.map