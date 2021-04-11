"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createErrorFromErrorCodeMessageAndStatus_1 = __importDefault(require("../../../../errors/createErrorFromErrorCodeMessageAndStatus"));
const backkErrors_1 = require("../../../../errors/backkErrors");
const isBackkError_1 = __importDefault(require("../../../../errors/isBackkError"));
const createBackkErrorFromError_1 = __importDefault(require("../../../../errors/createBackkErrorFromError"));
const getTableName_1 = __importDefault(require("../../../utils/getTableName"));
async function doesEntityArrayFieldContainValue(dbManager, EntityClass, _id, fieldName, fieldValue) {
    if (fieldName.includes('.')) {
        throw new Error('fieldName parameter may not contain dots, i.e. it cannot be a field path name');
    }
    EntityClass = dbManager.getType(EntityClass);
    try {
        const foreignIdFieldName = EntityClass.name.charAt(0).toLowerCase() + EntityClass.name.slice(1) + 'Id';
        const numericId = parseInt(_id, 10);
        if (isNaN(numericId)) {
            throw createErrorFromErrorCodeMessageAndStatus_1.default({
                ...backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT,
                message: backkErrors_1.BACKK_ERRORS.INVALID_ARGUMENT.message + '_id: must be a numeric id'
            });
        }
        const tableName = getTableName_1.default(EntityClass.name);
        const selectStatement = `SELECT COUNT(*) as count FROM ${dbManager.schema.toLowerCase()}.${tableName +
            '_' +
            fieldName
                .slice(0, -1)
                .toLowerCase()} WHERE ${foreignIdFieldName.toLowerCase()} = ${dbManager.getValuePlaceholder(1)} AND ${fieldName.slice(0, -1).toLowerCase()} = ${dbManager.getValuePlaceholder(2)}`;
        const result = await dbManager.tryExecuteQuery(selectStatement, [numericId, fieldValue]);
        const entityCount = dbManager.getResultRows(result)[0].count;
        return [entityCount >= 1, null];
    }
    catch (errorOrBackkError) {
        return [
            null,
            isBackkError_1.default(errorOrBackkError) ? errorOrBackkError : createBackkErrorFromError_1.default(errorOrBackkError)
        ];
    }
}
exports.default = doesEntityArrayFieldContainValue;
//# sourceMappingURL=doesEntityArrayFieldContainValue.js.map