"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../../../../decorators/entity/entityAnnotationContainer"));
async function tryCreateIndex(dbManager, indexName, schema, indexFields, isUnique = false) {
    const indexUsingOption = entityAnnotationContainer_1.default.indexNameToUsingOptionMap[indexName];
    const additionalSqlCreateIndexStatementOptions = entityAnnotationContainer_1.default.indexNameToAdditionalSqlCreateIndexStatementOptionsMap[indexName];
    const lowerCaseIndexFields = indexFields.map(indexField => indexField.toLowerCase());
    const sortOrderStr = indexFields.length === 1 ? entityAnnotationContainer_1.default.indexNameToSortOrderMap[indexName] : '';
    try {
        const createIndexStatement = `CREATE ${isUnique ? 'UNIQUE' : ''}INDEX ${indexName.replace(':', '_').toLowerCase()} ON ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${indexName.split(':')[0].toLowerCase()} ${indexUsingOption ? 'USING ' + indexUsingOption : ''}(${lowerCaseIndexFields.join(', ')} ${sortOrderStr}) ${additionalSqlCreateIndexStatementOptions !== null && additionalSqlCreateIndexStatementOptions !== void 0 ? additionalSqlCreateIndexStatementOptions : ''}`;
        await dbManager.tryExecuteSqlWithoutCls(createIndexStatement, undefined, false, true);
    }
    catch (error) {
    }
}
exports.default = tryCreateIndex;
//# sourceMappingURL=tryCreateIndex.js.map