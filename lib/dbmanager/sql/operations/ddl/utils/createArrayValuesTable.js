"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function createArrayValuesTable(schema, entityName, fieldName, sqlColumnType, dbManager) {
    const foreignIdFieldName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Id';
    const arrayValueFieldName = fieldName.slice(0, -1);
    const arrayValuesTableName = entityName + '_' + arrayValueFieldName;
    try {
        await dbManager.tryExecuteSqlWithoutCls(`SELECT * FROM ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${arrayValuesTableName.toLowerCase()}`, undefined, false);
    }
    catch {
        let createAdditionalTableStatement = `CREATE TABLE ${schema === null || schema === void 0 ? void 0 : schema.toLowerCase()}.${arrayValuesTableName.toLowerCase()} (`;
        createAdditionalTableStatement +=
            'id BIGINT, ' +
                foreignIdFieldName.toLowerCase() +
                ' BIGINT, ' +
                arrayValueFieldName.toLowerCase() +
                ' ' +
                sqlColumnType +
                ', PRIMARY KEY(' +
                foreignIdFieldName.toLowerCase() +
                ', id), FOREIGN KEY(' +
                foreignIdFieldName.toLowerCase() +
                ') REFERENCES ' + (schema === null || schema === void 0 ? void 0 : schema.toLowerCase()) +
                '.' +
                foreignIdFieldName.toLowerCase().slice(0, -2) +
                '(_id))';
        await dbManager.tryExecuteSqlWithoutCls(createAdditionalTableStatement);
    }
}
exports.default = createArrayValuesTable;
//# sourceMappingURL=createArrayValuesTable.js.map